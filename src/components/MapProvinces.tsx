/**
 * MapProvinces Component
 * 
 * Renders the interactive province polygons on the map with hand-drawn appearance
 */

import React, { memo, useMemo } from 'react';
import { type Provinces } from '../utils/mapProjection'; // TODO: Migrate to Province from types/geographic.ts
import { useTranslations } from '../hooks/useTranslations';
import { generateHandDrawnPath } from '../utils/handDrawnStrokes';

interface MapProvincesProps {
  provinces: Provinces[];
  provincePaths: string[];
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  onProvinceClick: (province: Provinces, index: number) => void;
}

const MapProvinces: React.FC<MapProvincesProps> = memo(({
  provinces,
  provincePaths,
  selectedProvince,
  showOnlySelected,
  onProvinceClick,
}) => {
  const { t } = useTranslations();
  
  const displayProvinces = useMemo(() => 
    showOnlySelected && selectedProvince ? [selectedProvince] : provinces,
    [showOnlySelected, selectedProvince, provinces]
  );

  // Generate hand-drawn paths for all provinces
  const handDrawnPaths = useMemo(() => {
    return provincePaths.map((pathData, index) => 
      generateHandDrawnPath(pathData, {
        roughness: 0.8,
        bowing: 1.2,
        seed: index + 1, // Use different seed for each province
      })
    );
  }, [provincePaths]);

  return (
    <g role="group" aria-label={t('map.provinces')}>
      {displayProvinces.map((province, displayIndex) => {
        const originalIndex = showOnlySelected && selectedProvince
          ? provinces.findIndex((p) => p.id === province.id)
          : displayIndex;
        const pathData = handDrawnPaths[originalIndex];

        return (
          <path
            key={province.id || originalIndex}
            d={pathData}
            className={`custom-map__province ${
              selectedProvince?.id === province.id
                ? "custom-map__province--selected"
                : ""
            }`}
            onClick={() => onProvinceClick(province, originalIndex)}
            role="button"
            tabIndex={0}
            aria-label={t('accessibility.provinceButton', {
              name: province.name || '',
              selectedState: selectedProvince?.id === province.id ? t('accessibility.provinceSelected') : ''
            })}
            data-testid={`province-${province.name?.toLowerCase().replace(/\s+/g, '-')}`}
            data-selected={selectedProvince?.id === province.id}
            filter="url(#roughen)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProvinceClick(province, originalIndex);
              }
            }}
          >
            <title>{province.name}</title>
          </path>
        );
      })}
    </g>
  );
});

MapProvinces.displayName = 'MapProvinces';

export default MapProvinces;