/**
 * Utility functions for map calculations and data processing
 */

import { useMemo } from 'react';
import {
  calculateGeographicBounds,
  calculateMapDimensions,
  polygonToSVGPath,
  generateMeridians,
  generateParallels,
  type Provinces,
  type Bounds,
  type MapDimensions,
} from './mapProjection';

/**
 * Calculate map bounds based on selected province or all provinces
 */
export const useMapBounds = (
  provinces: Provinces[],
  swedenBorderData: Provinces,
  selectedProvince: Provinces | null,
  showOnlySelected: boolean
): Bounds => {
  return useMemo(() => {
    if (showOnlySelected && selectedProvince) {
      // Calculate bounds for only the selected province
      return calculateGeographicBounds([selectedProvince]);
    }
    // Include Sweden border in bounds calculation for proper scaling
    const allFeatures = [...provinces, swedenBorderData];
    return calculateGeographicBounds(allFeatures);
  }, [provinces, swedenBorderData, selectedProvince, showOnlySelected]);
};

/**
 * Calculate map dimensions based on bounds
 */
export const useMapDimensions = (bounds: Bounds): MapDimensions => {
  return useMemo(() => calculateMapDimensions(bounds), [bounds]);
};

/**
 * Pre-calculate all province SVG paths for performance
 */
export const useProvincePaths = (
  provinces: Provinces[],
  bounds: Bounds,
  mapDimensions: MapDimensions
): string[] => {
  return useMemo(
    () =>
      provinces.map((province) =>
        polygonToSVGPath(province.coordinates, bounds, mapDimensions)
      ),
    [provinces, bounds, mapDimensions]
  );
};

/**
 * Pre-calculate Sweden border path
 */
export const useSwedenBorderPath = (
  swedenBorderData: Provinces,
  bounds: Bounds,
  mapDimensions: MapDimensions
): string => {
  return useMemo(
    () => polygonToSVGPath(swedenBorderData.coordinates, bounds, mapDimensions),
    [swedenBorderData, bounds, mapDimensions]
  );
};

/**
 * Generate grid lines (meridians and parallels)
 */
export const useGridLines = (
  bounds: Bounds,
  mapDimensions: MapDimensions,
  gridInterval: number
) => {
  const meridians = useMemo(
    () => generateMeridians(bounds, mapDimensions, gridInterval),
    [bounds, mapDimensions, gridInterval]
  );

  const parallels = useMemo(
    () => generateParallels(bounds, mapDimensions, gridInterval),
    [bounds, mapDimensions, gridInterval]
  );

  return { meridians, parallels };
};

/**
 * Reset view utility function
 */
export const createResetViewFunction = (
  provinces: Provinces[],
  swedenBorderData: Provinces,
  initialZoom: number,
  resetState: () => void,
  setViewBox: (value: any) => void
) => {
  return () => {
    resetState();
    
    // Force recalculation by setting a timeout to let bounds/mapDimensions update first
    setTimeout(() => {
      const allFeatures = [...provinces, swedenBorderData];
      const resetBounds = calculateGeographicBounds(allFeatures);
      const resetDimensions = calculateMapDimensions(resetBounds);
      
      setViewBox({
        x: 0,
        y: 0,
        width: resetDimensions.width,
        height: resetDimensions.height,
      });
    }, 0);
  };
};