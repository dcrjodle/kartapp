/**
 * CustomMap Component
 *
 * An interactive SVG-based geographic map component that renders GeoJSON municipality data
 * using Mercator projection. Features include pan, zoom, and geographic grid overlay.
 *
 * @author Generated with Claude Code
 */

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  calculateGeographicBounds,
  calculateMapDimensions,
  polygonToSVGPath,
  generateMeridians,
  generateParallels,
  type Provinces,
  type Bounds,
  type MapDimensions,
} from "../utils/mapProjection";
import { swedenBorderData } from "../data/sweden_border";
import {
  calculateZoomFactor,
  constrainZoom,
  calculateZoomedViewBox,
  calculatePannedViewBox,
  type ViewBox,
  type MousePosition,
} from "../utils/mapInteractions";
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
  /** Maximum allowed zoom level (default: 10) */
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
  maxZoom = 10,
}) => {
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(initialZoom);
  const [selectedProvince, setSelectedProvince] = useState<Provinces | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Memoized calculations for performance
  const bounds: Bounds = useMemo(() => {
    if (showOnlySelected && selectedProvince) {
      // Calculate bounds for only the selected province
      return calculateGeographicBounds([selectedProvince]);
    }
    // Include Sweden border in bounds calculation for proper scaling
    const allFeatures = [...provinces, swedenBorderData];
    return calculateGeographicBounds(allFeatures);
  }, [provinces, selectedProvince, showOnlySelected]);

  const mapDimensions: MapDimensions = useMemo(
    () => calculateMapDimensions(bounds),
    [bounds]
  );

  // Initialize viewBox with proper dimensions
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });

  // Pre-calculate all county SVG paths for performance
  const provincePaths = useMemo(
    () =>
      provinces.map((province) =>
        polygonToSVGPath(province.coordinates, bounds, mapDimensions)
      ),
    [provinces, bounds, mapDimensions]
  );

  // Pre-calculate Sweden border path
  const swedenBorderPath = useMemo(
    () => polygonToSVGPath(swedenBorderData.coordinates, bounds, mapDimensions),
    [bounds, mapDimensions]
  );

  // Generate grid lines
  const meridians = useMemo(
    () => generateMeridians(bounds, mapDimensions, gridInterval),
    [bounds, mapDimensions, gridInterval]
  );

  const parallels = useMemo(
    () => generateParallels(bounds, mapDimensions, gridInterval),
    [bounds, mapDimensions, gridInterval]
  );

  /**
   * Handle mouse down event to start dragging
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Disable panning when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [showOnlySelected, selectedProvince]);

  /**
   * Handle mouse move event for panning
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setViewBox((prev) => calculatePannedViewBox(prev, deltaX, deltaY));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMousePos]
  );

  /**
   * Handle mouse up event to stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle wheel event for zooming with proper event prevention
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Disable zoom when showing only selected province
      if (showOnlySelected && selectedProvince) {
        return;
      }

      const zoomFactor = calculateZoomFactor(e.deltaY);
      const newZoom = constrainZoom(zoom * zoomFactor, minZoom, maxZoom);
      setZoom(newZoom);

      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const mousePosition: MousePosition = { x: e.clientX, y: e.clientY };
        setViewBox((prev) =>
          calculateZoomedViewBox(prev, zoomFactor, mousePosition, rect)
        );
      }
    },
    [zoom, minZoom, maxZoom, showOnlySelected, selectedProvince]
  );

  /**
   * Handle province click - zoom to province and optionally show only that province
   */
  const handleProvinceClick = useCallback((province: Provinces, index: number) => {
    // Don't handle click if currently dragging
    if (isDragging) return;
    
    setSelectedProvince(province);
    setShowOnlySelected(true);
    
    // Reset zoom when switching to single province view
    setZoom(initialZoom);
    
    // The bounds and viewBox will automatically update due to the useMemo dependencies
  }, [isDragging, initialZoom]);

  /**
   * Reset view to show all provinces
   */
  const resetView = useCallback(() => {
    setSelectedProvince(null);
    setShowOnlySelected(false);
    setZoom(initialZoom);
    // Don't set viewBox here - let it be recalculated when bounds change
  }, [initialZoom]);

  // Update viewBox when bounds change (when switching between views)
  useEffect(() => {
    setViewBox({
      x: 0,
      y: 0,
      width: mapDimensions.width,
      height: mapDimensions.height,
    });
  }, [mapDimensions]);

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
          const originalIndex = showOnlySelected && selectedProvince
            ? provinces.findIndex(p => p.id === province.id)
            : displayIndex;
          const pathData = showOnlySelected && selectedProvince
            ? polygonToSVGPath(province.coordinates, bounds, mapDimensions)
            : provincePaths[originalIndex];
          
          return (
            <path
              key={province.id || originalIndex}
              d={pathData}
              className={`custom-map__province ${
                selectedProvince?.id === province.id ? 'custom-map__province--selected' : ''
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
        </div>
        <div className="custom-map__buttons">
          <button
            onClick={resetView}
            className="custom-map__reset-button"
            type="button"
            aria-label={selectedProvince && showOnlySelected ? "Show all provinces" : "Reset map view to initial position"}
          >
            {selectedProvince && showOnlySelected ? "Show All" : "Reset View"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomMap;
