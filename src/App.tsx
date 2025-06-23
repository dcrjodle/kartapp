import React from "react";
import CustomMap from "./components/Sweden";
import { swedenData } from "./data/sweden";

const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CustomMap municipalities={swedenData} />
    </div>
  );
};

export default App;
