/**
 * Standardized geographic entity types for reliable identification and data visualization
 */

export interface GeographicIdentifiers {
  /** Primary unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** ISO 3166-2 subdivision code (e.g., "SE-AB" for Stockholm) */
  isoCode?: string;
  /** Alternative names for matching */
  aliases?: string[];
  /** Postal code prefixes for this region */
  postalCodePrefixes?: string[];
}

export interface GeographicBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface GeographicEntity extends GeographicIdentifiers {
  /** Coordinate data for rendering */
  coordinates: number[][] | number[][][][];
  /** Geographic bounds for this entity */
  bounds?: GeographicBounds;
  /** Parent entity (e.g., province for a city) */
  parentId?: string;
  /** Entity type for categorization */
  type: 'province' | 'county' | 'municipality' | 'city';
  /** Population data if available */
  population?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface City extends GeographicIdentifiers {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Administrative region this city belongs to */
  adminRegionId: string;
  /** Population count */
  population: number;
  /** Whether this is a capital city */
  isCapital?: boolean;
  /** City type for visualization sizing */
  sizeCategory: 'small' | 'medium' | 'large' | 'major';
}

export interface Province extends GeographicEntity {
  type: 'province';
  /** Cities within this province */
  cities?: string[]; // Array of city IDs
}

/**
 * Legacy province interface - to be phased out
 * @deprecated Use Province interface instead
 */
export interface Provinces {
  coordinates: number[][] | number[][][][];
  name?: string;
  id?: string;
}