/**
 * MapControls Component
 * 
 * Displays map information and control buttons
 */

import React from 'react';
import { type Provinces, type Bounds } from '../utils/mapProjection';
import { type ViewBox } from '../utils/mapInteractions';
import { useTranslations } from '../hooks/useTranslations';
import './MapControls.scss';

interface MapControlsProps {
  zoom: number;
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  provinces: Provinces[];
  bounds: Bounds;
  viewBox: ViewBox;
  onResetView: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  zoom,
  selectedProvince,
  showOnlySelected,
  provinces,
  bounds,
  viewBox,
  onResetView,
}) => {
  const { t } = useTranslations();
  
  return (
    <div className="map-controls" role="region" aria-label={t('map.title')}>
      <div className="map-controls__info">
        <div className="map-controls__info-item">
          {t('map.zoom')}: {zoom.toFixed(2)}
          {showOnlySelected && selectedProvince && (
            <span className="map-controls__zoom-disabled"> {t('map.zoomDisabled')}</span>
          )}
        </div>
        {selectedProvince && showOnlySelected ? (
          <div className="map-controls__info-item">
            {t('map.selected')}: {selectedProvince.name}
          </div>
        ) : (
          <div className="map-controls__info-item">
            {t('map.provinces')}: {provinces.length}
          </div>
        )}
        <div className="map-controls__info-item">
          {t('map.bounds')}: {bounds.minLat.toFixed(1)}°-{bounds.maxLat.toFixed(1)}°N,{" "}
          {bounds.minLng.toFixed(1)}°-{bounds.maxLng.toFixed(1)}°E
        </div>
        <div className="map-controls__info-item">
          {t('map.viewBox')}: ({viewBox.x.toFixed(0)}, {viewBox.y.toFixed(0)})
        </div>
      </div>
      <div className="map-controls__buttons">
        <button
          onClick={onResetView}
          className="map-controls__reset-button"
          type="button"
          aria-label={
            selectedProvince && showOnlySelected
              ? t('map.showAllProvinces')
              : t('map.resetMapView')
          }
        >
          {selectedProvince && showOnlySelected ? t('map.showAll') : t('map.resetView')}
        </button>
      </div>
    </div>
  );
};

export default MapControls;