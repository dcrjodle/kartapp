import React from 'react';
import './MovingClouds.scss';

interface MovingCloudsProps {
  zoom: number;
  selectedProvince: any;
}

const MovingClouds: React.FC<MovingCloudsProps> = ({ zoom, selectedProvince }) => {
  // Generate multiple clouds with different properties
  const clouds = Array.from({ length: 8 }, (_, i) => i + 1);
  
  // Calculate cloud effects based on zoom level
  const cloudScale = Math.min(1 + (zoom - 1) * 2, 3); // Scale up to 3x at zoom level 2
  const cloudOpacity = Math.max(1 - (zoom - 1) * 1.5, 0); // Fade out as zoom increases
  
  return (
    <div 
      className="clouds-container"
      style={{
        transform: `scale(${cloudScale})`,
        opacity: cloudOpacity,
        transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
      }}
    >
      {/* SVG filter definitions */}
      <svg width="0" height="0" className="cloud-filters">
        <defs>
          <filter id="cloud-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.012" 
              numOctaves="4" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              scale="170" 
            />
          </filter>
        </defs>
      </svg>
      
      {/* Cloud elements */}
      {clouds.map((cloudNumber) => (
        <div 
          key={cloudNumber} 
          className={`cloud-circle cloud-${cloudNumber}`}
        ></div>
      ))}
    </div>
  );
};

export default MovingClouds;