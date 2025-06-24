import React from 'react';
import './MovingClouds.scss';

const MovingClouds: React.FC = () => {
  // Generate multiple clouds with different properties
  const clouds = Array.from({ length: 8 }, (_, i) => i + 1);
  
  return (
    <div className="clouds-container">
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