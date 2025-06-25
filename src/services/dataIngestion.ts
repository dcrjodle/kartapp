/**
 * Generic data ingestion system for processing external data sources
 */

import { DataImport, DataSeries, DataPoint } from '../types/visualization';
import { getProvinceById, getProvinceByName, getProvinceByIsoCode, getProvincesByPostalCode } from '../data/standardized-provinces';
import { createError, withErrorHandling } from '../utils/errorHandling';

export class DataIngestionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DataIngestionError';
  }
}

/**
 * Parse CSV data into structured format
 */
export const parseCSVData = (csvContent: string): any[] => {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw createError(
        'CSV must contain at least a header row and one data row',
        {
          source: 'dataIngestion',
          function: 'parseCSVData',
          data: { lineCount: lines.length, contentLength: csvContent.length },
        },
        'medium'
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    if (headers.length === 0 || headers[0] === '') {
      throw createError(
        'CSV headers are missing or invalid',
        {
          source: 'dataIngestion',
          function: 'parseCSVData',
          data: { headers, firstLine: lines[0] },
        },
        'medium'
      );
    }

    const data = lines.slice(1).map((line, index) => {
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        return row;
      } catch (error) {
        throw createError(
          `Failed to parse CSV row ${index + 2}`,
          {
            source: 'dataIngestion',
            function: 'parseCSVData',
            data: { rowIndex: index + 2, line, headers },
          },
          'medium',
        );
      }
    });

    console.log(`✅ Successfully parsed CSV: ${headers.length} columns, ${data.length} rows`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AppError') {
      throw error; // Re-throw AppErrors
    }
    throw createError(
      `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        source: 'dataIngestion',
        function: 'parseCSVData',
        data: { contentPreview: csvContent.substring(0, 200) },
      },
      'high'
    );
  }
};

/**
 * Validate data import configuration
 */
export const validateDataImport = (dataImport: DataImport): void => {
  if (!dataImport.data || dataImport.data.length === 0) {
    throw new DataIngestionError('No data provided');
  }

  const { mappings } = dataImport;
  const sampleRow = dataImport.data[0];

  if (!sampleRow[mappings.entityId]) {
    throw new DataIngestionError(`Entity ID column '${mappings.entityId}' not found in data`);
  }

  if (!sampleRow[mappings.value]) {
    throw new DataIngestionError(`Value column '${mappings.value}' not found in data`);
  }
};

/**
 * Resolve geographic entity ID from various identifier types
 */
export const resolveEntityId = (identifier: string, type: DataImport['identifierType']): string | null => {
  switch (type) {
    case 'id':
      return getProvinceById(identifier) ? identifier : null;
    
    case 'name':
      return getProvinceByName(identifier)?.id || null;
    
    case 'isoCode':
      return getProvinceByIsoCode(identifier)?.id || null;
    
    case 'postalCode':
      const provinces = getProvincesByPostalCode(identifier);
      return provinces.length === 1 ? provinces[0].id : null;
    
    default:
      return null;
  }
};

/**
 * Process data import into standardized data series
 */
export const processDataImport = (dataImport: DataImport, seriesName: string): DataSeries => {
  validateDataImport(dataImport);

  const dataPoints: DataPoint[] = [];
  const unmatchedEntities: string[] = [];

  dataImport.data.forEach((row, index) => {
    const rawEntityId = row[dataImport.mappings.entityId];
    const rawValue = row[dataImport.mappings.value];

    if (!rawEntityId || rawValue === undefined || rawValue === '') {
      return; // Skip rows with missing required data
    }

    // Resolve entity ID
    const entityId = resolveEntityId(rawEntityId, dataImport.identifierType);
    if (!entityId) {
      unmatchedEntities.push(rawEntityId);
      return;
    }

    // Parse value
    const numericValue = parseFloat(rawValue);
    if (isNaN(numericValue)) {
      throw new DataIngestionError(`Invalid numeric value '${rawValue}' at row ${index + 1}`);
    }

    // Create data point
    const dataPoint: DataPoint = {
      entityId,
      value: numericValue,
      label: dataImport.mappings.label ? row[dataImport.mappings.label] : undefined,
      timestamp: dataImport.mappings.timestamp ? new Date(row[dataImport.mappings.timestamp]) : undefined,
      metadata: {
        sourceRow: index,
        originalEntityId: rawEntityId,
      },
    };

    dataPoints.push(dataPoint);
  });

  // Log unmatched entities for debugging
  if (unmatchedEntities.length > 0) {
    console.warn(`Could not match ${unmatchedEntities.length} entities:`, unmatchedEntities);
  }

  return {
    id: `series-${Date.now()}`,
    name: seriesName,
    data: dataPoints,
    type: 'numeric', // Default to numeric, can be refined later
  };
};

/**
 * Process multiple data formats
 */
export const ingestData = async (file: File, mappings: DataImport['mappings'], identifierType: DataImport['identifierType']): Promise<DataSeries> => {
  return withErrorHandling(
    async () => {
      const fileName = file.name;
      let data: any[];
      let source: DataImport['source'];

      console.log(`📁 Processing file: ${fileName} (${file.size} bytes)`);

      if (fileName.endsWith('.csv')) {
        const content = await file.text();
        data = parseCSVData(content);
        source = 'csv';
      } else if (fileName.endsWith('.json')) {
        const content = await file.text();
        try {
          data = JSON.parse(content);
          if (!Array.isArray(data)) {
            throw createError(
              'JSON file must contain an array of objects',
              {
                source: 'dataIngestion',
                function: 'ingestData',
                data: { fileName, dataType: typeof data },
              },
              'medium'
            );
          }
        } catch (jsonError) {
          throw createError(
            'Invalid JSON format in uploaded file',
            {
              source: 'dataIngestion',
              function: 'ingestData',
              data: { fileName, jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown JSON error' },
            },
            'medium'
          );
        }
        source = 'json';
      } else {
        throw createError(
          `Unsupported file format: ${fileName}`,
          {
            source: 'dataIngestion',
            function: 'ingestData',
            data: { fileName, fileSize: file.size, supportedFormats: ['.csv', '.json'] },
          },
          'medium'
        );
      }

      const dataImport: DataImport = {
        source,
        data,
        mappings,
        identifierType,
      };

      const result = processDataImport(dataImport, fileName);
      console.log(`✅ Successfully processed ${fileName}: ${result.data.length} data points`);
      return result;
    },
    {
      source: 'dataIngestion',
      function: 'ingestData',
      userAction: `upload file: ${file.name}`,
      data: { fileName: file.name, fileSize: file.size, mappings, identifierType },
    }
  ) as Promise<DataSeries>;
};

/**
 * Detect column types for auto-mapping suggestions
 */
export const detectColumnTypes = (data: any[]): Record<string, 'entity' | 'numeric' | 'text' | 'date'> => {
  if (data.length === 0) return {};

  const sampleRow = data[0];
  const suggestions: Record<string, 'entity' | 'numeric' | 'text' | 'date'> = {};

  Object.keys(sampleRow).forEach(column => {
    const values = data.slice(0, Math.min(10, data.length)).map(row => row[column]);
    
    // Check if column contains geographic entities
    const hasGeographicMatch = values.some(value => 
      resolveEntityId(value, 'name') || resolveEntityId(value, 'isoCode')
    );
    
    if (hasGeographicMatch) {
      suggestions[column] = 'entity';
      return;
    }

    // Check if numeric
    const numericValues = values.filter(v => v !== '' && !isNaN(parseFloat(v)));
    if (numericValues.length > values.length * 0.8) {
      suggestions[column] = 'numeric';
      return;
    }

    // Check if date
    const dateValues = values.filter(v => !isNaN(Date.parse(v)));
    if (dateValues.length > values.length * 0.8) {
      suggestions[column] = 'date';
      return;
    }

    // Default to text
    suggestions[column] = 'text';
  });

  return suggestions;
};