/**
 * Custom hook for handling keyboard events
 */

import { useEffect } from 'react';
import { Provinces } from '../utils/mapProjection';

interface UseMapKeyboardProps {
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  resetView: () => void;
}

export const useMapKeyboard = ({
  selectedProvince,
  showOnlySelected,
  resetView,
}: UseMapKeyboardProps) => {
  // Set up escape key listener to exit selected province
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProvince && showOnlySelected) {
        resetView();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProvince, showOnlySelected, resetView]);
};