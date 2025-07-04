/**
 * Color Scaling and Interpolation Utilities
 * Provides color mapping functions for data visualization
 */

import { createError } from './errorHandling';

/**
 * Color scale types supported by the visualization engine
 */
export type ColorScaleType = 
  | 'sequential' 
  | 'diverging' 
  | 'categorical' 
  | 'ordinal'
  | 'quantile'
  | 'threshold';

/**
 * Predefined color palettes for different data types
 */
export const COLOR_PALETTES = {
  // Sequential scales (for continuous data)
  sequential: {
    blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'] as string[],
    greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'] as string[],
    reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'] as string[],
    oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'] as string[],
    purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'] as string[],
    greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'] as string[]
  },
  
  // Diverging scales (for data with neutral midpoint)
  diverging: {
    redBlue: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'] as string[],
    redYellowBlue: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] as string[],
    brownBlueGreen: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'] as string[],
    pinkGreen: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'] as string[]
  },
  
  // Categorical scales (for discrete categories)
  categorical: {
    set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'] as string[],
    set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'] as string[],
    set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'] as string[],
    pastel: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'] as string[],
    viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'] as string[]
  }
} as const;

/**
 * Color scale configuration
 */
export interface ColorScaleConfig {
  type: ColorScaleType;
  palette: string;
  domain?: [number, number] | number[];
  range?: string[];
  interpolation?: 'linear' | 'log' | 'sqrt' | 'pow';
  exponent?: number;
  clamp?: boolean;
  reverse?: boolean;
  nullColor?: string;
}

/**
 * Default color scale configurations for common data types
 */
export const DEFAULT_SCALES: Record<string, ColorScaleConfig> = {
  population: {
    type: 'sequential',
    palette: 'blues',
    interpolation: 'sqrt',
    nullColor: '#f0f0f0'
  },
  density: {
    type: 'sequential',
    palette: 'oranges',
    interpolation: 'log',
    nullColor: '#f0f0f0'
  },
  change: {
    type: 'diverging',
    palette: 'redBlue',
    domain: [-1, 1],
    nullColor: '#f0f0f0'
  },
  category: {
    type: 'categorical',
    palette: 'set1',
    nullColor: '#cccccc'
  },
  income: {
    type: 'sequential',
    palette: 'greens',
    interpolation: 'linear',
    nullColor: '#f0f0f0'
  },
  temperature: {
    type: 'diverging',
    palette: 'redYellowBlue',
    domain: [-20, 20],
    nullColor: '#f0f0f0'
  }
};

/**
 * Color scale class for mapping data values to colors
 */
export class ColorScale {
  private config: ColorScaleConfig;
  private domain: number[];
  private range: string[];
  
  constructor(config: ColorScaleConfig) {
    this.config = { ...config };
    this.range = this.getColorRange();
    this.domain = this.getDomain();
  }

  /**
   * Map a data value to a color
   */
  public getColor(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) {
      return this.config.nullColor || '#f0f0f0';
    }

    if (this.config.type === 'categorical') {
      return this.getCategoricalColor(value);
    }

    if (this.config.type === 'threshold') {
      return this.getThresholdColor(value);
    }

    return this.getContinuousColor(value);
  }

  /**
   * Get color for categorical data
   */
  private getCategoricalColor(value: number): string {
    const index = Math.floor(value) % this.range.length;
    return this.range[index];
  }

  /**
   * Get color for threshold-based data
   */
  private getThresholdColor(value: number): string {
    for (let i = 0; i < this.domain.length - 1; i++) {
      if (value <= this.domain[i]) {
        return this.range[i];
      }
    }
    return this.range[this.range.length - 1];
  }

  /**
   * Get color for continuous data
   */
  private getContinuousColor(value: number): string {
    let normalizedValue = this.normalizeValue(value);
    
    if (this.config.clamp) {
      normalizedValue = Math.max(0, Math.min(1, normalizedValue));
    }

    return this.interpolateColor(normalizedValue);
  }

  /**
   * Normalize value to [0, 1] range
   */
  private normalizeValue(value: number): number {
    const [min, max] = this.domain;
    if (min === max) return 0;

    let normalized = (value - min) / (max - min);

    // Apply interpolation transform
    switch (this.config.interpolation) {
      case 'log':
        if (value <= 0) return 0;
        const logMin = Math.log(Math.max(min, 0.001));
        const logMax = Math.log(Math.max(max, 0.001));
        const logValue = Math.log(value);
        normalized = (logValue - logMin) / (logMax - logMin);
        break;
      case 'sqrt':
        normalized = Math.sqrt(normalized);
        break;
      case 'pow':
        normalized = Math.pow(normalized, this.config.exponent || 2);
        break;
      default:
        // linear - no transformation needed
        break;
    }

    return this.config.reverse ? 1 - normalized : normalized;
  }

  /**
   * Interpolate color based on normalized value
   */
  private interpolateColor(t: number): string {
    if (t <= 0) return this.range[0];
    if (t >= 1) return this.range[this.range.length - 1];

    const scaledIndex = t * (this.range.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.ceil(scaledIndex);
    
    if (lowerIndex === upperIndex) {
      return this.range[lowerIndex];
    }

    const localT = scaledIndex - lowerIndex;
    return this.interpolateBetweenColors(
      this.range[lowerIndex],
      this.range[upperIndex],
      localT
    );
  }

  /**
   * Interpolate between two hex colors
   */
  private interpolateBetweenColors(color1: string, color2: string, t: number): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex color
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Get the color range for the current palette
   */
  private getColorRange(): string[] {
    if (this.config.range) {
      return this.config.range;
    }

    const paletteGroup = this.getPaletteGroup();
    const palette = COLOR_PALETTES[paletteGroup]?.[this.config.palette as keyof typeof COLOR_PALETTES[typeof paletteGroup]];
    
    if (!palette) {
      createError(
        `Unknown color palette: ${this.config.palette}`,
        { source: 'colorScales', function: 'getColorRange' },
        'medium'
      );
      return COLOR_PALETTES.sequential.blues;
    }

    return palette as string[];
  }

  /**
   * Get the palette group based on scale type
   */
  private getPaletteGroup(): keyof typeof COLOR_PALETTES {
    switch (this.config.type) {
      case 'diverging':
        return 'diverging';
      case 'categorical':
      case 'ordinal':
        return 'categorical';
      default:
        return 'sequential';
    }
  }

  /**
   * Get the domain for the scale
   */
  private getDomain(): number[] {
    if (this.config.domain) {
      return Array.isArray(this.config.domain) ? this.config.domain : [this.config.domain[0], this.config.domain[1]];
    }
    return [0, 1]; // Default domain
  }

  /**
   * Update the scale domain based on data
   */
  public updateDomain(data: (number | null)[]): void {
    const validValues = data.filter((v): v is number => v !== null && !isNaN(v));
    
    if (validValues.length === 0) {
      this.domain = [0, 1];
      return;
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (this.config.type === 'diverging' && !this.config.domain) {
      // For diverging scales, center around zero if no domain specified
      const absMax = Math.max(Math.abs(min), Math.abs(max));
      this.domain = [-absMax, absMax];
    } else if (this.config.type === 'quantile') {
      // For quantile scales, use quantile breaks
      this.domain = this.calculateQuantiles(validValues, this.range.length);
    } else if (!this.config.domain) {
      this.domain = [min, max];
    }
  }

  /**
   * Calculate quantile breaks for the data
   */
  private calculateQuantiles(values: number[], numQuantiles: number): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const quantiles: number[] = [];
    
    for (let i = 0; i <= numQuantiles; i++) {
      const index = (i / numQuantiles) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      if (upper >= sorted.length) {
        quantiles.push(sorted[sorted.length - 1]);
      } else {
        quantiles.push(sorted[lower] * (1 - weight) + sorted[upper] * weight);
      }
    }
    
    return quantiles;
  }

  /**
   * Get legend information for this scale
   */
  public getLegendInfo(steps: number = 5): Array<{ value: number | string; color: string; label: string }> {
    const legend: Array<{ value: number | string; color: string; label: string }> = [];

    if (this.config.type === 'categorical') {
      this.range.forEach((color, index) => {
        legend.push({
          value: index,
          color,
          label: `Category ${index + 1}`
        });
      });
      return legend;
    }

    const [min, max] = this.domain;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const value = min + (max - min) * t;
      const color = this.getColor(value);
      
      legend.push({
        value,
        color,
        label: this.formatValue(value)
      });
    }

    return legend;
  }

  /**
   * Format a numeric value for display
   */
  private formatValue(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (value % 1 === 0) {
      return value.toString();
    } else {
      return value.toFixed(1);
    }
  }
}

/**
 * Create a color scale from a configuration
 */
export function createColorScale(config: ColorScaleConfig): ColorScale {
  return new ColorScale(config);
}

/**
 * Create a color scale for a specific data type
 */
export function createColorScaleForDataType(dataType: string, customConfig?: Partial<ColorScaleConfig>): ColorScale {
  const baseConfig = DEFAULT_SCALES[dataType] || DEFAULT_SCALES.population;
  const config = { ...baseConfig, ...customConfig };
  return new ColorScale(config);
}

/**
 * Auto-detect appropriate color scale type based on data characteristics
 */
export function detectColorScaleType(data: (number | null)[]): ColorScaleType {
  const validValues = data.filter((v): v is number => v !== null && !isNaN(v));
  
  if (validValues.length === 0) {
    return 'sequential';
  }

  const uniqueValues = new Set(validValues);
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const hasNegatives = min < 0;
  const hasPositives = max > 0;

  // If few unique values and all integers, likely categorical
  if (uniqueValues.size <= 10 && validValues.every(v => Number.isInteger(v))) {
    return 'categorical';
  }

  // If data spans zero with both negatives and positives, diverging
  if (hasNegatives && hasPositives && Math.abs(min) > max * 0.1 && Math.abs(max) > Math.abs(min) * 0.1) {
    return 'diverging';
  }

  // Default to sequential
  return 'sequential';
}

/**
 * Generate color scale suggestions based on data
 */
export function suggestColorScale(
  data: (number | null)[],
  dataType?: string
): ColorScaleConfig[] {
  const detectedType = detectColorScaleType(data);
  const suggestions: ColorScaleConfig[] = [];

  // Add type-specific suggestions
  if (dataType && DEFAULT_SCALES[dataType]) {
    suggestions.push(DEFAULT_SCALES[dataType]);
  }

  // Add suggestions based on detected type
  const paletteGroup = detectedType === 'diverging' ? 'diverging' : 
                      detectedType === 'categorical' ? 'categorical' : 'sequential';
  
  const palettes = Object.keys(COLOR_PALETTES[paletteGroup]);
  
  palettes.forEach(palette => {
    suggestions.push({
      type: detectedType,
      palette,
      nullColor: '#f0f0f0'
    });
  });

  return suggestions.slice(0, 5); // Limit to top 5 suggestions
}