/**
 * Simple city data processing for core map functionality
 */

export interface SwedishCity {
  name: string;
  population: number;
  latitude: number;
  longitude: number;
  province?: string;
}

export const processCityData = (rawCityData: any[]): SwedishCity[] => {
  return rawCityData.map(city => ({
    name: city.name || city.city || '',
    population: city.population || 0,
    latitude: parseFloat(city.latitude || city.lat || '0'),
    longitude: parseFloat(city.longitude || city.lng || city.lon || '0'),
    province: city.province || city.county || undefined
  }));
};

export const filterCitiesByPopulation = (cities: SwedishCity[], minPopulation: number): SwedishCity[] => {
  return cities.filter(city => city.population >= minPopulation);
};