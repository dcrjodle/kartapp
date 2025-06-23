import React from "react";
import CustomMap from "./components/CustomMap";
import { countiesData } from "./data/swedish_counties";

const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CustomMap municipalities={countiesData} />
    </div>
  );
};

export default App;
