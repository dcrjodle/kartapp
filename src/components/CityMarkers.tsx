/**
 * CityMarkers Component
 * 
 * Renders city markers on the map using latitude/longitude coordinates
 */

import React from 'react';
import { projectToSVG, type Bounds, type MapDimensions } from '../utils/mapProjection';
import { SwedishCity, getCitySizeCategory } from '../utils/cityDataProcessing';
import { type ViewBox } from '../utils/mapInteractions';
import './CityMarkers.scss';

interface CityMarkersProps {
  cities: SwedishCity[];
  bounds: Bounds;
  mapDimensions: MapDimensions;
  zoom: number;
  selectedProvince: any;
  showCities?: boolean;
  viewBox: ViewBox;
}

const CityMarkers: React.FC<CityMarkersProps> = ({
  cities,
  bounds,
  mapDimensions,
  zoom,
  selectedProvince,
  showCities = true,
  viewBox,
}) => {
  if (!showCities) return null;

  // Only show cities when a province is selected
  const getVisibleCities = () => {
    if (!selectedProvince) {
      return []; // No cities shown when no province is selected
    }

    // Filter by province selection and minimum population
    return cities.filter(city => 
      city.population >= 30000 && // Only cities with 30k+ population
      (city.admin_name.toLowerCase().includes(selectedProvince.name.toLowerCase()) ||
       city.name.toLowerCase().includes(selectedProvince.name.toLowerCase()))
    );
  };

  const visibleCities = getVisibleCities();

  return (
    <g role="group" aria-label="Swedish cities">
      {visibleCities.map((city) => {
        const [x, y] = projectToSVG(city.lng, city.lat, bounds, mapDimensions);
        const sizeCategory = getCitySizeCategory(city.population);
        
        // Calculate base sizes for different population categories
        const baseSizes = {
          small: 8,
          medium: 10,
          large: 12,
          major: 15
        };
        
        // Calculate scale factor based on viewBox size to handle different province zoom levels
        // When a province is selected, viewBox becomes much smaller, so elements need to scale up
        const baseViewBoxSize = Math.max(mapDimensions.width, mapDimensions.height);
        const currentViewBoxSize = Math.max(viewBox.width, viewBox.height);
        const viewBoxScale = baseViewBoxSize / currentViewBoxSize;
        const scaleFactor = Math.max(viewBoxScale * 0.1, 1); // Scale relative to zoom level
        
        const adjustedRadius = baseSizes[sizeCategory] * scaleFactor;
        const adjustedFontSize = 14 * scaleFactor;
        const adjustedTextOffset = 20 * scaleFactor;
        
        return (
          <g key={city.id} className="city-marker-group">
            <circle
              cx={x}
              cy={y}
              r={adjustedRadius}
              className={`city-marker city-marker--${sizeCategory}`}
              role="button"
              tabIndex={0}
              aria-label={`${city.name}, population ${city.population.toLocaleString()}`}
              data-city-name={city.name}
            >
              {/* Tooltip title for hover */}
              <title>{city.name}</title>
            </circle>
            {/* Custom tooltip */}
            <text
              x={x}
              y={y - adjustedTextOffset}
              className="city-tooltip"
              textAnchor="middle"
              pointerEvents="none"
              fontSize={adjustedFontSize}
            >
              {city.name}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default CityMarkers;