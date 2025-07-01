/**
 * SCB Data Processing Utilities
 * Helper functions for processing and transforming SCB API data
 */

import { createError } from './errorHandling';
import type {
  Dataset,
  JsonStatDimension,
  JsonStatCategory,
  Table,
  VariableSelection,
  VariablesSelection,
  FolderContentItem,
  ValueMap
} from '../types/scb';
import type { Province } from '../types/geographic';

/**
 * Processed data structure for visualization
 */
export interface ProcessedSCBData {
  values: (number | null)[];
  dimensions: {
    [key: string]: {
      label: string;
      values: Array<{
        code: string;
        label: string;
        index: number;
      }>;
    };
  };
  metadata: {
    title: string;
    source?: string;
    updated?: string;
    unit?: string;
    notes?: string[];
  };
  geographic?: {
    regionCode?: string;
    regionType?: 'province' | 'municipality';
    mappedProvinces?: Array<{
      code: string;
      name: string;
      value: number | null;
    }>;
  };
}

/**
 * Geographic mapping configuration
 */
export interface GeographicMapping {
  scbRegionCode: string;
  provinceCode: string;
  provinceName: string;
  municipalityCode?: string;
  municipalityName?: string;
}

/**
 * Standard Swedish province codes mapping to SCB regions
 */
export const PROVINCE_MAPPING: GeographicMapping[] = [
  { scbRegionCode: '01', provinceCode: 'AB', provinceName: 'Stockholm' },
  { scbRegionCode: '03', provinceCode: 'C', provinceName: 'Uppsala' },
  { scbRegionCode: '04', provinceCode: 'D', provinceName: 'Södermanland' },
  { scbRegionCode: '05', provinceCode: 'E', provinceName: 'Östergötland' },
  { scbRegionCode: '06', provinceCode: 'F', provinceName: 'Jönköping' },
  { scbRegionCode: '07', provinceCode: 'G', provinceName: 'Kronoberg' },
  { scbRegionCode: '08', provinceCode: 'H', provinceName: 'Kalmar' },
  { scbRegionCode: '09', provinceCode: 'I', provinceName: 'Gotland' },
  { scbRegionCode: '10', provinceCode: 'K', provinceName: 'Blekinge' },
  { scbRegionCode: '12', provinceCode: 'M', provinceName: 'Skåne' },
  { scbRegionCode: '13', provinceCode: 'N', provinceName: 'Halland' },
  { scbRegionCode: '14', provinceCode: 'O', provinceName: 'Västra Götaland' },
  { scbRegionCode: '17', provinceCode: 'S', provinceName: 'Värmland' },
  { scbRegionCode: '18', provinceCode: 'T', provinceName: 'Örebro' },
  { scbRegionCode: '19', provinceCode: 'U', provinceName: 'Västmanland' },
  { scbRegionCode: '20', provinceCode: 'W', provinceName: 'Dalarna' },
  { scbRegionCode: '21', provinceCode: 'X', provinceName: 'Gävleborg' },
  { scbRegionCode: '22', provinceCode: 'Y', provinceName: 'Västernorrland' },
  { scbRegionCode: '23', provinceCode: 'Z', provinceName: 'Jämtland' },
  { scbRegionCode: '24', provinceCode: 'AC', provinceName: 'Västerbotten' },
  { scbRegionCode: '25', provinceCode: 'BD', provinceName: 'Norrbotten' }
];

/**
 * Process JSON-stat dataset into structured format for visualization
 */
export function processJsonStatData(dataset: Dataset): ProcessedSCBData {
  try {
    const processed: ProcessedSCBData = {
      values: dataset.value || [],
      dimensions: {},
      metadata: {
        title: dataset.label || 'Unnamed Dataset',
        source: dataset.source,
        updated: dataset.updated,
        notes: dataset.note
      }
    };

    // Process dimensions
    if (dataset.dimension) {
      Object.entries(dataset.dimension).forEach(([dimCode, dimension]) => {
        processed.dimensions[dimCode] = processDimension(dimCode, dimension);
      });
    }

    // Check for geographic data
    const geoInfo = extractGeographicInfo(dataset);
    if (geoInfo) {
      processed.geographic = geoInfo;
    }

    return processed;

  } catch (error) {
    createError(
      'Failed to process JSON-stat data',
      { source: 'scbDataProcessing', function: 'processJsonStatData', data: { error: error instanceof Error ? error.message : 'Unknown error' } },
      'high'
    );
    throw error;
  }
}

/**
 * Process a single dimension from JSON-stat data
 */
function processDimension(code: string, dimension: JsonStatDimension) {
  const result = {
    label: dimension.label || code,
    values: [] as Array<{ code: string; label: string; index: number }>
  };

  if (dimension.category?.index && dimension.category?.label) {
    Object.entries(dimension.category.index).forEach(([valueCode, index]) => {
      result.values.push({
        code: valueCode,
        label: dimension.category?.label?.[valueCode] || valueCode,
        index
      });
    });

    // Sort by index
    result.values.sort((a, b) => a.index - b.index);
  }

  return result;
}

/**
 * Extract geographic information from dataset
 */
function extractGeographicInfo(dataset: Dataset) {
  const geoRoles = dataset.role?.geo;
  if (!geoRoles || geoRoles.length === 0) {
    return null;
  }

  const regionDimension = geoRoles[0];
  const dimension = dataset.dimension?.[regionDimension];
  
  if (!dimension || !dimension.category) {
    return null;
  }

  // Determine region type based on codes
  const sampleCodes = Object.keys(dimension.category.index || {});
  const isProvince = sampleCodes.some(code => 
    PROVINCE_MAPPING.some(mapping => mapping.scbRegionCode === code)
  );

  return {
    regionCode: regionDimension,
    regionType: isProvince ? 'province' as const : 'municipality' as const
  };
}

/**
 * Map SCB data to Swedish provinces for visualization
 */
export function mapDataToProvinces(
  data: ProcessedSCBData,
  provinces: Province[]
): ProcessedSCBData {
  if (!data.geographic || data.geographic.regionType !== 'province') {
    return data;
  }

  const regionDimension = data.dimensions[data.geographic.regionCode!];
  if (!regionDimension) {
    return data;
  }

  const mappedProvinces = provinces.map(province => {
    // Find matching SCB region code
    const mapping = PROVINCE_MAPPING.find(m => 
      m.provinceCode === province.id || 
      m.provinceName.toLowerCase() === province.name.toLowerCase()
    );

    if (!mapping) {
      return {
        code: province.id,
        name: province.name,
        value: null
      };
    }

    // Find the value for this region
    const regionValue = regionDimension.values.find(v => 
      v.code === mapping.scbRegionCode
    );

    let value: number | null = null;
    if (regionValue && data.values) {
      const valueIndex = calculateDataIndex(data, data.geographic.regionCode!, regionValue.index);
      value = data.values[valueIndex] || null;
    }

    return {
      code: province.id,
      name: province.name,
      value
    };
  });

  return {
    ...data,
    geographic: {
      ...data.geographic,
      mappedProvinces
    }
  };
}

/**
 * Calculate the index in the data array for a specific dimension value
 * Based on JSON-stat multidimensional array indexing
 */
function calculateDataIndex(
  data: ProcessedSCBData,
  targetDimension: string,
  targetIndex: number
): number {
  const dimensionKeys = Object.keys(data.dimensions);
  const targetDimIndex = dimensionKeys.indexOf(targetDimension);
  
  if (targetDimIndex === -1) {
    return 0;
  }

  let index = 0;
  let multiplier = 1;

  // Calculate index based on multidimensional array structure
  for (let i = dimensionKeys.length - 1; i >= 0; i--) {
    const dimKey = dimensionKeys[i];
    const dimSize = data.dimensions[dimKey].values.length;
    
    if (i === targetDimIndex) {
      index += targetIndex * multiplier;
    }
    
    if (i > targetDimIndex) {
      multiplier *= dimSize;
    }
  }

  return index;
}

/**
 * Create variable selection for common data queries
 */
export function createVariableSelection(
  variableCode: string,
  values: string[],
  codeList?: string
): VariableSelection {
  return {
    variableCode,
    valueCodes: values,
    codeList
  };
}

/**
 * Create a complete selection for fetching data
 */
export function createDataSelection(selections: VariableSelection[]): VariablesSelection {
  return {
    selection: selections
  };
}

/**
 * Filter tables by criteria
 */
export function filterTables(
  tables: Table[],
  criteria: {
    hasGeographic?: boolean;
    timeRange?: { start?: string; end?: string };
    keywords?: string[];
    categories?: string[];
  }
): Table[] {
  return tables.filter(table => {
    // Check for geographic data
    if (criteria.hasGeographic) {
      const hasRegionalData = table.variableNames.some(name => 
        name.toLowerCase().includes('region') || 
        name.toLowerCase().includes('kommun') ||
        name.toLowerCase().includes('län')
      );
      if (!hasRegionalData) return false;
    }

    // Check time range
    if (criteria.timeRange) {
      if (criteria.timeRange.start && table.firstPeriod && 
          table.firstPeriod < criteria.timeRange.start) return false;
      if (criteria.timeRange.end && table.lastPeriod && 
          table.lastPeriod > criteria.timeRange.end) return false;
    }

    // Check keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
      const tableText = `${table.label} ${table.description || ''}`.toLowerCase();
      const hasKeyword = criteria.keywords.some(keyword => 
        tableText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Check categories
    if (criteria.categories && criteria.categories.length > 0) {
      if (!table.tags || !table.tags.some(tag => 
        criteria.categories!.includes(tag))) return false;
    }

    return true;
  });
}

/**
 * Extract navigation path from folder structure
 */
export function extractNavigationPath(items: FolderContentItem[]): string[] {
  return items
    .filter(item => item.type === 'FolderInformation')
    .map(item => item.label || '')
    .filter(label => label.length > 0);
}

/**
 * Validate SCB data for completeness
 */
export function validateSCBData(data: ProcessedSCBData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required fields
  if (!data.values || data.values.length === 0) {
    errors.push('No data values found');
  }

  if (!data.dimensions || Object.keys(data.dimensions).length === 0) {
    errors.push('No dimensions found');
  }

  // Check for data consistency
  if (data.values && data.dimensions) {
    const expectedSize = Object.values(data.dimensions)
      .reduce((total, dim) => total * dim.values.length, 1);
    
    if (data.values.length !== expectedSize) {
      warnings.push(
        `Data size mismatch: expected ${expectedSize}, got ${data.values.length}`
      );
    }
  }

  // Check for null values
  if (data.values) {
    const nullCount = data.values.filter(v => v === null).length;
    const nullPercentage = (nullCount / data.values.length) * 100;
    
    if (nullPercentage > 50) {
      warnings.push(`High percentage of null values: ${nullPercentage.toFixed(1)}%`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get summary statistics for numeric data
 */
export function getDataSummary(values: (number | null)[]): {
  count: number;
  nullCount: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  sum: number | null;
} {
  const validValues = values.filter((v): v is number => v !== null);
  
  if (validValues.length === 0) {
    return {
      count: 0,
      nullCount: values.length,
      min: null,
      max: null,
      mean: null,
      sum: null
    };
  }

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  
  return {
    count: validValues.length,
    nullCount: values.length - validValues.length,
    min: Math.min(...validValues),
    max: Math.max(...validValues),
    mean: sum / validValues.length,
    sum
  };
}