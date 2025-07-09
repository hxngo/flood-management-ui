'use client';

import React from 'react';

interface WorldMapPopupProps {
  width?: string;
  height?: string;
}

const WorldMapPopup: React.FC<WorldMapPopupProps> = ({ 
  width = '100%', 
  height = '500px' 
}) => {
  return (
    <div className="world-map-container rounded-lg overflow-hidden shadow-lg">
      <iframe
        src="/world-map-popup/index.html"
        width={width}
        height={height}
        style={{ border: 'none' }}
        title="World Map Popup"
        loading="lazy"
      />
    </div>
  );
};

export default WorldMapPopup;
