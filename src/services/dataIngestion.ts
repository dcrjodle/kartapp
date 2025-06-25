/**
 * Generic data ingestion system for processing external data sources
 */

import { DataImport, DataSeries, DataPoint } from '../types/visualization';
import { getProvinceById, getProvinceByName, getProvinceByIsoCode, getProvincesByPostalCode } from '../data/standardized-provinces';

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
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new DataIngestionError('CSV must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return data;
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
  const fileName = file.name;
  let data: any[];
  let source: DataImport['source'];

  try {
    if (fileName.endsWith('.csv')) {
      const content = await file.text();
      data = parseCSVData(content);
      source = 'csv';
    } else if (fileName.endsWith('.json')) {
      const content = await file.text();
      data = JSON.parse(content);
      source = 'json';
    } else {
      throw new DataIngestionError(`Unsupported file format: ${fileName}`);
    }

    const dataImport: DataImport = {
      source,
      data,
      mappings,
      identifierType,
    };

    return processDataImport(dataImport, fileName);
  } catch (error) {
    if (error instanceof DataIngestionError) {
      throw error;
    }
    throw new DataIngestionError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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