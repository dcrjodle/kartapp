/**
 * Map interaction utilities for handling user input events
 */

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Calculate zoom factor based on wheel delta
 */
export const calculateZoomFactor = (deltaY: number): number => {
  return deltaY > 0 ? 1.05 : 0.95;
};

/**
 * Constrain zoom level to reasonable bounds
 */
export const constrainZoom = (zoom: number, min: number = 0.1, max: number = 5): number => {
  return Math.max(min, Math.min(max, zoom));
};

/**
 * Calculate new viewBox after zoom operation
 */
export const calculateZoomedViewBox = (
  currentViewBox: ViewBox,
  zoomFactor: number,
  mousePosition: MousePosition,
  containerRect: DOMRect
): ViewBox => {
  const newWidth = currentViewBox.width * zoomFactor;
  const newHeight = currentViewBox.height * zoomFactor;
  
  // Calculate zoom center based on mouse position
  const mouseX = mousePosition.x - containerRect.left;
  const mouseY = mousePosition.y - containerRect.top;
  
  const newX = currentViewBox.x + (mouseX / containerRect.width) * (currentViewBox.width - newWidth);
  const newY = currentViewBox.y + (mouseY / containerRect.height) * (currentViewBox.height - newHeight);
  
  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
};

/**
 * Calculate new viewBox after pan operation
 * Scales delta values based on current viewBox size for natural dragging behavior
 */
export const calculatePannedViewBox = (
  currentViewBox: ViewBox,
  deltaX: number,
  deltaY: number,
  zoom: number = 1
): ViewBox => {
  // Scale delta values based on current viewBox size relative to original
  // When zoomed in (smaller viewBox), dragging should move less in viewBox coordinates
  // When zoomed out (larger viewBox), dragging should move more in viewBox coordinates
  const scaleFactor = currentViewBox.width / 1000; // Assuming 1000 is roughly the original width
  
  return {
    ...currentViewBox,
    x: currentViewBox.x - (deltaX * scaleFactor),
    y: currentViewBox.y - (deltaY * scaleFactor)
  };
};