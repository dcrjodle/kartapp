import React from 'react';
import './MovingClouds.scss';

interface MovingCloudsProps {
  zoom: number;
  selectedProvince: any; // TODO: Type this properly with Province interface
}

const MovingClouds: React.FC<MovingCloudsProps> = ({ zoom, selectedProvince }) => {
  // Adjust cloud count and size based on province selection
  const isProvinceSelected = selectedProvince !== null;
  const cloudCount = isProvinceSelected ? 6 : 12; // Fewer clouds when province selected
  const provinceSizeMultiplier = isProvinceSelected ? 1.3 : 1; // Larger clouds when province selected
  
  // Generate clouds based on current count
  const clouds = Array.from({ length: cloudCount }, (_, i) => i + 1);
  
  // Calculate cloud effects based on zoom level
  // When zoom decreases (zooming in), clouds should get bigger and fade out
  // When zoom increases (zooming out), clouds should get smaller and more visible
  const zoomIn = Math.max(1 - zoom, 0); // How much we're zoomed in (0 = normal, positive = zoomed in)
  const cloudScale = Math.min(1 + zoomIn * 4, 3); // Scale up when zooming in
  const zoomOpacity = Math.max(1 - zoomIn * 2, 0); // Fade out when zooming in
  
  // Reduce opacity when a province is selected
  const provinceOpacity = isProvinceSelected ? 0.6 : 1;
  const cloudOpacity = zoomOpacity * provinceOpacity;
  
  // Apply province-specific scaling
  const finalScale = cloudScale * provinceSizeMultiplier;
  
  return (
    <div 
      className="clouds-container"
      data-testid="clouds"
      style={{
        transform: `scale(${finalScale})`,
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