import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

interface Municipality {
  coordinates: number[][][];
  name?: string;
  id?: string;
}

interface CustomMapProps {
  municipalities: Municipality[];
}

const CustomMap: React.FC<CustomMapProps> = ({ municipalities }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Calculate bounds of all municipalities (memoized)
  const bounds = useMemo(() => {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    municipalities.forEach(municipality => {
      municipality.coordinates.forEach(ring => {
        ring.forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      });
    });

    return { minLng, maxLng, minLat, maxLat };
  }, [municipalities]);

  // Calculate proper dimensions with better aspect ratio
  const mapDimensions = useMemo(() => {
    const lngRange = bounds.maxLng - bounds.minLng;
    const latRange = bounds.maxLat - bounds.minLat;
    
    // Use a more reasonable aspect ratio calculation
    // At Sweden's latitude (~55-69°), 1 degree longitude ≈ 0.5-0.6 degrees latitude in visual distance
    const aspectRatio = latRange / (lngRange * 0.55); // Adjust for latitude compression
    
    const baseWidth = 1000;
    const calculatedHeight = baseWidth * aspectRatio;
    
    // Ensure minimum height to prevent over-compression
    const minHeight = 400;
    const height = Math.max(calculatedHeight, minHeight);
    
    return { width: baseWidth, height };
  }, [bounds]);

  // Initialize viewBox with proper dimensions
  const [viewBox, setViewBox] = useState(() => ({ 
    x: 0, 
    y: 0, 
    width: mapDimensions.width, 
    height: mapDimensions.height 
  }));

  // Project geographic coordinates using Mercator projection
  const projectToSVG = useCallback((lng: number, lat: number) => {
    // Mercator projection formulas
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    
    // Convert longitude to x (simple linear scaling)
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapDimensions.width;
    
    // Convert latitude using Mercator projection
    const latRad = toRadians(lat);
    const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    
    const minLatRad = toRadians(bounds.minLat);
    const maxLatRad = toRadians(bounds.maxLat);
    const minMercatorY = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
    const maxMercatorY = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
    
    const y = ((maxMercatorY - mercatorY) / (maxMercatorY - minMercatorY)) * mapDimensions.height;
    
    return [x, y];
  }, [bounds, mapDimensions]);

  // Pre-calculate all paths using Mercator projection (memoized for performance)
  const municipalityPaths = useMemo(() => {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    const minLatRad = toRadians(bounds.minLat);
    const maxLatRad = toRadians(bounds.maxLat);
    const minMercatorY = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
    const maxMercatorY = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
    
    return municipalities.map(municipality => {
      return municipality.coordinates.map(ring => {
        const pathData = ring.map(([lng, lat], index) => {
          // Mercator projection
          const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapDimensions.width;
          
          const latRad = toRadians(lat);
          const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
          const y = ((maxMercatorY - mercatorY) / (maxMercatorY - minMercatorY)) * mapDimensions.height;
          
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';
        return pathData;
      }).join(' ');
    });
  }, [municipalities, bounds, mapDimensions]);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setViewBox(prev => ({
      ...prev,
      x: prev.x - deltaX,
      y: prev.y - deltaY,
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom with proper event listener
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    setZoom(prev => Math.max(0.1, Math.min(10, prev * zoomFactor)));
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setViewBox(prev => {
        const newWidth = prev.width * zoomFactor;
        const newHeight = prev.height * zoomFactor;
        const newX = prev.x + (mouseX / rect.width) * (prev.width - newWidth);
        const newY = prev.y + (mouseY / rect.height) * (prev.height - newHeight);
        
        return { x: newX, y: newY, width: newWidth, height: newHeight };
      });
    }
  }, []);

  // Add wheel event listener with passive: false
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        svg.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  const resetView = () => {
    setViewBox({ x: 0, y: 0, width: mapDimensions.width, height: mapDimensions.height });
    setZoom(1);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Geographic grid lines */}
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={mapDimensions.width} height={mapDimensions.height} fill="url(#grid)" />
        
        {/* Longitude lines (meridians) */}
        {Array.from({ length: Math.ceil((bounds.maxLng - bounds.minLng) / 2) }, (_, i) => {
          const lng = bounds.minLng + (i * 2);
          if (lng <= bounds.maxLng) {
            const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapDimensions.width;
            return (
              <line
                key={`meridian-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={mapDimensions.height}
                stroke="#ccc"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            );
          }
          return null;
        })}
        
        {/* Latitude lines (parallels) - curved for Mercator */}
        {Array.from({ length: Math.ceil((bounds.maxLat - bounds.minLat) / 2) }, (_, i) => {
          const lat = bounds.minLat + (i * 2);
          if (lat <= bounds.maxLat) {
            const toRadians = (degrees: number) => degrees * Math.PI / 180;
            const minLatRad = toRadians(bounds.minLat);
            const maxLatRad = toRadians(bounds.maxLat);
            const minMercatorY = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
            const maxMercatorY = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
            
            const latRad = toRadians(lat);
            const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
            const y = ((maxMercatorY - mercatorY) / (maxMercatorY - minMercatorY)) * mapDimensions.height;
            
            return (
              <line
                key={`parallel-${i}`}
                x1={0}
                y1={y}
                x2={mapDimensions.width}
                y2={y}
                stroke="#ccc"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            );
          }
          return null;
        })}
        
        {/* Render municipalities */}
        {municipalityPaths.map((pathData, index) => (
          <path
            key={index}
            d={pathData}
            fill="#4a90e2"
            fillOpacity="0.7"
            stroke="#2c5aa0"
            strokeWidth="1"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.fillOpacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.fillOpacity = '0.7';
            }}
          />
        ))}
      </svg>
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
          <div>Zoom: {zoom.toFixed(2)}</div>
          <div>Municipalities: {municipalities.length}</div>
        </div>
        <button
          onClick={resetView}
          style={{
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Reset View
        </button>
      </div>
    </div>
  );
};

export default CustomMap;