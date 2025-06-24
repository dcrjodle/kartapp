import React, { useState, useEffect, lazy, Suspense } from "react";
import CustomMap from "./components/CustomMap";
import { provincesData } from "./data/sweden_provinces";
import { type SwedishCity, processCityData, filterCitiesByPopulation } from "./utils/cityDataProcessing";
import swedishCitiesData from "./data/swedish-cities.json";

// Lazy load non-critical components
const MovingClouds = lazy(() => import("./components/MovingClouds"));

const App: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [cities, setCities] = useState<SwedishCity[]>([]);

  // Process city data on component mount
  useEffect(() => {
    const processedCities = processCityData(swedishCitiesData);
    const filteredCities = filterCitiesByPopulation(processedCities, 30000); // Show cities with 30k+ population
    setCities(filteredCities);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Suspense fallback={null}>
        <MovingClouds zoom={zoom} selectedProvince={selectedProvince} />
      </Suspense>
      <CustomMap 
        provinces={provincesData}
        cities={cities}
        onZoomChange={setZoom}
        onProvinceChange={setSelectedProvince}
      />
    </div>
  );
};

export default App;
