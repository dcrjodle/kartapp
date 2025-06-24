/**
 * CityMarkers Component
 * 
 * Renders city markers on the map using latitude/longitude coordinates
 */

import React from 'react';
import { projectToSVG, type Bounds, type MapDimensions } from '../utils/mapProjection';
import { SwedishCity, getCitySizeCategory } from '../utils/cityDataProcessing';
import './CityMarkers.scss';

interface CityMarkersProps {
  cities: SwedishCity[];
  bounds: Bounds;
  mapDimensions: MapDimensions;
  zoom: number;
  selectedProvince: any;
  showCities?: boolean;
}

const CityMarkers: React.FC<CityMarkersProps> = ({
  cities,
  bounds,
  mapDimensions,
  zoom,
  selectedProvince,
  showCities = true,
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
        
        return (
          <g key={city.id} className="city-marker-group">
            <circle
              cx={x}
              cy={y}
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
              y={y - 20}
              className="city-tooltip"
              textAnchor="middle"
              pointerEvents="none"
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