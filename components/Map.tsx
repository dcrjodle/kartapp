"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Municipality } from "./Municipality";
import { createGeoJsonSource, createMapLayer } from "@/lib/utils";

interface MapProps {
  municipalities: Municipality[];
  initialLng: number;
  initialLat: number;
  initialZoom: number;
}

const Map: React.FC<MapProps> = ({
  municipalities,
  initialLng,
  initialLat,
  initialZoom,
}) => {
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

  const checkBounds = () => {
    const bounds = map.current?.getBounds();
    if (!bounds) return;
    const isOutside =
      bounds.getSouth() < OUTSIDE_SWEDEN_BOUNDS[0][1] ||
      bounds.getWest() < OUTSIDE_SWEDEN_BOUNDS[0][0] ||
      bounds.getNorth() > OUTSIDE_SWEDEN_BOUNDS[1][1] ||
      bounds.getEast() > OUTSIDE_SWEDEN_BOUNDS[1][0];

    setOutsideSweden(isOutside);
  };

  useEffect(() => {
    console.log("Map component mounted");
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.on("move", checkBounds);

      map.current.on("load", () => {
        municipalities.forEach((municipality) => {
          if (!municipality) return;
          const source = createGeoJsonSource(municipality.coordinates);
          const layer = createMapLayer(
            municipality.layerId,
            municipality.sourceId
          );

          console.log(
            "Adding municipality layer",
            municipality.layerId,
            municipality.coordinates
          );
          map.current?.addSource(municipality.sourceId as string, source);
          map.current?.addLayer(layer);
        });

        // // Add geojson on entire world
        // map.current?.addSource("world-data", {q
        //   type: "geojson",
        //   data: {
        //     type: "FeatureCollection",
        //     features: [
        //       {
        //         type: "Feature",
        //         geometry: {
        //           type: "Polygon",
        //           coordinates: [
        //             [
        //               [-180, -90],
        //               [180, -90],
        //               [180, 90],
        //               [-180, 90],
        //               [-180, -90],
        //             ],
        //           ],
        //         },
        //         properties: {},
        //       },
        //     ],
        //   },
        // });

        // // Add a fill layer to bleach out the world
        // map.current?.addLayer({
        //   id: "world-layer",
        //   type: "fill",
        //   source: "world-data",
        //   paint: {
        //     "fill-color": "#FFFFFF",
        //     "fill-opacity": 0.5,
        //   },
        // });

        // Add geojson source for Sweden
        // map.current?.addSource(sourceId, {
        //   type: "geojson",
        //   data: sweden,
        //   generateId: true,
        // });

        // Add the fill layer for the Swedish municipalities
        // map.current?.addLayer({
        //   id: fillId,
        //   type: "fill",
        //   source: sourceId,
        //   layout: {},
        //   paint: {
        //     "fill-color": "#627BC1",
        //     "fill-opacity": [
        //       "case",
        //       ["boolean", ["feature-state", "hover"], false],
        //       1,
        //       0.5,
        //     ],
        //   },
        // });

        // Add the line layer for the Swedish municipalities
        // map.current?.addLayer({
        //   id: borderId,
        //   type: "line",
        //   source: sourceId,
        //   layout: {},
        //   paint: {
        //     "line-color": "#627BC1",
        //     "line-width": 2,
        //   },
        // });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        //   let testId: string | number | undefined = 0;
        //   map.current?.on("mousemove", fillId, (e) => {
        //     if (e.features?.length) {
        //       if (testId && map.current) {
        //         map.current.getCanvas().style.cursor = "pointer";
        //         map.current.setFeatureState(
        //           { source: sourceId, id: testId },
        //           { hover: false }
        //         );
        //       }

        //       testId = e.features[0].id;
        //       map.current?.setFeatureState(
        //         { source: sourceId, id: testId },
        //         { hover: true }
        //       );
        //       // Set focus on feature and zoom in
        //     }
        //   });

        //   // When the mouse leaves the state-fill layer, update the feature state of the
        //   // previously hovered feature.
        //   map.current?.on("mouseleave", fillId, () => {
        //     if (testId) {
        //       map.current?.setFeatureState(
        //         { source: sourceId, id: testId },
        //         { hover: false }
        //       );
        //     }
        //   });

        //   // When the user clicks on a feature in the state-fill layer, we'll open a popup
        //   map.current?.on("click", fillId, (e) => {
        //     if (map.current) {
        //       new maplibregl.Popup()
        //         .setLngLat(e.lngLat)
        //         .setHTML(e.features?.[0].properties.kom_namn)
        //         .addTo(map.current);
        //     }
        //   });
      });
    }
  }, []);

  const returnToSweden = () => {
    map.current?.fitBounds(SWEDEN_BOUNDS, {
      padding: 20,
      duration: 1000,
    });
  };

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
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
