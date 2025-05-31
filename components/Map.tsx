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
  const [outsideSweden, setOutsideSweden] = useState(false);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);

  const OUTSIDE_SWEDEN_BOUNDS: [[number, number], [number, number]] = [
    [-40, 20], // Far southwest (includes parts of the Atlantic & North Africa)
    [70, 85], // Far northeast (Siberia, Arctic)
  ];

  const SWEDEN_BOUNDS: [[number, number], [number, number]] = [
    [10.5, 55.0], // Southwest corner [lng, lat]
    [24.2, 69.5], // Northeast corner [lng, lat]
  ];

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [lng, lat],
        zoom: zoom,
      });

      // map.current.setMaxBounds([
      //   [5.4943, 45.8848], // Southwest corner (min longitude, min latitude)
      //   [28.3467, 75.5383], // Northeast corner (max longitude, max latitude)
      // ]);

      //map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      const checkBounds = () => {
        const bounds = map.current?.getBounds();
        if (!bounds) return;
        console.log("Bounds:", bounds);
        const isOutside =
          bounds.getSouth() < OUTSIDE_SWEDEN_BOUNDS[0][1] ||
          bounds.getWest() < OUTSIDE_SWEDEN_BOUNDS[0][0] ||
          bounds.getNorth() > OUTSIDE_SWEDEN_BOUNDS[1][1] ||
          bounds.getEast() > OUTSIDE_SWEDEN_BOUNDS[1][0];

        setOutsideSweden(isOutside);
      };

      map.current.on("moveend", checkBounds);

      // map.current.on("move", () => {
      //   if (map.current) {
      //     setLng(Number(map.current.getCenter().lng.toFixed(4)));
      //     setLat(Number(map.current.getCenter().lat.toFixed(4)));
      //     setZoom(Number(map.current.getZoom().toFixed(2)));
      //   }
      // });

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
            if (testId && map.current) {
              map.current.getCanvas().style.cursor = "pointer";
              map.current.setFeatureState(
                { source: sourceId, id: testId },
                { hover: false }
              );
            }

            testId = e.features[0].id;
            map.current?.setFeatureState(
              { source: sourceId, id: testId },
              { hover: true }
            );
            // Set focus on feature and zoom in
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

        map.current?.on("click", fillId, (e) => {
          console.log("click", e);
          if (map.current) {
            console.log(e.features);
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(e.features?.[0].properties.kom_namn)
              .addTo(map.current);
          }
        });
      });
    }
  }, [lng, lat, zoom]);

  const returnToSweden = () => {
    map.current?.fitBounds(SWEDEN_BOUNDS, {
      padding: 20,
      duration: 1000,
    });
  };

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      {/* <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div> */}
      {outsideSweden && (
        <button
          onClick={returnToSweden}
          style={{
            color: "#333",
            position: "absolute",
            top: 20,
            right: 20,
            padding: "10px 15px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          Return to Sweden
        </button>
      )}
    </div>
  );
};

export default Map;
