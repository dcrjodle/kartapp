/**
 * Standardized province data with unique identifiers and ISO codes
 * Consolidated from multiple data sources for reliable identification
 */

import { Province } from '../types/geographic';

export const SWEDISH_PROVINCES: Province[] = [
  {
    id: 'se-stockholm',
    name: 'Stockholm',
    isoCode: 'SE-AB',
    aliases: ['Stockholm County', 'Stockholms län'],
    postalCodePrefixes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    type: 'province',
    coordinates: [], // Will be populated from existing data
    cities: [], // Will be populated
  },
  {
    id: 'se-goteborg',
    name: 'Västra Götaland', 
    isoCode: 'SE-O',
    aliases: ['Gothenburg', 'Göteborg', 'West Gothland'],
    postalCodePrefixes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-skane',
    name: 'Skåne',
    isoCode: 'SE-M',
    aliases: ['Scania', 'Skåne County'],
    postalCodePrefixes: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-vgotaland',
    name: 'Västra Götaland',
    isoCode: 'SE-O', 
    aliases: ['West Gothland County'],
    postalCodePrefixes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-ostergotland',
    name: 'Östergötland',
    isoCode: 'SE-E',
    aliases: ['East Gothland', 'Östergötlands län'],
    postalCodePrefixes: ['58', '59', '60', '61', '62'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-jonkoping',
    name: 'Jönköping',
    isoCode: 'SE-F',
    aliases: ['Jönköpings län'],
    postalCodePrefixes: ['33', '34', '35', '36', '37', '38'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-kronoberg',
    name: 'Kronoberg',
    isoCode: 'SE-G',
    aliases: ['Kronobergs län'],
    postalCodePrefixes: ['34', '35', '36'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-kalmar',
    name: 'Kalmar',
    isoCode: 'SE-H',
    aliases: ['Kalmar County', 'Kalmar län'],
    postalCodePrefixes: ['38', '39'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-blekinge',
    name: 'Blekinge',
    isoCode: 'SE-K',
    aliases: ['Blekinge län'],
    postalCodePrefixes: ['37'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-halland',
    name: 'Halland',
    isoCode: 'SE-N',
    aliases: ['Hallands län'],
    postalCodePrefixes: ['30', '31', '32'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-gavleborg',
    name: 'Gävleborg',
    isoCode: 'SE-X',
    aliases: ['Gävleborgs län'],
    postalCodePrefixes: ['80', '81', '82', '83'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-dalarna',
    name: 'Dalarna',
    isoCode: 'SE-W',
    aliases: ['Dalarnas län'],
    postalCodePrefixes: ['77', '78', '79'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-sodermanland',
    name: 'Södermanland',
    isoCode: 'SE-D',
    aliases: ['Södermanlands län'],
    postalCodePrefixes: ['61', '63', '64'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-uppsala',
    name: 'Uppsala',
    isoCode: 'SE-C',
    aliases: ['Uppsala län'],
    postalCodePrefixes: ['74', '75'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-vastmanland',
    name: 'Västmanland',
    isoCode: 'SE-U',
    aliases: ['Västmanlands län'],
    postalCodePrefixes: ['72', '73'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-orebro',
    name: 'Örebro',
    isoCode: 'SE-T',
    aliases: ['Örebro län'],
    postalCodePrefixes: ['69', '70', '71'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-varmland',
    name: 'Värmland',
    isoCode: 'SE-S',
    aliases: ['Värmlands län'],
    postalCodePrefixes: ['65', '66', '67', '68'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-vasterbotten',
    name: 'Västerbotten',
    isoCode: 'SE-AC',
    aliases: ['Västerbottens län'],
    postalCodePrefixes: ['90', '91', '92', '93'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-norrbotten',
    name: 'Norrbotten',
    isoCode: 'SE-BD',
    aliases: ['Norrbottens län'],
    postalCodePrefixes: ['94', '95', '96', '97', '98'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-jamtland',
    name: 'Jämtland',
    isoCode: 'SE-Z',
    aliases: ['Jämtlands län'],
    postalCodePrefixes: ['83', '84'],
    type: 'province',
    coordinates: [],
    cities: [],
  },
  {
    id: 'se-vasternorrland',
    name: 'Västernorrland',
    isoCode: 'SE-Y',
    aliases: ['Västernorrlands län'],
    postalCodePrefixes: ['85', '86', '87', '88'],
    type: 'province',
    coordinates: [],
    cities: [],
  }
];

/**
 * Get province by ID
 */
export const getProvinceById = (id: string): Province | undefined => {
  return SWEDISH_PROVINCES.find(province => province.id === id);
};

/**
 * Get province by name (includes aliases)
 */
export const getProvinceByName = (name: string): Province | undefined => {
  const searchName = name.toLowerCase().trim();
  return SWEDISH_PROVINCES.find(province => 
    province.name.toLowerCase() === searchName ||
    province.aliases?.some(alias => alias.toLowerCase() === searchName)
  );
};

/**
 * Get province by ISO code
 */
export const getProvinceByIsoCode = (isoCode: string): Province | undefined => {
  return SWEDISH_PROVINCES.find(province => province.isoCode === isoCode);
};

/**
 * Find provinces that match a postal code
 */
export const getProvincesByPostalCode = (postalCode: string): Province[] => {
  const prefix = postalCode.substring(0, 2);
  return SWEDISH_PROVINCES.filter(province =>
    province.postalCodePrefixes?.includes(prefix)
  );
};