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

  // Filter cities based on zoom level and province selection
  const getVisibleCities = () => {
    let filteredCities = cities;

    // Filter by province if one is selected
    if (selectedProvince) {
      filteredCities = cities.filter(city => 
        city.admin_name.toLowerCase().includes(selectedProvince.name.toLowerCase()) ||
        city.name.toLowerCase().includes(selectedProvince.name.toLowerCase())
      );
    }

    // Filter by zoom level (show fewer cities when zoomed out)
    const minPopulation = zoom > 1.5 ? 10000 : zoom > 1 ? 50000 : 100000;
    return filteredCities.filter(city => city.population >= minPopulation);
  };

  const visibleCities = getVisibleCities();

  return (
    <g role="group" aria-label="Swedish cities">
      {visibleCities.map((city) => {
        const [x, y] = projectToSVG(city.lng, city.lat, bounds, mapDimensions);
        const sizeCategory = getCitySizeCategory(city.population);
        
        return (
          <g key={city.id} className={`city-marker city-marker--${sizeCategory}`}>
            {/* City marker circle */}
            <circle
              cx={x}
              cy={y}
              className="city-marker__circle"
              role="button"
              tabIndex={0}
              aria-label={`${city.name}, population ${city.population.toLocaleString()}`}
            />
            
            {/* City label */}
            <text
              x={x}
              y={y - 8}
              className="city-marker__label"
              textAnchor="middle"
              aria-hidden="true"
            >
              {city.name}
            </text>
            
            {/* Tooltip title */}
            <title>
              {city.name}
              {city.admin_name && ` (${city.admin_name})`}
              {'\n'}Population: {city.population.toLocaleString()}
            </title>
          </g>
        );
      })}
    </g>
  );
};

export default CityMarkers;