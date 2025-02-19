"use client";

import Map from "../components/Map";

const swedenPosition = {
  lat: 63,
  lng: 18,
};

const defaultZoom = 4;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <Map
        initialLng={swedenPosition.lng}
        initialLat={swedenPosition.lat}
        initialZoom={defaultZoom}
      />
    </main>
  );
}
