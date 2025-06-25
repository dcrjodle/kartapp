/**
 * Hook for managing data visualization state and animations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DataVisualization, DataSeries, AnimationState, VisualizationConfig } from '../types/visualization';

export interface DataVisualizationState {
  /** Current visualization being displayed */
  currentVisualization: DataVisualization | null;
  /** Available data series */
  dataSeries: DataSeries[];
  /** Animation state */
  animation: AnimationState;
  /** Whether data is currently loading */
  loading: boolean;
  /** Error state */
  error: string | null;
}

export const useDataVisualization = () => {
  const [state, setState] = useState<DataVisualizationState>({
    currentVisualization: null,
    dataSeries: [],
    animation: {
      progress: 0,
      isPlaying: false,
      currentFrame: 0,
      totalFrames: 0,
      speed: 1,
    },
    loading: false,
    error: null,
  });

  const animationRef = useRef<number>();

  /**
   * Load a new data series
   */
  const loadDataSeries = useCallback((series: DataSeries) => {
    setState(prev => ({
      ...prev,
      dataSeries: [...prev.dataSeries, series],
      error: null,
    }));
  }, []);

  /**
   * Remove a data series
   */
  const removeDataSeries = useCallback((seriesId: string) => {
    setState(prev => ({
      ...prev,
      dataSeries: prev.dataSeries.filter(s => s.id !== seriesId),
    }));
  }, []);

  /**
   * Create a new visualization
   */
  const createVisualization = useCallback((
    title: string,
    seriesIds: string[],
    config: VisualizationConfig
  ) => {
    setState(prev => {
      const selectedSeries = prev.dataSeries.filter(s => seriesIds.includes(s.id));
      
      if (selectedSeries.length === 0) {
        return {
          ...prev,
          error: 'No valid data series selected for visualization',
        };
      }

      const visualization: DataVisualization = {
        id: `vis-${Date.now()}`,
        title,
        series: selectedSeries,
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        ...prev,
        currentVisualization: visualization,
        error: null,
      };
    });
  }, []);

  /**
   * Update visualization configuration
   */
  const updateVisualizationConfig = useCallback((config: Partial<VisualizationConfig>) => {
    setState(prev => {
      if (!prev.currentVisualization) return prev;

      return {
        ...prev,
        currentVisualization: {
          ...prev.currentVisualization,
          config: { ...prev.currentVisualization.config, ...config },
          updatedAt: new Date(),
        },
      };
    });
  }, []);

  /**
   * Start animation
   */
  const startAnimation = useCallback(() => {
    if (!state.currentVisualization) return;

    setState(prev => ({
      ...prev,
      animation: { ...prev.animation, isPlaying: true },
    }));

    const animate = () => {
      setState(prev => {
        if (!prev.animation.isPlaying) return prev;

        const config = prev.currentVisualization?.config.animation;
        const duration = config?.duration || 1000;
        const increment = (16 / duration) * prev.animation.speed; // 60fps

        let newProgress = prev.animation.progress + increment;
        
        if (newProgress >= 1) {
          newProgress = 1;
          return {
            ...prev,
            animation: {
              ...prev.animation,
              progress: newProgress,
              isPlaying: false,
            },
          };
        }

        return {
          ...prev,
          animation: { ...prev.animation, progress: newProgress },
        };
      });

      if (state.animation.isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [state.currentVisualization, state.animation.isPlaying]);

  /**
   * Pause animation
   */
  const pauseAnimation = useCallback(() => {
    setState(prev => ({
      ...prev,
      animation: { ...prev.animation, isPlaying: false },
    }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  /**
   * Reset animation
   */
  const resetAnimation = useCallback(() => {
    setState(prev => ({
      ...prev,
      animation: {
        ...prev.animation,
        progress: 0,
        isPlaying: false,
        currentFrame: 0,
      },
    }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  /**
   * Set animation speed
   */
  const setAnimationSpeed = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      animation: { ...prev.animation, speed: Math.max(0.1, Math.min(5, speed)) },
    }));
  }, []);

  /**
   * Get interpolated values for current animation frame
   */
  const getInterpolatedValues = useCallback((entityId: string): number | null => {
    if (!state.currentVisualization || state.animation.progress === 0) return null;

    const series = state.currentVisualization.series[0]; // Use first series for now
    if (!series) return null;

    const dataPoint = series.data.find(d => d.entityId === entityId);
    if (!dataPoint) return null;

    // Simple linear interpolation from 0 to target value
    return dataPoint.value * state.animation.progress;
  }, [state.currentVisualization, state.animation.progress]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Data management
    loadDataSeries,
    removeDataSeries,
    
    // Visualization management
    createVisualization,
    updateVisualizationConfig,
    
    // Animation controls
    startAnimation,
    pauseAnimation,
    resetAnimation,
    setAnimationSpeed,
    getInterpolatedValues,
    
    // Utility
    clearError,
  };
};