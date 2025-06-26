/**
 * MapControls Component
 * 
 * Displays map information and control buttons
 */

import React, { memo, useState } from 'react';
import { type Provinces, type Bounds } from '../utils/mapProjection';
import { type ViewBox } from '../utils/mapInteractions';
import { useTranslations } from '../hooks/useTranslations';
import { QueryService, type QueryResponse } from '../services/queryService';
import { createLLMService } from '../services/llmService';
import './MapControls.scss';

interface MapControlsProps {
  zoom: number;
  selectedProvince: Provinces | null;
  showOnlySelected: boolean;
  provinces: Provinces[];
  bounds: Bounds;
  viewBox: ViewBox;
  onResetView: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onProvinceSelect?: (province: Provinces) => void;
  onHighlightProvinces?: (provinces: string[]) => void;
}

const MapControls: React.FC<MapControlsProps> = memo(({
  zoom,
  selectedProvince,
  showOnlySelected,
  provinces,
  bounds,
  viewBox,
  onResetView,
  onZoomIn,
  onZoomOut,
  onProvinceSelect,
  onHighlightProvinces,
}) => {
  const { t } = useTranslations();
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setQueryResult(null);

    try {
      // Debug environment variables
      console.log('REACT_APP_LLM_API_KEY:', process.env.REACT_APP_LLM_API_KEY ? 'Found' : 'Not found');
      
      const llmService = createLLMService();
      const queryService = new QueryService(llmService);
      
      const response = await queryService.processQuery({
        query: query.trim(),
        availableProvinces: provinces.map(p => p.name),
        currentData: {
          type: 'provinces',
          count: provinces.length,
          available: true
        }
      });

      setQueryResult(response);

      // Execute the action if successful
      if (response.success && response.action) {
        switch (response.action.type) {
          case 'select_province':
            if (onProvinceSelect && response.action.targets.length > 0) {
              const targetProvince = provinces.find(p => 
                p.name.toLowerCase() === response.action!.targets[0].toLowerCase()
              );
              if (targetProvince) {
                onProvinceSelect(targetProvince);
              }
            }
            break;
          case 'highlight_provinces':
            if (onHighlightProvinces) {
              onHighlightProvinces(response.action.targets);
            }
            break;
        }
      }
    } catch (error) {
      setQueryResult({
        success: false,
        intent: 'unavailable',
        entities: [],
        message: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQueryClear = () => {
    setQuery('');
    setQueryResult(null);
  };
  
  return (
    <div className="map-controls" role="region" aria-label={t('map.title')} data-testid="map-controls">
      <div className="map-controls__header">
        <h2 className="map-controls__title">{t('map.title')}</h2>
      </div>

      {/* Natural Language Query Section */}
      <div className="map-controls__section map-controls__section--query">
        <h3 className="map-controls__section-title">Ask about the map</h3>
        <form onSubmit={handleQuerySubmit} className="map-controls__query-form">
          <div className="map-controls__query-input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'show me Stockholm', 'provinces with highest population'"
              className="map-controls__query-input"
              disabled={isProcessing}
              data-testid="query-input"
              aria-label="Map query input"
            />
            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="map-controls__query-submit"
              data-testid="query-submit"
            >
              {isProcessing ? '...' : 'Ask'}
            </button>
            {query && (
              <button
                type="button"
                onClick={handleQueryClear}
                className="map-controls__query-clear"
                data-testid="query-clear"
                aria-label="Clear query"
              >
                ×
              </button>
            )}
          </div>
        </form>
        
        {/* Query Result */}
        {queryResult && (
          <div className={`map-controls__query-result ${queryResult.success ? 'success' : 'error'}`} data-testid="query-result">
            <div className="map-controls__query-message">
              {queryResult.message}
            </div>
            {queryResult.confidence > 0 && (
              <div className="map-controls__query-confidence">
                Confidence: {Math.round(queryResult.confidence * 100)}%
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="map-controls__section map-controls__section--info">
        <h3 className="map-controls__section-title">{t('map.information')}</h3>
        <div className="map-controls__info">
        <div className="map-controls__info-item">
          {t('map.zoom')}: {zoom.toFixed(2)}
          {showOnlySelected && selectedProvince && (
            <span className="map-controls__zoom-disabled"> {t('map.zoomDisabled')}</span>
          )}
        </div>
        {selectedProvince && showOnlySelected ? (
          <div className="map-controls__info-item" data-testid="province-info">
            {t('map.selected')}: {selectedProvince.name}
          </div>
        ) : (
          <div className="map-controls__info-item">
            {t('map.provinces')}: {provinces.length}
          </div>
        )}
        <div className="map-controls__info-item">
          {t('map.bounds')}: {bounds.minLat.toFixed(1)}°-{bounds.maxLat.toFixed(1)}°N,{" "}
          {bounds.minLng.toFixed(1)}°-{bounds.maxLng.toFixed(1)}°E
        </div>
        <div className="map-controls__info-item">
          {t('map.viewBox')}: ({viewBox.x.toFixed(0)}, {viewBox.y.toFixed(0)})
        </div>
        {/* Placeholder for city info */}
          <div className="map-controls__info-item" data-testid="city-info" style={{ display: 'none' }}>
            City information placeholder
          </div>
        </div>
      </div>
      
      <div className="map-controls__section map-controls__section--controls">
        <h3 className="map-controls__section-title">{t('map.controls')}</h3>
        <div className="map-controls__buttons">
        <div className="map-controls__zoom-buttons">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="map-controls__zoom-button"
              type="button"
              data-testid="zoom-out"
              aria-label={t('map.zoomOut')}
              disabled={showOnlySelected && !!selectedProvince}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="map-controls__zoom-button"
              type="button"
              data-testid="zoom-in"
              aria-label={t('map.zoomIn')}
              disabled={showOnlySelected && !!selectedProvince}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onResetView}
          className="map-controls__reset-button"
          type="button"
          data-testid="reset-view"
          aria-label={
            selectedProvince && showOnlySelected
              ? t('map.showAllProvinces')
              : t('map.resetMapView')
          }
        >
          {selectedProvince && showOnlySelected ? t('map.showAll') : t('map.resetView')}
        </button>
        </div>
      </div>
    </div>
  );
});

MapControls.displayName = 'MapControls';

export default MapControls;