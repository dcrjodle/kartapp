/**
 * Custom hook for handling map interactions (pan, zoom, clicks)
 */

import { useCallback, useRef } from 'react';
import {
  calculateZoomFactor,
  constrainZoom,
  calculateZoomedViewBox,
  calculatePannedViewBox,
  type ViewBox,
  type MousePosition,
} from '../utils/mapInteractions';
import { Provinces } from '../utils/mapProjection';

interface UseMapInteractionsProps {
  // State values
  isDragging: boolean;
  hasDragged: boolean;
  lastMousePos: MousePosition;
  zoom: number;
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  showCounties: boolean;
  
  // State setters
  setIsDragging: (value: boolean) => void;
  setHasDragged: (value: boolean) => void;
  setLastMousePos: (value: MousePosition) => void;
  setZoom: (value: number) => void;
  setViewBox: (value: ViewBox | ((prev: ViewBox) => ViewBox)) => void;
  setSelectedProvince: (value: Provinces | null) => void;
  setShowOnlySelected: (value: boolean) => void;
  setShowCounties: (value: boolean) => void;
  
  // Configuration
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
}

export const useMapInteractions = ({
  isDragging,
  hasDragged,
  lastMousePos,
  zoom,
  selectedProvince,
  showOnlySelected,
  showCounties,
  setIsDragging,
  setHasDragged,
  setLastMousePos,
  setZoom,
  setViewBox,
  setSelectedProvince,
  setShowOnlySelected,
  setShowCounties,
  minZoom,
  maxZoom,
  initialZoom,
}: UseMapInteractionsProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  /**
   * Handle mouse down event to start dragging
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Disable panning when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }
    setIsDragging(true);
    setHasDragged(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [showOnlySelected, selectedProvince, setIsDragging, setHasDragged, setLastMousePos]);

  /**
   * Handle mouse move event for panning
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    // Mark as dragged if there's significant movement
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setHasDragged(true);
    }

    setViewBox((prev) => {
      const newViewBox = calculatePannedViewBox(prev, deltaX, deltaY);
      return newViewBox;
    });
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, setHasDragged, setViewBox, setLastMousePos]);

  /**
   * Handle mouse up event to stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  /**
   * Handle wheel event for zooming with proper event prevention
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    // Disable zoom when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }

    const zoomFactor = calculateZoomFactor(e.deltaY);
    const newZoom = constrainZoom(zoom * zoomFactor, minZoom, maxZoom);
    
    // Only proceed if zoom actually changed
    if (newZoom !== zoom) {
      setZoom(newZoom);

      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const mousePosition: MousePosition = { x: e.clientX, y: e.clientY };
        setViewBox((prev) => {
          const newViewBox = calculateZoomedViewBox(
            prev,
            zoomFactor,
            mousePosition,
            rect
          );
          return newViewBox;
        });
      }
    }
  }, [zoom, minZoom, maxZoom, showOnlySelected, selectedProvince, setZoom, setViewBox]);

  /**
   * Handle province click - zoom to province and show counties
   */
  const handleProvinceClick = useCallback((province: Provinces, _index: number) => {
    // Don't handle click if we just finished dragging
    if (hasDragged) return;
    
    setSelectedProvince(province);
    setShowOnlySelected(true);
    setShowCounties(true);
    
    // Reset zoom when switching to single province view
    setZoom(initialZoom);
    
    // The bounds and viewBox will automatically update due to the useMemo dependencies
  }, [hasDragged, initialZoom, setSelectedProvince, setShowOnlySelected, setShowCounties, setZoom]);

  return {
    svgRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleProvinceClick,
  };
};