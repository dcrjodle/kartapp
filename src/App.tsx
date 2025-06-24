import React, { useState } from "react";
import CustomMap from "./components/CustomMap";
import MovingClouds from "./components/MovingClouds";
import { provincesData } from "./data/sweden_provinces";

const App: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MovingClouds zoom={zoom} selectedProvince={selectedProvince} />
      <CustomMap 
        provinces={provincesData} 
        onZoomChange={setZoom}
        onProvinceChange={setSelectedProvince}
      />
    </div>
  );
};

export default App;
