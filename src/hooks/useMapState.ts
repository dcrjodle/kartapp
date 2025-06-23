/**
 * Custom hook for managing map state
 */

import { useState, useCallback } from 'react';
import { Provinces } from '../utils/mapProjection';
import { ViewBox, MousePosition } from '../utils/mapInteractions';

export interface MapState {
  // Interactive state
  isDragging: boolean;
  hasDragged: boolean;
  lastMousePos: MousePosition;
  zoom: number;
  viewBox: ViewBox;
  
  // Province selection state
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  
  // Counties display state
  showCounties: boolean;
}

export const useMapState = (initialZoom: number = 1) => {
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(initialZoom);
  const [selectedProvince, setSelectedProvince] = useState<Provinces | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showCounties, setShowCounties] = useState(false);
  
  // Initialize viewBox with proper dimensions
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });

  // Reset all state to initial values
  const resetState = useCallback(() => {
    setSelectedProvince(null);
    setShowOnlySelected(false);
    setShowCounties(false);
    setZoom(initialZoom);
    setIsDragging(false);
    setHasDragged(false);
    setLastMousePos({ x: 0, y: 0 });
  }, [initialZoom]);

  return {
    // State values
    isDragging,
    hasDragged,
    lastMousePos,
    zoom,
    viewBox,
    selectedProvince,
    showOnlySelected,
    showCounties,
    
    // State setters
    setIsDragging,
    setHasDragged,
    setLastMousePos,
    setZoom,
    setViewBox,
    setSelectedProvince,
    setShowOnlySelected,
    setShowCounties,
    
    // Actions
    resetState,
  };
};