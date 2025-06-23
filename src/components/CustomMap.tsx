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
import { polygonToSVGPath } from "../utils/mapProjection";
import { swedenBorderData } from "../data/sweden_border";
import { useMapState } from "../hooks/useMapState";
import { useMapInteractions } from "../hooks/useMapInteractions";
import { useMapKeyboard } from "../hooks/useMapKeyboard";
import {
  useMapBounds,
  useMapDimensions,
  useProvincePaths,
  useSwedenBorderPath,
  useGridLines,
  createResetViewFunction,
} from "../utils/mapCalculations";
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
  const bounds = useMapBounds(provinces, swedenBorderData, selectedProvince, showOnlySelected);
  const mapDimensions = useMapDimensions(bounds);
  const provincePaths = useProvincePaths(provinces, bounds, mapDimensions);
  const swedenBorderPath = useSwedenBorderPath(swedenBorderData, bounds, mapDimensions);
  const { meridians, parallels } = useGridLines(bounds, mapDimensions, gridInterval);


  // Create reset function
  const resetView = useCallback(
    createResetViewFunction(provinces, swedenBorderData, initialZoom, resetState, setViewBox),
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
    <div className="custom-map">
      {/* Main SVG map element */}
      <svg
        ref={svgRef}
        className={svgClasses}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
        />

        {/* Longitude lines (meridians) */}
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

        {/* Latitude lines (parallels) */}
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

        {/* Sweden border outline (bottom layer) */}
        <path d={swedenBorderPath} className="custom-map__sweden-border">
          <title>Sweden Border</title>
        </path>


        {/* Province polygons (top layer) */}
        {(showOnlySelected && selectedProvince
          ? [selectedProvince]
          : provinces
        ).map((province, displayIndex) => {
          const originalIndex =
            showOnlySelected && selectedProvince
              ? provinces.findIndex((p) => p.id === province.id)
              : displayIndex;
          const pathData =
            showOnlySelected && selectedProvince
              ? polygonToSVGPath(province.coordinates, bounds, mapDimensions)
              : provincePaths[originalIndex];

          return (
            <path
              key={province.id || originalIndex}
              d={pathData}
              className={`custom-map__province ${
                selectedProvince?.id === province.id
                  ? "custom-map__province--selected"
                  : ""
              }`}
              onClick={() => handleProvinceClick(province, originalIndex)}
            >
              <title>{province.name}</title>
            </path>
          );
        })}
      </svg>


      {/* Control panel */}
      <div className="custom-map__controls">
        <div className="custom-map__info">
          <div className="custom-map__info-item">
            Zoom: {zoom.toFixed(2)}
            {showOnlySelected && selectedProvince && (
              <span className="custom-map__zoom-disabled"> (disabled)</span>
            )}
          </div>
          {selectedProvince && showOnlySelected ? (
            <div className="custom-map__info-item">
              Selected: {selectedProvince.name}
            </div>
          ) : (
            <div className="custom-map__info-item">
              Provinces: {provinces.length}
            </div>
          )}
          <div className="custom-map__info-item">
            Bounds: {bounds.minLat.toFixed(1)}°-{bounds.maxLat.toFixed(1)}°N,{" "}
            {bounds.minLng.toFixed(1)}°-{bounds.maxLng.toFixed(1)}°E
          </div>
          <div className="custom-map__info-item">
            ViewBox: ({viewBox.x.toFixed(0)}, {viewBox.y.toFixed(0)})
          </div>
        </div>
        <div className="custom-map__buttons">
          <button
            onClick={resetView}
            className="custom-map__reset-button"
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
    </div>
  );
};

export default CustomMap;
