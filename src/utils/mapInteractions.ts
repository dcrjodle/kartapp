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
  return deltaY > 0 ? 1.1 : 0.9;
};

/**
 * Constrain zoom level to reasonable bounds
 */
export const constrainZoom = (zoom: number, min: number = 0.1, max: number = 10): number => {
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
 */
export const calculatePannedViewBox = (
  currentViewBox: ViewBox,
  deltaX: number,
  deltaY: number
): ViewBox => {
  return {
    ...currentViewBox,
    x: currentViewBox.x - deltaX,
    y: currentViewBox.y - deltaY
  };
};