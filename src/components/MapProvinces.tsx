/**
 * MapProvinces Component
 * 
 * Renders the interactive province polygons on the map
 */

import React, { memo, useMemo } from 'react';
import { type Provinces } from '../utils/mapProjection';
import { useTranslations } from '../hooks/useTranslations';

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

  return (
    <g role="group" aria-label={t('map.provinces')}>
      {displayProvinces.map((province, displayIndex) => {
        const originalIndex = showOnlySelected && selectedProvince
          ? provinces.findIndex((p) => p.id === province.id)
          : displayIndex;
        const pathData = provincePaths[originalIndex];

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