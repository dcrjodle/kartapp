/**
 * MapGrid Component
 * 
 * Renders the background grid and coordinate lines for the map
 */

import React, { memo } from 'react';
import { type MapDimensions } from '../utils/mapProjection';

interface GridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
}

interface MapGridProps {
  mapDimensions: MapDimensions;
  meridians: GridLine[];
  parallels: GridLine[];
}

const MapGrid: React.FC<MapGridProps> = memo(({
  mapDimensions,
  meridians,
  parallels,
}) => {
  return (
    <g data-testid="map-grid">
      {/* Grid pattern definition */}
      <defs>
        <pattern
          id="grid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          className="custom-map__grid-pattern"
        >
          <path d="M 100 0 L 0 0 0 100" className="grid-line" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect
        width={mapDimensions.width}
        height={mapDimensions.height}
        className="custom-map__grid-background"
        aria-hidden="true"
      />

      {/* Longitude lines (meridians) */}
      <g aria-hidden="true">
        {meridians.map(({ x1, y1, x2, y2, key }) => (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="custom-map__meridian"
          />
        ))}
      </g>

      {/* Latitude lines (parallels) */}
      <g aria-hidden="true">
        {parallels.map(({ x1, y1, x2, y2, key }) => (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="custom-map__parallel"
          />
        ))}
      </g>
    </g>
  );
});

MapGrid.displayName = 'MapGrid';

export default MapGrid;