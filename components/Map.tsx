"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

interface MapProps {
  initialLng: number
  initialLat: number
  initialZoom: number
}

const Map: React.FC<MapProps> = ({ initialLng, initialLat, initialZoom }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [lng, setLng] = useState(initialLng)
  const [lat, setLat] = useState(initialLat)
  const [zoom, setZoom] = useState(initialZoom)

  useEffect(() => {
    if (map.current) return // initialize map only once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [lng, lat],
        zoom: zoom,
      })

      map.current.on("move", () => {
        if (map.current) {
          setLng(Number(map.current.getCenter().lng.toFixed(4)))
          setLat(Number(map.current.getCenter().lat.toFixed(4)))
          setZoom(Number(map.current.getZoom().toFixed(2)))
        }
      })
    }
  }, [lng, lat, zoom])

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
    </div>
  )
}

export default Map

