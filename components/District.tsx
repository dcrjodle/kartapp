import { useEffect } from "react";
import maplibregl from "maplibre-gl";

type PolygonLayerProps = {
  map: maplibregl.Map;
  id: string;
  coordinates: number[][][];
  fillColor?: string;
  onClick?: () => void;
};

const PolygonLayer = ({
  map,
  id,
  coordinates,
  fillColor = "#088",
  onClick,
}: PolygonLayerProps) => {
  useEffect(() => {
    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;

    // Add GeoJSON source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
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

    // Add fill layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": fillColor,
          "fill-opacity": 0.6,
        },
      });
    }

    // Click handler
    const handleClick = () => onClick?.();
    map.on("click", layerId, handleClick);

    // Optional: cursor feedback
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      map.off("click", layerId, handleClick);
    };
  }, [map, id, coordinates, fillColor, onClick]);

  return null;
};

export default PolygonLayer;
