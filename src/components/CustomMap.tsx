/**
 * CustomMap Component
 *
 * An interactive SVG-based geographic map component that renders GeoJSON municipality data
 * using Mercator projection. Features include pan, zoom, and geographic grid overlay.
 *
 * @author Generated with Claude Code
 */

import React, { useEffect, useCallback } from "react";
import { type Provinces } from "../utils/mapProjection";
import { useMapState } from "../hooks/useMapState";
import { useMapInteractions } from "../hooks/useMapInteractions";
import { useMapKeyboard } from "../hooks/useMapKeyboard";
import {
  useMapBounds,
  useMapDimensions,
  useProvincePaths,
  useGridLines,
  createResetViewFunction,
} from "../utils/mapCalculations";
import MapControls from "./MapControls";
import MapGrid from "./MapGrid";
import MapProvinces from "./MapProvinces";
import "./CustomMap.scss";

interface CustomMapProps {
  /** Array of county data with coordinate polygons */
  provinces: Provinces[];
  /** Interval in degrees for grid lines (default: 2) */
  gridInterval?: number;
  /** Initial zoom level (default: 1) */
  initialZoom?: number;
  /** Minimum allowed zoom level (default: 0.1) */
  minZoom?: number;
  /** Maximum allowed zoom level (default: 5) */
  maxZoom?: number;
  /** Callback for zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback for province selection changes */
  onProvinceChange?: (province: Provinces | null) => void;
}

/**
 * CustomMap - Interactive geographic map component
 */
const CustomMap: React.FC<CustomMapProps> = ({
  provinces,
  gridInterval = 2,
  initialZoom = 1,
  minZoom = 0.1,
  maxZoom = 2,
  onZoomChange,
  onProvinceChange,
}) => {
  // Custom hooks for state management
  const mapState = useMapState(initialZoom);
  const {
    isDragging,
    zoom,
    viewBox,
    selectedProvince,
    showOnlySelected,
    setViewBox,
    resetState,
  } = mapState;

  // Map calculations using custom hooks
  const bounds = useMapBounds(
    provinces,
    selectedProvince,
    showOnlySelected
  );
  const mapDimensions = useMapDimensions(bounds);
  const provincePaths = useProvincePaths(provinces, bounds, mapDimensions);
  const { meridians, parallels } = useGridLines(
    bounds,
    mapDimensions,
    gridInterval
  );

  // Create reset function
  const resetView = useCallback(
    createResetViewFunction(
      provinces,
      initialZoom,
      resetState,
      setViewBox
    ),
    [provinces, initialZoom, resetState, setViewBox]
  );

  // Map interactions using custom hook
  const {
    svgRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleProvinceClick,
  } = useMapInteractions({
    ...mapState,
    minZoom,
    maxZoom,
    initialZoom,
  });

  // Keyboard interactions using custom hook
  useMapKeyboard({
    selectedProvince,
    showOnlySelected,
    resetView,
  });

  // Update viewBox when bounds change (when switching between views)
  useEffect(() => {
    setViewBox({
      x: 0,
      y: 0,
      width: mapDimensions.width,
      height: mapDimensions.height,
    });
  }, [mapDimensions, setViewBox]);

  // Call zoom change callback
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  // Call province change callback
  useEffect(() => {
    onProvinceChange?.(selectedProvince);
  }, [selectedProvince, onProvinceChange]);

  // Set up wheel event listener with passive: false to enable preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener("wheel", handleWheel, { passive: false });
      return () => svg.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Dynamic CSS classes for cursor state
  const svgClasses = `custom-map__svg ${
    isDragging
      ? "custom-map__svg--grabbing"
      : showOnlySelected && selectedProvince
      ? "custom-map__svg--no-zoom"
      : "custom-map__svg--grab"
  }`;

  return (
    <div className="custom-map" role="application" aria-label="Interactive map of Swedish provinces">
      {/* Main SVG map element */}
      <svg
        ref={svgRef}
        className={svgClasses}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="img"
        aria-label={`Map of Sweden showing ${provinces.length} provinces${selectedProvince ? `, with ${selectedProvince.name} selected` : ''}`}
        tabIndex={0}
        aria-describedby="map-instructions"
      >
        <MapGrid
          mapDimensions={mapDimensions}
          meridians={meridians}
          parallels={parallels}
        />

        <MapProvinces
          provinces={provinces}
          provincePaths={provincePaths}
          selectedProvince={selectedProvince}
          showOnlySelected={showOnlySelected}
          onProvinceClick={handleProvinceClick}
        />
      </svg>

      {/* Hidden instructions for screen readers */}
      <div id="map-instructions" className="sr-only">
        Interactive map of Swedish provinces. Use mouse to pan and zoom, or click provinces to select them. 
        Use Tab to navigate between provinces, Enter or Space to select. Press Escape to reset view.
      </div>

      {/* Control panel */}
      <MapControls
        zoom={zoom}
        selectedProvince={selectedProvince}
        showOnlySelected={showOnlySelected}
        provinces={provinces}
        bounds={bounds}
        viewBox={viewBox}
        onResetView={resetView}
      />
    </div>
  );
};

export default CustomMap;
