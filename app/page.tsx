"use client";

import { sweden } from "@/components/source/sweden";
import Map from "../components/Map";

const swedenPosition = {
  lat: 63,
  lng: 18,
};

const defaultZoom = 4.5;

export default function Home() {
  return (
    // TODO remove this className when the map is ready
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <Map
        municipalities={sweden.features.map((feature) => ({
          sourceId: feature.id,
          layerId: `${feature.id}-fill`,
          borderId: `${feature.id}-border`,
          coordinates:
            feature.geometry.type === "Polygon"
              ? feature.geometry.coordinates
              : [],
        }))}
        initialLng={swedenPosition.lng}
        initialLat={swedenPosition.lat}
        initialZoom={defaultZoom}
      />
    </main>
  );
}
