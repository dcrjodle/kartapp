"use client";

import Map from "../components/Map";

const swedenPosition = {
  lat: 62,
  lng: 15,
};

const defaultZoom = 5;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">MapLibre React TypeScript App</h1>
      <Map
        initialLng={swedenPosition.lng}
        initialLat={swedenPosition.lat}
        initialZoom={defaultZoom}
      />
    </main>
  );
}
