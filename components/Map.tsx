"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { sweden } from "./source/sweden";

interface MapProps {
  initialLng: number;
  initialLat: number;
  initialZoom: number;
}

const Map: React.FC<MapProps> = ({ initialLng, initialLat, initialZoom }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.setMaxBounds([
        [5.4943, 45.8848], // Southwest corner (min longitude, min latitude)
        [28.3467, 75.5383], // Northeast corner (max longitude, max latitude)
      ]);

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      map.current.on("move", () => {
        if (map.current) {
          setLng(Number(map.current.getCenter().lng.toFixed(4)));
          setLat(Number(map.current.getCenter().lat.toFixed(4)));
          setZoom(Number(map.current.getZoom().toFixed(2)));
        }
      });

      const sourceId = "points";
      const fillId = "kom-fills";
      const borderId = "kom-borders";
      map.current.on("load", () => {
        map.current?.addSource("world-data", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [-180, -90],
                      [180, -90],
                      [180, 90],
                      [-180, 90],
                      [-180, -90],
                    ],
                  ],
                },
                properties: {},
              },
            ],
          },
        });
        map.current?.addSource(sourceId, {
          type: "geojson",
          data: sweden,
          generateId: true,
        });
        map.current?.addLayer({
          id: "world-layer",
          type: "fill",
          source: "world-data",
          paint: {
            "fill-color": "#FFFFFF",
            "fill-opacity": 0.5,
          },
        });
        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        map.current?.addLayer({
          id: fillId,
          type: "fill",
          source: sourceId,
          layout: {},
          paint: {
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5,
            ],
          },
        });
        map.current?.addLayer({
          id: borderId,
          type: "line",
          source: sourceId,
          layout: {},
          paint: {
            "line-color": "#627BC1",
            "line-width": 2,
          },
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        let testId: string | number | undefined = 0;
        map.current?.on("mousemove", fillId, (e) => {
          if (e.features?.length) {
            if (testId) {
              map.current?.setFeatureState(
                { source: sourceId, id: testId },
                { hover: false }
              );
            }
            console.log("featureStateId ", e.features[0].id);

            testId = e.features[0].id;
            map.current?.setFeatureState(
              { source: sourceId, id: testId },
              { hover: true }
            );
          }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.current?.on("mouseleave", fillId, () => {
          if (testId) {
            map.current?.setFeatureState(
              { source: sourceId, id: testId },
              { hover: false }
            );
          }
        });
      });
    }
  }, [lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
    </div>
  );
};

export default Map;
