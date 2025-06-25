/**
 * Data visualization contracts and interfaces
 */

export interface DataPoint {
  /** Geographic entity ID this data point belongs to */
  entityId: string;
  /** Numeric value for visualization */
  value: number;
  /** Optional label for display */
  label?: string;
  /** Timestamp if data is time-series */
  timestamp?: Date;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface DataSeries {
  /** Unique identifier for this data series */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this data represents */
  description?: string;
  /** Data points in this series */
  data: DataPoint[];
  /** Unit of measurement */
  unit?: string;
  /** Data type for appropriate visualization */
  type: 'numeric' | 'percentage' | 'category' | 'boolean';
  /** Color scheme for visualization */
  colorScheme?: 'sequential' | 'diverging' | 'categorical';
}

export interface VisualizationConfig {
  /** Type of visualization */
  type: 'choropleth' | 'heatmap' | 'bubble' | 'categorical' | 'temporal';
  /** Color scale configuration */
  colorScale?: {
    /** Color palette to use */
    palette: string[];
    /** Value domain for color mapping */
    domain?: [number, number];
    /** Whether to use logarithmic scale */
    logarithmic?: boolean;
  };
  /** Animation configuration */
  animation?: {
    /** Duration in milliseconds */
    duration: number;
    /** Easing function */
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    /** Delay between elements */
    stagger?: number;
  };
  /** Legend configuration */
  legend?: {
    /** Whether to show legend */
    show: boolean;
    /** Legend position */
    position: 'top' | 'bottom' | 'left' | 'right';
    /** Legend title */
    title?: string;
  };
}

export interface DataVisualization {
  /** Unique identifier */
  id: string;
  /** Human-readable title */
  title: string;
  /** Description of the visualization */
  description?: string;
  /** Data series to visualize */
  series: DataSeries[];
  /** Visualization configuration */
  config: VisualizationConfig;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Generic data import interface
 */
export interface DataImport {
  /** Source type */
  source: 'csv' | 'json' | 'api' | 'excel';
  /** Raw data */
  data: any[];
  /** Column mappings */
  mappings: {
    /** Column containing geographic identifiers */
    entityId: string;
    /** Column containing values */
    value: string;
    /** Optional label column */
    label?: string;
    /** Optional timestamp column */
    timestamp?: string;
  };
  /** Geographic identifier type */
  identifierType: 'id' | 'name' | 'isoCode' | 'postalCode';
}

/**
 * Animation state for smooth transitions
 */
export interface AnimationState {
  /** Current animation progress (0-1) */
  progress: number;
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Current frame in time-series data */
  currentFrame?: number;
  /** Total frames available */
  totalFrames?: number;
  /** Playback speed multiplier */
  speed: number;
}