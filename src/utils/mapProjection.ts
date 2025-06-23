/**
 * Map projection utilities for geographic coordinate transformations
 */

export interface Bounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface MapDimensions {
  width: number;
  height: number;
}

export interface Provinces {
  coordinates: number[][] | number[][][][];
  name?: string;
  id?: string;
}

/**
 * Convert degrees to radians
 */
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculate the geographic bounds of a collection of counties
 */
export const calculateGeographicBounds = (counties: Provinces[]): Bounds => {
  let minLng = Infinity,
    maxLng = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  counties.forEach((county) => {
    // Handle both coordinate formats: number[][] (simple polygon) and number[][][][] (MultiPolygon)
    if (county.coordinates.length > 0) {
      // Check if it's a simple coordinate array (number[][])
      if (typeof county.coordinates[0][0] === "number") {
        // Simple polygon format: number[][]
        const coords = county.coordinates as number[][];
        coords.forEach(([lng, lat]) => {
          if (typeof lng === "number" && typeof lat === "number") {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          }
        });
      } else {
        // MultiPolygon format: number[][][][]
        const multiPolygon = county.coordinates as number[][][][];
        multiPolygon.forEach((polygon) => {
          polygon.forEach((ring) => {
            ring.forEach(([lng, lat]) => {
              if (typeof lng === "number" && typeof lat === "number") {
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
              }
            });
          });
        });
      }
    }
  });

  return { minLng, maxLng, minLat, maxLat };
};

/**
 * Calculate optimal map dimensions with proper aspect ratio for northern latitudes
 */
export const calculateMapDimensions = (bounds: Bounds): MapDimensions => {
  const lngRange = bounds.maxLng - bounds.minLng;
  const latRange = bounds.maxLat - bounds.minLat;

  // Calculate proper latitude compression factor for Sweden's latitude range
  // Use the central latitude for Mercator projection compensation
  const centralLat = (bounds.maxLat + bounds.minLat) / 2;
  const centralLatRad = (centralLat * Math.PI) / 180;
  
  // For Mercator projection, longitude compression = cos(central latitude)
  // Sweden's central latitude is ~62°N, cos(62°) ≈ 0.469
  const latitudeCompressionFactor = Math.cos(centralLatRad);
  const aspectRatio = latRange / (lngRange * latitudeCompressionFactor);

  const baseWidth = 1000;
  const calculatedHeight = baseWidth * aspectRatio;

  // Ensure minimum height to prevent over-compression
  const minHeight = 400;
  const height = Math.max(calculatedHeight, minHeight);

  return { width: baseWidth, height };
};

/**
 * Project geographic coordinates (longitude, latitude) to SVG coordinates using Mercator projection
 */
export const projectToSVG = (
  lng: number,
  lat: number,
  bounds: Bounds,
  dimensions: MapDimensions
): [number, number] => {
  // Linear scaling for longitude (x-axis)
  const x =
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) *
    dimensions.width;

  // Mercator projection for latitude (y-axis)
  const latRad = toRadians(lat);
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));

  const minLatRad = toRadians(bounds.minLat);
  const maxLatRad = toRadians(bounds.maxLat);
  const minMercatorY = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
  const maxMercatorY = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));

  const y =
    ((maxMercatorY - mercatorY) / (maxMercatorY - minMercatorY)) *
    dimensions.height;

  return [x, y];
};

/**
 * Convert a polygon's coordinates to SVG path string
 */
export const polygonToSVGPath = (
  coordinates: number[][] | number[][][][],
  bounds: Bounds,
  dimensions: MapDimensions
): string => {
  // Handle both coordinate formats
  if (coordinates.length > 0) {
    // Check if it's a simple coordinate array (number[][])
    if (typeof coordinates[0][0] === "number") {
      // Simple polygon format: number[][]
      const coords = coordinates as number[][];
      const pathData =
        coords
          .map(([lng, lat], index) => {
            const [x, y] = projectToSVG(lng, lat, bounds, dimensions);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ") + " Z";
      return pathData;
    } else {
      // MultiPolygon format: number[][][][]
      const multiPolygon = coordinates as number[][][][];
      return multiPolygon
        .map((polygon) => {
          return polygon
            .map((ring) => {
              const pathData =
                ring
                  .map(([lng, lat], index) => {
                    const [x, y] = projectToSVG(lng, lat, bounds, dimensions);
                    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ") + " Z";
              return pathData;
            })
            .join(" ");
        })
        .join(" ");
    }
  }
  return "";
};

/**
 * Generate longitude grid lines (meridians) for the map
 */
export const generateMeridians = (
  bounds: Bounds,
  dimensions: MapDimensions,
  interval: number = 2
) => {
  const meridians = [];
  const lineCount = Math.ceil((bounds.maxLng - bounds.minLng) / interval);

  for (let i = 0; i <= lineCount; i++) {
    const lng = bounds.minLng + i * interval;
    if (lng <= bounds.maxLng) {
      const x =
        ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) *
        dimensions.width;
      meridians.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: dimensions.height,
        key: `meridian-${i}`,
      });
    }
  }

  return meridians;
};

/**
 * Generate latitude grid lines (parallels) for the map using Mercator projection
 */
export const generateParallels = (
  bounds: Bounds,
  dimensions: MapDimensions,
  interval: number = 2
) => {
  const parallels = [];
  const lineCount = Math.ceil((bounds.maxLat - bounds.minLat) / interval);

  const minLatRad = toRadians(bounds.minLat);
  const maxLatRad = toRadians(bounds.maxLat);
  const minMercatorY = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
  const maxMercatorY = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));

  for (let i = 0; i <= lineCount; i++) {
    const lat = bounds.minLat + i * interval;
    if (lat <= bounds.maxLat) {
      const latRad = toRadians(lat);
      const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      const y =
        ((maxMercatorY - mercatorY) / (maxMercatorY - minMercatorY)) *
        dimensions.height;

      parallels.push({
        x1: 0,
        y1: y,
        x2: dimensions.width,
        y2: y,
        key: `parallel-${i}`,
      });
    }
  }

  return parallels;
};
