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
  type Municipality,
  type Bounds,
  type MapDimensions,
} from "../utils/mapProjection";
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
  /** Array of municipality data with coordinate polygons */
  municipalities: Municipality[];
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
  municipalities,
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

  // Memoized calculations for performance
  const bounds: Bounds = useMemo(
    () => calculateGeographicBounds(municipalities),
    [municipalities]
  );

  const mapDimensions: MapDimensions = useMemo(
    () => calculateMapDimensions(bounds),
    [bounds]
  );

  // Initialize viewBox with proper dimensions
  const [viewBox, setViewBox] = useState<ViewBox>(() => ({
    x: 0,
    y: 0,
    width: mapDimensions.width,
    height: mapDimensions.height,
  }));

  // Pre-calculate all municipality SVG paths for performance
  const municipalityPaths = useMemo(
    () =>
      municipalities.map((municipality) =>
        polygonToSVGPath(municipality.coordinates, bounds, mapDimensions)
      ),
    [municipalities, bounds, mapDimensions]
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
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

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
    [zoom, minZoom, maxZoom]
  );

  /**
   * Reset view to initial position and zoom
   */
  const resetView = useCallback(() => {
    setViewBox({
      x: 0,
      y: 0,
      width: mapDimensions.width,
      height: mapDimensions.height,
    });
    setZoom(initialZoom);
  }, [mapDimensions, initialZoom]);

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
    isDragging ? "custom-map__svg--grabbing" : "custom-map__svg--grab"
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

        {/* Municipality polygons */}
        {municipalityPaths.map((pathData, index) => (
          <path
            key={municipalities[index].id || index}
            d={pathData}
            className="custom-map__municipality"
          >
            <title>{municipalities[index].name}</title>
          </path>
        ))}
      </svg>

      {/* Control panel */}
      <div className="custom-map__controls">
        <div className="custom-map__info">
          <div className="custom-map__info-item">Zoom: {zoom.toFixed(2)}</div>
          <div className="custom-map__info-item">
            Municipalities: {municipalities.length}
          </div>
          <div className="custom-map__info-item">
            Bounds: {bounds.minLat.toFixed(1)}°-{bounds.maxLat.toFixed(1)}°N,{" "}
            {bounds.minLng.toFixed(1)}°-{bounds.maxLng.toFixed(1)}°E
          </div>
        </div>
        <button
          onClick={resetView}
          className="custom-map__reset-button"
          type="button"
          aria-label="Reset map view to initial position"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};

export default CustomMap;
