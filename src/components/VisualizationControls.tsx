/**
 * Visualization Controls Component
 * Provides UI controls for configuring data visualizations
 */

import React, { useState, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { type VisualizationConfig, type DataSeries } from '../types/visualization';
import { COLOR_PALETTES } from '../utils/colorScales';

interface VisualizationControlsProps {
  /** Current visualization configuration */
  config: VisualizationConfig;
  /** Available data series */
  dataSeries: DataSeries[];
  /** Callback when configuration changes */
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  /** Callback when a new visualization is created */
  onCreateVisualization: (title: string, seriesIds: string[], config: VisualizationConfig) => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** CSS class name for styling */
  className?: string;
}

interface ControlsState {
  selectedSeries: string[];
  visualizationTitle: string;
  isExpanded: {
    type: boolean;
    colors: boolean;
    animation: boolean;
    legend: boolean;
  };
}

const VisualizationControls: React.FC<VisualizationControlsProps> = React.memo(({
  config,
  dataSeries,
  onConfigChange,
  onCreateVisualization,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslations();
  
  const [state, setState] = useState<ControlsState>({
    selectedSeries: [],
    visualizationTitle: '',
    isExpanded: {
      type: true,
      colors: false,
      animation: false,
      legend: false
    }
  });

  /**
   * Toggle expanded state for control sections
   */
  const toggleExpanded = useCallback((section: keyof ControlsState['isExpanded']) => {
    setState(prev => ({
      ...prev,
      isExpanded: {
        ...prev.isExpanded,
        [section]: !prev.isExpanded[section]
      }
    }));
  }, []);

  /**
   * Update visualization type
   */
  const updateVisualizationType = useCallback((type: VisualizationConfig['type']) => {
    onConfigChange({ type });
  }, [onConfigChange]);

  /**
   * Update color scale configuration
   */
  const updateColorScale = useCallback((colorScale: Partial<VisualizationConfig['colorScale']>) => {
    onConfigChange({
      colorScale: {
        ...config.colorScale,
        ...colorScale
      }
    });
  }, [config.colorScale, onConfigChange]);

  /**
   * Update animation configuration
   */
  const updateAnimation = useCallback((animation: Partial<VisualizationConfig['animation']>) => {
    onConfigChange({
      animation: {
        ...config.animation,
        ...animation
      }
    });
  }, [config.animation, onConfigChange]);

  /**
   * Update legend configuration
   */
  const updateLegend = useCallback((legend: Partial<VisualizationConfig['legend']>) => {
    onConfigChange({
      legend: {
        ...config.legend,
        ...legend
      }
    });
  }, [config.legend, onConfigChange]);

  /**
   * Handle data series selection
   */
  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setState(prev => ({
      ...prev,
      selectedSeries: prev.selectedSeries.includes(seriesId)
        ? prev.selectedSeries.filter(id => id !== seriesId)
        : [...prev.selectedSeries, seriesId]
    }));
  }, []);

  /**
   * Create new visualization
   */
  const handleCreateVisualization = useCallback(() => {
    if (state.selectedSeries.length === 0 || !state.visualizationTitle.trim()) {
      return;
    }
    
    onCreateVisualization(state.visualizationTitle, state.selectedSeries, config);
    
    // Reset state
    setState(prev => ({
      ...prev,
      selectedSeries: [],
      visualizationTitle: ''
    }));
  }, [state.selectedSeries, state.visualizationTitle, config, onCreateVisualization]);

  /**
   * Apply predefined color palette
   */
  const applyColorPalette = useCallback((paletteKey: string, paletteGroup: keyof typeof COLOR_PALETTES) => {
    const palette = COLOR_PALETTES[paletteGroup][paletteKey as keyof typeof COLOR_PALETTES[typeof paletteGroup]];
    if (palette) {
      updateColorScale({ palette: palette as string[] });
    }
  }, [updateColorScale]);

  // Get available color palettes 
  const getAvailablePalettes = (): Array<{key: string, group: keyof typeof COLOR_PALETTES}> => {
    return [
      ...Object.keys(COLOR_PALETTES.sequential).map(key => ({ key, group: 'sequential' as const })),
      ...Object.keys(COLOR_PALETTES.diverging).map(key => ({ key, group: 'diverging' as const })),
      ...Object.keys(COLOR_PALETTES.categorical).map(key => ({ key, group: 'categorical' as const }))
    ];
  };

  return (
    <div className={`visualization-controls ${className}`} data-testid="visualization-controls">
      {/* Data Series Selection */}
      <div className="control-section">
        <h3>{t('controls.dataSeries.title')}</h3>
        <div className="series-list">
          {dataSeries.length === 0 ? (
            <p className="no-data">{t('controls.dataSeries.noData')}</p>
          ) : (
            dataSeries.map(series => (
              <label key={series.id} className="series-item" data-testid={`series-${series.id}`}>
                <input
                  type="checkbox"
                  checked={state.selectedSeries.includes(series.id)}
                  onChange={() => toggleSeriesSelection(series.id)}
                  disabled={disabled}
                />
                <span className="series-info">
                  <strong>{series.name}</strong>
                  {series.description && (
                    <small>{series.description}</small>
                  )}
                  <small>{series.data.length} {t('controls.dataSeries.dataPoints')}</small>
                </span>
              </label>
            ))
          )}
        </div>
        
        {state.selectedSeries.length > 0 && (
          <div className="create-visualization">
            <input
              type="text"
              placeholder={t('controls.visualization.titlePlaceholder')}
              value={state.visualizationTitle}
              onChange={(e) => setState(prev => ({ ...prev, visualizationTitle: e.target.value }))}
              disabled={disabled}
              data-testid="visualization-title-input"
            />
            <button
              onClick={handleCreateVisualization}
              disabled={disabled || !state.visualizationTitle.trim()}
              className="create-button"
              data-testid="create-visualization-button"
            >
              {t('controls.visualization.create')}
            </button>
          </div>
        )}
      </div>

      {/* Visualization Type */}
      <div className="control-section">
        <button
          className="section-header"
          onClick={() => toggleExpanded('type')}
          data-testid="type-section-toggle"
        >
          <h3>{t('controls.type.title')}</h3>
          <span className={`expand-icon ${state.isExpanded.type ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {state.isExpanded.type && (
          <div className="type-options">
            {(['choropleth', 'heatmap', 'bubble', 'categorical', 'temporal'] as const).map(type => (
              <label key={type} className="type-option" data-testid={`type-${type}`}>
                <input
                  type="radio"
                  name="visualization-type"
                  value={type}
                  checked={config.type === type}
                  onChange={() => updateVisualizationType(type)}
                  disabled={disabled}
                />
                <span className="option-content">
                  <strong>{t(`controls.type.options.${type}.name`)}</strong>
                  <small>{t(`controls.type.options.${type}.description`)}</small>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color Configuration */}
      <div className="control-section">
        <button
          className="section-header"
          onClick={() => toggleExpanded('colors')}
          data-testid="colors-section-toggle"
        >
          <h3>{t('controls.colors.title')}</h3>
          <span className={`expand-icon ${state.isExpanded.colors ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {state.isExpanded.colors && (
          <div className="color-options">
            {/* Palette Selection */}
            <div className="form-field">
              <label>{t('controls.colors.palette')}</label>
              <select
                onChange={(e) => {
                  const [paletteKey, groupKey] = e.target.value.split(':');
                  applyColorPalette(paletteKey, groupKey as keyof typeof COLOR_PALETTES);
                }}
                disabled={disabled}
                data-testid="color-palette-select"
              >
                <option value="">Select palette...</option>
                {getAvailablePalettes().map(({ key, group }) => (
                  <option key={`${key}:${group}`} value={`${key}:${group}`}>
                    {key} ({group})
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Configuration */}
            {config.colorScale?.domain && (
              <div className="form-field">
                <label>Domain (min - max)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={config.colorScale.domain[0]}
                    onChange={(e) => updateColorScale({ 
                      domain: [Number(e.target.value), config.colorScale!.domain![1]] as [number, number]
                    })}
                    disabled={disabled}
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={config.colorScale.domain[1]}
                    onChange={(e) => updateColorScale({ 
                      domain: [config.colorScale!.domain![0], Number(e.target.value)] as [number, number]
                    })}
                    disabled={disabled}
                    placeholder="Max"
                  />
                </div>
              </div>
            )}

            {/* Logarithmic Scale */}
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={config.colorScale?.logarithmic || false}
                  onChange={(e) => updateColorScale({ logarithmic: e.target.checked })}
                  disabled={disabled}
                  data-testid="color-logarithmic-checkbox"
                />
Logarithmic scale
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Animation Configuration */}
      <div className="control-section">
        <button
          className="section-header"
          onClick={() => toggleExpanded('animation')}
          data-testid="animation-section-toggle"
        >
          <h3>{t('controls.animation.title')}</h3>
          <span className={`expand-icon ${state.isExpanded.animation ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {state.isExpanded.animation && (
          <div className="animation-options">
            <div className="form-field">
              <label>{t('controls.animation.duration')} ({config.animation?.duration || 1000}ms)</label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={config.animation?.duration || 1000}
                onChange={(e) => updateAnimation({ duration: Number(e.target.value) })}
                disabled={disabled}
                data-testid="animation-duration-slider"
              />
            </div>

            <div className="form-field">
              <label>{t('controls.animation.easing')}</label>
              <select
                value={config.animation?.easing || 'ease-out'}
                onChange={(e) => updateAnimation({ easing: e.target.value as any })}
                disabled={disabled}
                data-testid="animation-easing-select"
              >
                <option value="linear">{t('controls.animation.easingTypes.linear')}</option>
                <option value="ease-in">{t('controls.animation.easingTypes.easeIn')}</option>
                <option value="ease-out">{t('controls.animation.easingTypes.easeOut')}</option>
                <option value="ease-in-out">{t('controls.animation.easingTypes.easeInOut')}</option>
              </select>
            </div>

            {config.animation?.stagger !== undefined && (
              <div className="form-field">
                <label>{t('controls.animation.stagger')} ({config.animation.stagger}ms)</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={config.animation.stagger}
                  onChange={(e) => updateAnimation({ stagger: Number(e.target.value) })}
                  disabled={disabled}
                  data-testid="animation-stagger-slider"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend Configuration */}
      <div className="control-section">
        <button
          className="section-header"
          onClick={() => toggleExpanded('legend')}
          data-testid="legend-section-toggle"
        >
          <h3>{t('controls.legend.title')}</h3>
          <span className={`expand-icon ${state.isExpanded.legend ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {state.isExpanded.legend && (
          <div className="legend-options">
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={config.legend?.show ?? true}
                  onChange={(e) => updateLegend({ show: e.target.checked })}
                  disabled={disabled}
                  data-testid="legend-show-checkbox"
                />
                {t('controls.legend.show')}
              </label>
            </div>

            {config.legend?.show && (
              <>
                <div className="form-field">
                  <label>{t('controls.legend.position')}</label>
                  <select
                    value={config.legend.position || 'bottom'}
                    onChange={(e) => updateLegend({ position: e.target.value as any })}
                    disabled={disabled}
                    data-testid="legend-position-select"
                  >
                    <option value="top">{t('controls.legend.positions.top')}</option>
                    <option value="bottom">{t('controls.legend.positions.bottom')}</option>
                    <option value="left">{t('controls.legend.positions.left')}</option>
                    <option value="right">{t('controls.legend.positions.right')}</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>{t('controls.legend.customTitle')}</label>
                  <input
                    type="text"
                    placeholder={t('controls.legend.titlePlaceholder')}
                    value={config.legend.title || ''}
                    onChange={(e) => updateLegend({ title: e.target.value })}
                    disabled={disabled}
                    data-testid="legend-title-input"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

VisualizationControls.displayName = 'VisualizationControls';

export default VisualizationControls;