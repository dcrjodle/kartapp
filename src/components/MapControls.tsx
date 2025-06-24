/**
 * MapControls Component
 * 
 * Displays map information and control buttons
 */

import React from 'react';
import { type Provinces, type Bounds } from '../utils/mapProjection';
import { type ViewBox } from '../utils/mapInteractions';
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
  return (
    <div className="map-controls" role="region" aria-label="Map controls and information">
      <div className="map-controls__info">
        <div className="map-controls__info-item">
          Zoom: {zoom.toFixed(2)}
          {showOnlySelected && selectedProvince && (
            <span className="map-controls__zoom-disabled"> (disabled)</span>
          )}
        </div>
        {selectedProvince && showOnlySelected ? (
          <div className="map-controls__info-item">
            Selected: {selectedProvince.name}
          </div>
        ) : (
          <div className="map-controls__info-item">
            Provinces: {provinces.length}
          </div>
        )}
        <div className="map-controls__info-item">
          Bounds: {bounds.minLat.toFixed(1)}°-{bounds.maxLat.toFixed(1)}°N,{" "}
          {bounds.minLng.toFixed(1)}°-{bounds.maxLng.toFixed(1)}°E
        </div>
        <div className="map-controls__info-item">
          ViewBox: ({viewBox.x.toFixed(0)}, {viewBox.y.toFixed(0)})
        </div>
      </div>
      <div className="map-controls__buttons">
        <button
          onClick={onResetView}
          className="map-controls__reset-button"
          type="button"
          aria-label={
            selectedProvince && showOnlySelected
              ? "Show all provinces"
              : "Reset map view to initial position"
          }
        >
          {selectedProvince && showOnlySelected ? "Show All" : "Reset View"}
        </button>
      </div>
    </div>
  );
};

export default MapControls;