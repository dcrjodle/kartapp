import React from 'react';
import './MovingClouds.scss';

const MovingClouds: React.FC = () => {
  return (
    <div className="clouds-container">
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      <div className="cloud cloud-5"></div>
    </div>
  );
};

export default MovingClouds;