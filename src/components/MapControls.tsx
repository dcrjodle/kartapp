/**
 * MapControls Component
 * 
 * Displays map information and control buttons
 */

import React, { memo, useState, useEffect } from 'react';
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
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const MapControls: React.FC<MapControlsProps> = memo(({
  zoom,
  selectedProvince,
  showOnlySelected,
  provinces,
  bounds,
  viewBox,
  onResetView,
  onZoomIn,
  onZoomOut,
}) => {
  const { t } = useTranslations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto-collapse on mobile by default
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`map-controls ${isCollapsed ? 'map-controls--collapsed' : ''} ${isMobile ? 'map-controls--mobile' : ''}`} 
      role="region" 
      aria-label={t('map.title')} 
      data-testid="map-controls"
    >
      <div className="map-controls__header">
        <h2 className="map-controls__title">{t('map.title')}</h2>
        {isMobile && (
          <button
            onClick={toggleCollapse}
            className="map-controls__toggle"
            aria-label={isCollapsed ? 'Expand controls' : 'Collapse controls'}
            data-testid="controls-toggle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {isCollapsed ? (
                <path d="M18 15l-6-6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Always visible reset button on mobile */}
      {isMobile && (
        <div className="map-controls__mobile-reset">
          <button
            onClick={onResetView}
            className="map-controls__reset-button map-controls__reset-button--always-visible"
            type="button"
            data-testid="mobile-reset-view"
            aria-label={
              selectedProvince && showOnlySelected
                ? t('map.showAllProvinces')
                : t('map.resetMapView')
            }
          >
            {selectedProvince && showOnlySelected ? t('map.showAll') : t('map.resetView')}
          </button>
        </div>
      )}

      {!isCollapsed && (
        <>
      
      <div className="map-controls__section map-controls__section--info">
        <h3 className="map-controls__section-title">{t('map.information')}</h3>
        <div className="map-controls__info">
        <div className="map-controls__info-item">
          {t('map.zoom')}: {zoom.toFixed(2)}
          {showOnlySelected && selectedProvince && (
            <span className="map-controls__zoom-disabled"> {t('map.zoomDisabled')}</span>
          )}
        </div>
        {selectedProvince && showOnlySelected ? (
          <div className="map-controls__info-item" data-testid="province-info">
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
      </div>
      
      <div className="map-controls__section map-controls__section--controls">
        <h3 className="map-controls__section-title">{t('map.controls')}</h3>
        <div className="map-controls__buttons">
        <div className="map-controls__zoom-buttons">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="map-controls__zoom-button"
              type="button"
              data-testid="zoom-out"
              aria-label={t('map.zoomOut')}
              disabled={showOnlySelected && !!selectedProvince}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="map-controls__zoom-button"
              type="button"
              data-testid="zoom-in"
              aria-label={t('map.zoomIn')}
              disabled={showOnlySelected && !!selectedProvince}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        {/* Hide reset button on mobile since we have the always-visible one */}
        {!isMobile && (
          <button
            onClick={onResetView}
            className="map-controls__reset-button"
            type="button"
            data-testid="reset-view"
            aria-label={
              selectedProvince && showOnlySelected
                ? t('map.showAllProvinces')
                : t('map.resetMapView')
            }
          >
            {selectedProvince && showOnlySelected ? t('map.showAll') : t('map.resetView')}
          </button>
        )}
        </div>
      </div>
      
        </>
      )}
    </div>
  );
});

MapControls.displayName = 'MapControls';

export default MapControls;