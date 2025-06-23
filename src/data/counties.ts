// Swedish Counties Data
// Basic county data for Sweden

export interface CountyData {
  id: string;
  name: string;
  coordinates: number[][];
}

// Sample counties data - in a real app this would be loaded from GeoJSON
export const countiesData: CountyData[] = [
  {
    id: "1",
    name: "Stockholm County",
    coordinates: [[18.0685, 59.3293], [18.0685, 59.3393], [18.0785, 59.3393], [18.0785, 59.3293], [18.0685, 59.3293]]
  },
  {
    id: "2", 
    name: "Västra Götaland County",
    coordinates: [[11.9746, 57.7089], [11.9746, 57.7189], [11.9846, 57.7189], [11.9846, 57.7089], [11.9746, 57.7089]]
  },
  {
    id: "3",
    name: "Skåne County", 
    coordinates: [[13.0038, 55.6050], [13.0038, 55.6150], [13.0138, 55.6150], [13.0138, 55.6050], [13.0038, 55.6050]]
  }
];