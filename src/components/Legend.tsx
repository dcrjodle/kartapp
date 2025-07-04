/**
 * Legend Component
 * Displays color scale legend for data visualizations
 */

import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface LegendItem {
  value: number | string;
  color: string;
  label: string;
}

interface LegendData {
  title: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';
  items: LegendItem[];
  unit?: string;
}

interface LegendProps {
  /** Legend data to display */
  data: LegendData | null;
  /** Whether the legend is visible */
  visible?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Callback when legend is clicked */
  onClick?: () => void;
}

const Legend: React.FC<LegendProps> = React.memo(({
  data,
  visible = true,
  className = '',
  onClick
}) => {
  const { t } = useTranslations();

  if (!data || !visible) {
    return null;
  }

  const isHorizontal = data.position === 'top' || data.position === 'bottom';
  const legendClassName = `legend legend--${data.position} ${isHorizontal ? 'legend--horizontal' : 'legend--vertical'} ${className}`.trim();

  return (
    <div 
      className={legendClassName}
      onClick={onClick}
      data-testid="legend"
    >
      <div className="legend__content">
        <div className="legend__header">
          <h4 className="legend__title" data-testid="legend-title">
            {data.title}
          </h4>
          {data.unit && (
            <span className="legend__unit" data-testid="legend-unit">
              ({data.unit})
            </span>
          )}
        </div>

        <div className="legend__scale" data-testid="legend-scale">
          {isHorizontal ? (
            <HorizontalScale items={data.items} />
          ) : (
            <VerticalScale items={data.items} />
          )}
        </div>

        <div className="legend__labels" data-testid="legend-labels">
          {data.items.length > 0 && (
            <>
              <span className="legend__label legend__label--min">
                {formatLegendValue(data.items[0].value)}
              </span>
              <span className="legend__label legend__label--max">
                {formatLegendValue(data.items[data.items.length - 1].value)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * Horizontal legend scale (gradient bar)
 */
const HorizontalScale: React.FC<{ items: LegendItem[] }> = React.memo(({ items }) => {
  const gradientStops = items.map((item, index) => {
    const position = (index / (items.length - 1)) * 100;
    return `${item.color} ${position}%`;
  }).join(', ');

  return (
    <div 
      className="legend__gradient legend__gradient--horizontal"
      style={{
        background: `linear-gradient(to right, ${gradientStops})`
      }}
      data-testid="horizontal-gradient"
    />
  );
});

/**
 * Vertical legend scale (gradient bar)
 */
const VerticalScale: React.FC<{ items: LegendItem[] }> = React.memo(({ items }) => {
  const gradientStops = items.map((item, index) => {
    const position = (index / (items.length - 1)) * 100;
    return `${item.color} ${position}%`;
  }).join(', ');

  return (
    <div 
      className="legend__gradient legend__gradient--vertical"
      style={{
        background: `linear-gradient(to bottom, ${gradientStops})`
      }}
      data-testid="vertical-gradient"
    />
  );
});

/**
 * Discrete legend items (for categorical data)
 */
interface DiscreteLegendProps {
  items: LegendItem[];
  layout: 'horizontal' | 'vertical';
}

export const DiscreteLegend: React.FC<DiscreteLegendProps> = React.memo(({ items, layout }) => {
  return (
    <div className={`legend__discrete legend__discrete--${layout}`} data-testid="discrete-legend">
      {items.map((item, index) => (
        <div key={index} className="legend__discrete-item" data-testid={`legend-item-${index}`}>
          <div 
            className="legend__color-swatch"
            style={{ backgroundColor: item.color }}
            data-testid={`color-swatch-${index}`}
          />
          <span className="legend__item-label" data-testid={`item-label-${index}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
});

/**
 * Advanced legend with interactive features
 */
interface InteractiveLegendProps extends LegendProps {
  /** Callback when a legend item is clicked */
  onItemClick?: (item: LegendItem, index: number) => void;
  /** Callback when a legend item is hovered */
  onItemHover?: (item: LegendItem | null, index: number | null) => void;
  /** Whether legend items are selectable */
  selectable?: boolean;
  /** Selected item indices */
  selectedItems?: number[];
}

export const InteractiveLegend: React.FC<InteractiveLegendProps> = React.memo(({
  data,
  visible = true,
  className = '',
  onItemClick,
  onItemHover,
  selectable = false,
  selectedItems = []
}) => {
  if (!data || !visible) {
    return null;
  }

  const isHorizontal = data.position === 'top' || data.position === 'bottom';

  return (
    <div className={`legend legend--interactive legend--${data.position} ${className}`} data-testid="interactive-legend">
      <div className="legend__content">
        <div className="legend__header">
          <h4 className="legend__title">{data.title}</h4>
          {data.unit && <span className="legend__unit">({data.unit})</span>}
        </div>

        <div className="legend__items">
          {data.items.map((item, index) => (
            <div
              key={index}
              className={`legend__interactive-item ${selectable && selectedItems.includes(index) ? 'legend__interactive-item--selected' : ''}`}
              onClick={() => onItemClick?.(item, index)}
              onMouseEnter={() => onItemHover?.(item, index)}
              onMouseLeave={() => onItemHover?.(null, null)}
              data-testid={`interactive-item-${index}`}
            >
              <div 
                className="legend__color-indicator"
                style={{ backgroundColor: item.color }}
              />
              <div className="legend__item-info">
                <span className="legend__item-value">{formatLegendValue(item.value)}</span>
                <span className="legend__item-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Minimal legend for overlay display
 */
interface MinimalLegendProps {
  title: string;
  colorStops: Array<{ color: string; label: string }>;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const MinimalLegend: React.FC<MinimalLegendProps> = React.memo(({
  title,
  colorStops,
  position = 'bottom-right'
}) => {
  return (
    <div className={`legend legend--minimal legend--${position}`} data-testid="minimal-legend">
      <div className="legend__minimal-content">
        <div className="legend__minimal-title">{title}</div>
        <div className="legend__minimal-scale">
          {colorStops.map((stop, index) => (
            <div key={index} className="legend__minimal-stop">
              <div 
                className="legend__minimal-color"
                style={{ backgroundColor: stop.color }}
              />
              <span className="legend__minimal-label">{stop.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Legend.displayName = 'Legend';
DiscreteLegend.displayName = 'DiscreteLegend';
InteractiveLegend.displayName = 'InteractiveLegend';
MinimalLegend.displayName = 'MinimalLegend';

export default Legend;

// Helper functions

/**
 * Format a legend value for display
 */
function formatLegendValue(value: number | string): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (value % 1 === 0) {
    return value.toString();
  } else {
    return value.toFixed(1);
  }
}

/**
 * Generate legend data from color scale
 */
export function generateLegendData(
  title: string,
  colorScale: any,
  unit?: string,
  position: LegendData['position'] = 'bottom-right'
): LegendData {
  const items = colorScale.getLegendInfo?.(5) || [];
  
  return {
    title,
    position,
    items,
    unit
  };
}