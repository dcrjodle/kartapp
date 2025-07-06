/**
 * HandDrawnFilters Component
 * 
 * Provides SVG filters for creating hand-drawn, sketched appearance
 */

import React, { memo } from 'react';

const HandDrawnFilters: React.FC = memo(() => {
  return (
    <defs>
      {/* Roughen filter for irregular stroke appearance */}
      <filter id="roughen" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          baseFrequency="0.04"
          numOctaves="3"
          result="noise"
          seed="2"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="1.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Subtle texture filter for sketched appearance */}
      <filter id="sketched" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          baseFrequency="0.8"
          numOctaves="2"
          result="texture"
          seed="5"
        />
        <feColorMatrix
          in="texture"
          type="saturate"
          values="0"
        />
        <feComposite
          in="SourceGraphic"
          in2="texture"
          operator="multiply"
          result="textured"
        />
      </filter>

      {/* Paper texture for background */}
      <filter id="paper" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          baseFrequency="0.9"
          numOctaves="4"
          result="paperTexture"
          seed="1"
        />
        <feColorMatrix
          in="paperTexture"
          type="saturate"
          values="0"
        />
        <feComposite
          in="SourceGraphic"
          in2="paperTexture"
          operator="multiply"
          result="paper"
        />
      </filter>

      {/* Hand-drawn stroke pattern */}
      <pattern id="handDrawnStroke" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="none"/>
        <path d="M0,2 Q2,1 4,2" stroke="currentColor" strokeWidth="0.5" fill="none"/>
      </pattern>

      {/* City grid pattern - architectural style */}
      <pattern id="cityGrid" patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill="none"/>
        <rect x="1" y="1" width="2" height="2" fill="none" stroke="currentColor" strokeWidth="0.3"/>
        <rect x="5" y="1" width="2" height="2" fill="none" stroke="currentColor" strokeWidth="0.3"/>
        <rect x="1" y="5" width="2" height="2" fill="none" stroke="currentColor" strokeWidth="0.3"/>
        <rect x="5" y="5" width="2" height="2" fill="none" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.2"/>
        <line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" strokeWidth="0.2"/>
      </pattern>

      {/* Province border pattern - thick sketched lines */}
      <pattern id="provinceBorder" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="none"/>
        <path d="M0,3 Q3,2 6,3" stroke="currentColor" strokeWidth="0.8" fill="none"/>
        <path d="M3,0 Q2,3 3,6" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      </pattern>
    </defs>
  );
});

HandDrawnFilters.displayName = 'HandDrawnFilters';

export default HandDrawnFilters;