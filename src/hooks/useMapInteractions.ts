/**
 * Custom hook for handling map interactions (pan, zoom, clicks)
 */

import { useCallback, useRef, useState } from 'react';
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
  
  // State setters
  setIsDragging: (value: boolean) => void;
  setHasDragged: (value: boolean) => void;
  setLastMousePos: (value: MousePosition) => void;
  setZoom: (value: number) => void;
  setViewBox: (value: ViewBox | ((prev: ViewBox) => ViewBox)) => void;
  setSelectedProvince: (value: Provinces | null) => void;
  setShowOnlySelected: (value: boolean) => void;
  
  // Configuration
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
}

interface TouchState {
  active: boolean;
  touches: Array<{ id: number; x: number; y: number }>;
  lastDistance: number;
  lastCenter: { x: number; y: number };
}

export const useMapInteractions = ({
  isDragging,
  hasDragged,
  lastMousePos,
  zoom,
  selectedProvince,
  showOnlySelected,
  setIsDragging,
  setHasDragged,
  setLastMousePos,
  setZoom,
  setViewBox,
  setSelectedProvince,
  setShowOnlySelected,
  minZoom,
  maxZoom,
  initialZoom,
}: UseMapInteractionsProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    active: false,
    touches: [],
    lastDistance: 0,
    lastCenter: { x: 0, y: 0 }
  });

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
      const newViewBox = calculatePannedViewBox(prev, deltaX, deltaY, zoom);
      return newViewBox;
    });
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, zoom, setHasDragged, setViewBox, setLastMousePos]);

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
   * Handle province click - zoom to province
   */
  const handleProvinceClick = useCallback((province: Provinces, _index: number) => {
    // Don't handle click if we just finished dragging
    if (hasDragged) return;
    
    setSelectedProvince(province);
    setShowOnlySelected(true);
    
    // Reset zoom when switching to single province view
    setZoom(initialZoom);
    
    // The bounds and viewBox will automatically update due to the useMemo dependencies
  }, [hasDragged, initialZoom, setSelectedProvince, setShowOnlySelected, setZoom]);

  /**
   * Handle zoom in button click
   */
  const handleZoomIn = useCallback(() => {
    // Disable zoom when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }

    const zoomFactor = 1.2; // 20% zoom in
    const newZoom = constrainZoom(zoom * zoomFactor, minZoom, maxZoom);
    
    if (newZoom !== zoom) {
      setZoom(newZoom);
      setViewBox((prev) => {
        // Zoom towards center of viewport
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const centerPosition: MousePosition = { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          };
          return calculateZoomedViewBox(prev, zoomFactor, centerPosition, rect);
        }
        return prev;
      });
    }
  }, [zoom, minZoom, maxZoom, showOnlySelected, selectedProvince, setZoom, setViewBox]);

  /**
   * Handle zoom out button click
   */
  const handleZoomOut = useCallback(() => {
    // Disable zoom when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }

    const zoomFactor = 1 / 1.2; // 20% zoom out
    const newZoom = constrainZoom(zoom * zoomFactor, minZoom, maxZoom);
    
    if (newZoom !== zoom) {
      setZoom(newZoom);
      setViewBox((prev) => {
        // Zoom towards center of viewport
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const centerPosition: MousePosition = { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          };
          return calculateZoomedViewBox(prev, zoomFactor, centerPosition, rect);
        }
        return prev;
      });
    }
  }, [zoom, minZoom, maxZoom, showOnlySelected, selectedProvince, setZoom, setViewBox]);

  /**
   * Helper function to calculate distance between two touches
   */
  const calculateDistance = useCallback((touch1: { x: number; y: number }, touch2: { x: number; y: number }) => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Helper function to calculate center point between touches
   */
  const calculateCenter = useCallback((touches: Array<{ x: number; y: number }>) => {
    if (touches.length === 0) return { x: 0, y: 0 };
    
    const sum = touches.reduce((acc, touch) => ({
      x: acc.x + touch.x,
      y: acc.y + touch.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / touches.length,
      y: sum.y / touches.length
    };
  }, []);

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    // Disable interactions when showing only selected province
    if (showOnlySelected && selectedProvince) {
      return;
    }

    const touches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));

    const center = calculateCenter(touches);
    
    setTouchState({
      active: true,
      touches,
      lastDistance: touches.length === 2 ? calculateDistance(touches[0], touches[1]) : 0,
      lastCenter: center
    });

    // For single touch, also set mouse state for consistency
    if (touches.length === 1) {
      setIsDragging(true);
      setHasDragged(false);
      setLastMousePos({ x: touches[0].x, y: touches[0].y });
    }
  }, [showOnlySelected, selectedProvince, calculateCenter, calculateDistance, setIsDragging, setHasDragged, setLastMousePos]);

  /**
   * Handle touch move event
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!touchState.active) return;

    const touches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));

    if (touches.length === 1) {
      // Single touch - pan
      const touch = touches[0];
      const deltaX = touch.x - touchState.lastCenter.x;
      const deltaY = touch.y - touchState.lastCenter.y;
      
      // Mark as dragged if there's significant movement
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setHasDragged(true);
      }

      setViewBox((prev) => {
        const newViewBox = calculatePannedViewBox(prev, deltaX, deltaY, zoom);
        return newViewBox;
      });
      
      // Update mouse position for consistency
      setLastMousePos({ x: touch.x, y: touch.y });
      
    } else if (touches.length === 2) {
      // Two touches - pinch to zoom
      const newDistance = calculateDistance(touches[0], touches[1]);
      const newCenter = calculateCenter(touches);
      
      if (touchState.lastDistance > 0) {
        const zoomFactor = newDistance / touchState.lastDistance;
        const newZoom = constrainZoom(zoom * zoomFactor, minZoom, maxZoom);
        
        if (newZoom !== zoom) {
          setZoom(newZoom);
          
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const mousePosition: MousePosition = { x: newCenter.x, y: newCenter.y };
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
      }
      
      // Pan with center movement
      if (touchState.touches.length === 2) {
        const deltaX = newCenter.x - touchState.lastCenter.x;
        const deltaY = newCenter.y - touchState.lastCenter.y;
        
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          setViewBox((prev) => {
            const newViewBox = calculatePannedViewBox(prev, deltaX, deltaY, zoom);
            return newViewBox;
          });
        }
      }
    }

    // Update touch state
    setTouchState(prev => ({
      ...prev,
      touches,
      lastDistance: touches.length === 2 ? calculateDistance(touches[0], touches[1]) : prev.lastDistance,
      lastCenter: calculateCenter(touches)
    }));
  }, [
    touchState, 
    zoom, 
    minZoom, 
    maxZoom, 
    calculateDistance, 
    calculateCenter, 
    setHasDragged, 
    setViewBox, 
    setLastMousePos, 
    setZoom
  ]);

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const remainingTouches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));

    if (remainingTouches.length === 0) {
      // All touches ended
      setTouchState({
        active: false,
        touches: [],
        lastDistance: 0,
        lastCenter: { x: 0, y: 0 }
      });
      setIsDragging(false);
    } else {
      // Update remaining touches
      setTouchState(prev => ({
        ...prev,
        touches: remainingTouches,
        lastDistance: remainingTouches.length === 2 ? calculateDistance(remainingTouches[0], remainingTouches[1]) : 0,
        lastCenter: calculateCenter(remainingTouches)
      }));
    }
  }, [calculateDistance, calculateCenter, setIsDragging]);

  return {
    svgRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleProvinceClick,
    handleZoomIn,
    handleZoomOut,
  };
};