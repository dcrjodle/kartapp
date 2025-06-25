/**
 * CityMarkers Component
 * 
 * Renders city markers on the map using latitude/longitude coordinates
 */

import React, { memo, useMemo } from 'react';
import { projectToSVG, type Bounds, type MapDimensions } from '../utils/mapProjection';
import { SwedishCity, getCitySizeCategory } from '../utils/cityDataProcessing';
import { type ViewBox } from '../utils/mapInteractions';
import { getProvinceByName } from '../data/standardized-provinces';
import { useTranslations } from '../hooks/useTranslations';
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
    if (!selectedProvince) {
      return []; // No cities shown when no province is selected
    }

    // Use standardized province matching instead of fragile string matching
    const standardizedProvince = getProvinceByName(selectedProvince.name);
    
    return cities.filter(city => {
      if (city.population < 30000) return false; // Only cities with 30k+ population
      
      // Try multiple matching strategies
      const cityAdminLower = city.admin_name.toLowerCase();
      const provinceName = selectedProvince.name.toLowerCase();
      
      // Primary match: exact name match
      if (cityAdminLower === provinceName) return true;
      
      // Secondary match: check aliases if standardized province exists
      if (standardizedProvince?.aliases) {
        return standardizedProvince.aliases.some(alias => 
          cityAdminLower === alias.toLowerCase()
        );
      }
      
      // Fallback: partial name matching (less reliable)
      return cityAdminLower.includes(provinceName) || 
             city.name.toLowerCase().includes(provinceName);
    });
  }, [cities, selectedProvince]);

  return (
    <g role="group" aria-label={t('cities.population')}>
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
        const baseScale = selectedProvince ? zoom * 1.5 : 1;
        const transformScale = Math.min(baseScale, 1.5); // Cap maximum scale at 1.5x
        
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