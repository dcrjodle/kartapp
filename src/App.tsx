import React from "react";
import CustomMap from "./components/CustomMap";
import { provincesData } from "./data/sweden_provinces";

const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* <MovingClouds /> */}
      <CustomMap provinces={provincesData} />
    </div>
  );
};

export default App;
