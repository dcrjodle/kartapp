/**
 * Translation content
 * All text content for internationalization
 */

export type SupportedLanguage = 'en' | 'sv';

export interface Translations {
  map: {
    title: string;
    instructions: string;
    information: string;
    controls: string;
    provinces: string;
    selected: string;
    zoom: string;
    zoomDisabled: string;
    zoomIn: string;
    zoomOut: string;
    bounds: string;
    viewBox: string;
    showAll: string;
    resetView: string;
    showAllProvinces: string;
    resetMapView: string;
  };
  provinces: {
    [key: string]: string;
  };
  cities: {
    population: string;
  };
  accessibility: {
    mapDescription: string;
    provinceButton: string;
    provinceSelected: string;
    cityMarker: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    map: {
      title: 'Interactive Map of Swedish Provinces',
      instructions: 'Interactive map of Swedish provinces. Use mouse to pan and zoom, or click provinces to select them. Use Tab to navigate between provinces, Enter or Space to select. Press Escape to reset view.',
      information: 'Information',
      controls: 'Controls',
      provinces: 'Provinces',
      selected: 'Selected',
      zoom: 'Zoom',
      zoomDisabled: '(disabled)',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      bounds: 'Bounds',
      viewBox: 'ViewBox',
      showAll: 'Show All',
      resetView: 'Reset View',
      showAllProvinces: 'Show all provinces',
      resetMapView: 'Reset map view to initial position',
    },
    provinces: {
      // Swedish province names in English
      'Stockholm': 'Stockholm',
      'Västra Götaland': 'West Gothland',
      'Skåne': 'Scania',
      'Uppsala': 'Uppsala',
      'Östergötland': 'East Gothland',
      'Jönköping': 'Jönköping',
      'Kronoberg': 'Kronoberg',
      'Kalmar': 'Kalmar',
      'Gotland': 'Gotland',
      'Blekinge': 'Blekinge',
      'Halland': 'Halland',
      'Värmland': 'Värmland',
      'Örebro': 'Örebro',
      'Västmanland': 'Västmanland',
      'Dalarna': 'Dalarna',
      'Gävleborg': 'Gävleborg',
      'Västernorrland': 'Västernorrland',
      'Jämtland': 'Jämtland',
      'Västerbotten': 'Västerbotten',
      'Norrbotten': 'Norrbotten',
    },
    cities: {
      population: 'Population',
    },
    accessibility: {
      mapDescription: 'Map of Sweden showing {{count}} provinces{{selected}}',
      provinceButton: 'Province: {{name}}{{selectedState}}',
      provinceSelected: ' (selected)',
      cityMarker: '{{name}}, population {{population}}',
    },
  },
  sv: {
    map: {
      title: 'Interaktiv Karta över Svenska Län',
      instructions: 'Interaktiv karta över svenska län. Använd musen för att panorera och zooma, eller klicka på län för att välja dem. Använd Tab för att navigera mellan län, Enter eller Mellanslag för att välja. Tryck Escape för att återställa vyn.',
      information: 'Information',
      controls: 'Kontroller',
      provinces: 'Län',
      selected: 'Valt',
      zoom: 'Zoom',
      zoomDisabled: '(inaktiverad)',
      zoomIn: 'Zooma in',
      zoomOut: 'Zooma ut',
      bounds: 'Gränser',
      viewBox: 'Vy',
      showAll: 'Visa alla',
      resetView: 'Återställ vy',
      showAllProvinces: 'Visa alla län',
      resetMapView: 'Återställ kartvyn till startposition',
    },
    provinces: {
      // Swedish province names in Swedish (original)
      'Stockholm': 'Stockholm',
      'Västra Götaland': 'Västra Götaland',
      'Skåne': 'Skåne',
      'Uppsala': 'Uppsala',
      'Östergötland': 'Östergötland',
      'Jönköping': 'Jönköping',
      'Kronoberg': 'Kronoberg',
      'Kalmar': 'Kalmar',
      'Gotland': 'Gotland',
      'Blekinge': 'Blekinge',
      'Halland': 'Halland',
      'Värmland': 'Värmland',
      'Örebro': 'Örebro',
      'Västmanland': 'Västmanland',
      'Dalarna': 'Dalarna',
      'Gävleborg': 'Gävleborg',
      'Västernorrland': 'Västernorrland',
      'Jämtland': 'Jämtland',
      'Västerbotten': 'Västerbotten',
      'Norrbotten': 'Norrbotten',
    },
    cities: {
      population: 'Befolkning',
    },
    accessibility: {
      mapDescription: 'Karta över Sverige som visar {{count}} län{{selected}}',
      provinceButton: 'Län: {{name}}{{selectedState}}',
      provinceSelected: ' (valt)',
      cityMarker: '{{name}}, befolkning {{population}}',
    },
  },
};