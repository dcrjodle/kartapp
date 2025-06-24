/**
 * City data processing utilities
 */

export interface SwedishCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  admin_name: string;
  capital: string;
  population: number;
  population_proper: number;
}

/**
 * Process raw city data from JSON into typed format
 */
export const processCityData = (rawData: any[]): SwedishCity[] => {
  return rawData.map((city, index) => ({
    id: `city-${index}`,
    name: city.city,
    lat: parseFloat(city.lat),
    lng: parseFloat(city.lng),
    admin_name: city.admin_name || '',
    capital: city.capital || '',
    population: parseInt(city.population) || 0,
    population_proper: parseInt(city.population_proper) || 0,
  }));
};

/**
 * Filter cities by population size
 */
export const filterCitiesByPopulation = (
  cities: SwedishCity[], 
  minPopulation: number = 50000
): SwedishCity[] => {
  return cities.filter(city => city.population >= minPopulation);
};

/**
 * Get city size category for styling
 */
export const getCitySizeCategory = (population: number): 'small' | 'medium' | 'large' | 'major' => {
  if (population >= 1000000) return 'major';
  if (population >= 500000) return 'large';
  if (population >= 100000) return 'medium';
  return 'small';
};