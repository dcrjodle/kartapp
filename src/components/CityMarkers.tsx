/**
 * CityMarkers Component
 * 
 * Renders city markers on the map using latitude/longitude coordinates
 */

import React, { memo, useMemo } from 'react';
import { projectToSVG, type Bounds, type MapDimensions } from '../utils/mapProjection';
import { SwedishCity } from '../utils/cityDataProcessing';
import { type ViewBox } from '../utils/mapInteractions';
import { useTranslations } from '../hooks/useTranslations';
import './CityMarkers.scss';

interface CityMarkersProps {
  cities: SwedishCity[];
  bounds: Bounds;
  mapDimensions: MapDimensions;
  zoom: number;
  selectedProvince: any; // TODO: Type this properly with Province interface
  showCities?: boolean;
  viewBox: ViewBox;
}

// Simple helper function for city size categorization
const getCitySizeCategory = (population: number): 'small' | 'medium' | 'large' | 'major' => {
  if (population >= 500000) return 'major';
  if (population >= 200000) return 'large';
  if (population >= 100000) return 'medium';
  return 'small';
};

const CityMarkers: React.FC<CityMarkersProps> = memo(({
  cities,
  bounds,
  mapDimensions,
  zoom,
  selectedProvince,
  showCities = true,
}) => {
  const { t } = useTranslations();
  
  if (!showCities) return null;

  // Memoize visible cities calculation
  const visibleCities = useMemo(() => {
    if (!selectedProvince || !cities || cities.length === 0) {
      return cities || []; // Show all cities when no province is selected
    }

    // Simple province filtering based on province property
    const filteredCities = cities.filter(city => {
      if (!city || typeof city.population !== 'number') return false;
      if (city.population < 30000) return false; // Only cities with 30k+ population
      
      // Match by province property if available, otherwise show all cities
      if (city.province) {
        const cityProvince = city.province.toLowerCase();
        const selectedProvinceName = selectedProvince.name?.toLowerCase() || '';
        return cityProvince.includes(selectedProvinceName) || selectedProvinceName.includes(cityProvince);
      }
      
      return true; // Show city if no province data
    });

    return filteredCities;
  }, [cities, selectedProvince]);

  return (
    <g role="group" aria-label={t('cities.population')}>
      {visibleCities.map((city, index) => {
        const [x, y] = projectToSVG(city.longitude, city.latitude, bounds, mapDimensions);
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
        const baseScale = selectedProvince ? zoom * 1.5 : 1;
        const transformScale = Math.min(baseScale, 1.5); // Cap maximum scale at 1.5x
        
        return (
          <g 
            key={`${city.name}-${index}`} 
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
              aria-label={t('accessibility.cityMarker', {
                name: city.name,
                population: city.population.toLocaleString()
              })}
              data-city-name={city.name}
              data-testid={`city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => console.log('City clicked:', city.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('City selected:', city.name);
                }
              }}
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
});

CityMarkers.displayName = 'CityMarkers';

export default CityMarkers;