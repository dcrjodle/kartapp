import { useEffect } from "react";
import maplibregl from "maplibre-gl";

// TODO Move to a separate file
export type Id = string | number;
export type Position = number[];
export type Municipality = {
  sourceId: Id;
  layerId: Id;
  borderId: Id;
  coordinates: Position[][];
} | null;

type MunicipalityProps = {
  map: maplibregl.Map | null;
  id: string;
  coordinates: Position[][];
  fillColor?: string;
  onClick?: () => void;
};

export const Municipality = ({
  map,
  id,
  coordinates,
  fillColor = "#088",
  onClick,
}: MunicipalityProps) => {
  useEffect(() => {
    console.log("Adding polygon layer", id, coordinates);
    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;
    const borderId = `${id}-border`;

    // Add GeoJSON source
    if (!map?.getSource(sourceId)) {
      map?.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates,
          },
          properties: {},
        },
        generateId: true,
      });
    }

    // Add fill layer if it doesn't exist
    if (!map?.getLayer(layerId)) {
      map?.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
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
    }

    // Add border layer if it doesn't exist
    if (!map?.getLayer(borderId)) {
      map?.addLayer({
        id: borderId,
        type: "line",
        source: sourceId,
        layout: {},
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });
    }

    let testId: string | number | undefined = 0;
    map?.on("mousemove", layerId, (e) => {
      if (e.features?.length) {
        if (testId && map) {
          map.setFeatureState(
            { source: sourceId, id: testId },
            { hover: false }
          );
        }

        testId = e.features[0].id;
        map?.setFeatureState({ source: sourceId, id: testId }, { hover: true });
        // Set focus on feature and zoom in
      }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map?.on("mouseleave", layerId, () => {
      if (testId) {
        map?.setFeatureState(
          { source: sourceId, id: testId },
          { hover: false }
        );
      }
    });

    // When the user clicks on a feature in the state-fill layer, we'll open a popup
    map?.on("click", layerId, (e) => {
      if (map) {
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features?.[0].properties.kom_namn)
          .addTo(map);
      }
    });

    // Optional: cursor feedback
    map?.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map?.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    // return () => {
    //   if (map?.getLayer(layerId)) map.removeLayer(layerId);
    //   if (map?.getSource(borderId)) map.removeSource(borderId);
    //   if (map?.getSource(sourceId)) map.removeSource(sourceId);
    //   map?.off("click", layerId, handleClick);
    // };
  }, [map, id, coordinates, fillColor, onClick]);

  return null;
};
