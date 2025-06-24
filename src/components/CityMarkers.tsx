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
        
        // Use fixed sizes and CSS transforms to ensure consistent visual appearance
        const radius = baseSizes[sizeCategory];
        const fontSize = 14;
        const textOffset = 20;
        
        // Calculate transform scale to counteract SVG scaling
        // This ensures consistent visual size regardless of province aspect ratio
        const baseScale = selectedProvince ? zoom * 2 : 1;
        const transformScale = Math.min(baseScale, 2); // Cap maximum scale at 2x
        
        return (
          <g 
            key={city.id} 
            className="city-marker-group"
            style={{
              transform: `scale(${transformScale})`,
              transformOrigin: `${x}px ${y}px`
            }}
          >
            <circle
              cx={x}
              cy={y}
              r={radius}
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
              y={y - textOffset}
              className="city-tooltip"
              textAnchor="middle"
              pointerEvents="none"
              fontSize={fontSize}
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