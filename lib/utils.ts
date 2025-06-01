import { Id, Position } from "@/components/Municipality";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createGeoJsonSource = (
  coordinates: Position[][]
): maplibregl.SourceSpecification | maplibregl.CanvasSourceSpecification => {
  return {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: coordinates,
      },
      properties: {},
    },
    generateId: true,
  };
};

export const createMapLayer = (
  id: Id,
  sourceId: Id
): maplibregl.AddLayerObject => {
  return {
    id: id as string,
    type: "fill",
    source: sourceId as string,
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  };
};
