"use client"

import Map from "../components/Map"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">MapLibre React TypeScript App</h1>
      <Map initialLng={-122.4194} initialLat={37.7749} initialZoom={12} />
    </main>
  )
}

