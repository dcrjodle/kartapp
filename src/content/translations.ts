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
  dataUpload: {
    title: string;
    description: string;
    processing: string;
    supportedTypes: string;
    finalize: string;
    errors: {
      invalidFileType: string;
      fileTooLarge: string;
    };
    mapping: {
      title: string;
      clear: string;
      columns: string;
      entityId: string;
      value: string;
      label: string;
      identifierType: string;
      selectColumn: string;
      types: {
        name: string;
        id: string;
        isoCode: string;
        postalCode: string;
      };
    };
    preview: {
      title: string;
    };
  };
  controls: {
    dataSeries: {
      title: string;
      noData: string;
      dataPoints: string;
    };
    visualization: {
      titlePlaceholder: string;
      create: string;
    };
    type: {
      title: string;
      options: {
        choropleth: { name: string; description: string };
        heatmap: { name: string; description: string };
        bubble: { name: string; description: string };
        categorical: { name: string; description: string };
        temporal: { name: string; description: string };
      };
    };
    colors: {
      title: string;
      predefinedSchemes: string;
      scaleType: string;
      palette: string;
      reverse: string;
      types: {
        sequential: string;
        diverging: string;
        categorical: string;
        quantile: string;
      };
      schemes: {
        population: string;
        density: string;
        change: string;
        category: string;
        income: string;
        temperature: string;
      };
      palettes: {
        blues: string;
        greens: string;
        reds: string;
        oranges: string;
        purples: string;
        greys: string;
        redBlue: string;
        redYellowBlue: string;
        brownBlueGreen: string;
        pinkGreen: string;
        set1: string;
        set2: string;
        set3: string;
        pastel: string;
        viridis: string;
      };
    };
    animation: {
      title: string;
      duration: string;
      easing: string;
      stagger: string;
      easingTypes: {
        linear: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
      };
    };
    legend: {
      title: string;
      show: string;
      position: string;
      customTitle: string;
      titlePlaceholder: string;
      positions: {
        top: string;
        bottom: string;
        left: string;
        right: string;
      };
    };
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
    dataUpload: {
      title: 'Upload Data',
      description: 'Drag and drop files here or click to select. Supported formats: CSV, JSON, Excel.',
      processing: 'Processing file...',
      supportedTypes: 'Supported types',
      finalize: 'Import Data',
      errors: {
        invalidFileType: 'Invalid file type. Supported types: {{types}}',
        fileTooLarge: 'File too large. Maximum size: {{maxSize}}',
      },
      mapping: {
        title: 'Map Columns',
        clear: 'Clear',
        columns: 'Column Mapping',
        entityId: 'Geographic Entity',
        value: 'Data Value',
        label: 'Label (optional)',
        identifierType: 'Identifier Type',
        selectColumn: 'Select column...',
        types: {
          name: 'Region Name',
          id: 'Region ID',
          isoCode: 'ISO Code',
          postalCode: 'Postal Code',
        },
      },
      preview: {
        title: 'Data Preview',
      },
    },
    controls: {
      dataSeries: {
        title: 'Data Series',
        noData: 'No data uploaded yet. Upload a file to get started.',
        dataPoints: 'data points',
      },
      visualization: {
        titlePlaceholder: 'Enter visualization title',
        create: 'Create Visualization',
      },
      type: {
        title: 'Visualization Type',
        options: {
          choropleth: { name: 'Choropleth Map', description: 'Color-coded regions based on data values' },
          heatmap: { name: 'Heat Map', description: 'Intensity-based visualization showing data density' },
          bubble: { name: 'Bubble Map', description: 'Proportional symbols representing data magnitude' },
          categorical: { name: 'Categorical', description: 'Discrete categories with distinct colors' },
          temporal: { name: 'Time Series', description: 'Animated visualization showing changes over time' },
        },
      },
      colors: {
        title: 'Color Configuration',
        predefinedSchemes: 'Quick Schemes',
        scaleType: 'Scale Type',
        palette: 'Color Palette',
        reverse: 'Reverse Colors',
        types: {
          sequential: 'Sequential',
          diverging: 'Diverging',
          categorical: 'Categorical',
          quantile: 'Quantile',
        },
        schemes: {
          population: 'Population',
          density: 'Density',
          change: 'Change',
          category: 'Category',
          income: 'Income',
          temperature: 'Temperature',
        },
        palettes: {
          blues: 'Blues',
          greens: 'Greens',
          reds: 'Reds',
          oranges: 'Oranges',
          purples: 'Purples',
          greys: 'Greys',
          redBlue: 'Red-Blue',
          redYellowBlue: 'Red-Yellow-Blue',
          brownBlueGreen: 'Brown-Blue-Green',
          pinkGreen: 'Pink-Green',
          set1: 'Set 1',
          set2: 'Set 2',
          set3: 'Set 3',
          pastel: 'Pastel',
          viridis: 'Viridis',
        },
      },
      animation: {
        title: 'Animation',
        duration: 'Duration',
        easing: 'Easing',
        stagger: 'Stagger',
        easingTypes: {
          linear: 'Linear',
          easeIn: 'Ease In',
          easeOut: 'Ease Out',
          easeInOut: 'Ease In-Out',
        },
      },
      legend: {
        title: 'Legend',
        show: 'Show Legend',
        position: 'Position',
        customTitle: 'Custom Title',
        titlePlaceholder: 'Enter legend title',
        positions: {
          top: 'Top',
          bottom: 'Bottom',
          left: 'Left',
          right: 'Right',
        },
      },
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
    dataUpload: {
      title: 'Ladda upp data',
      description: 'Dra och släpp filer här eller klicka för att välja. Format som stöds: CSV, JSON, Excel.',
      processing: 'Bearbetar fil...',
      supportedTypes: 'Format som stöds',
      finalize: 'Importera data',
      errors: {
        invalidFileType: 'Ogiltigt filformat. Format som stöds: {{types}}',
        fileTooLarge: 'Filen är för stor. Maximal storlek: {{maxSize}}',
      },
      mapping: {
        title: 'Mappa kolumner',
        clear: 'Rensa',
        columns: 'Kolumnmappning',
        entityId: 'Geografisk enhet',
        value: 'Datavärde',
        label: 'Etikett (valfritt)',
        identifierType: 'Identifierartyp',
        selectColumn: 'Välj kolumn...',
        types: {
          name: 'Regionnamn',
          id: 'Region-ID',
          isoCode: 'ISO-kod',
          postalCode: 'Postnummer',
        },
      },
      preview: {
        title: 'Förhandsgranskning',
      },
    },
    controls: {
      dataSeries: {
        title: 'Dataserier',
        noData: 'Ingen data uppladdad ännu. Ladda upp en fil för att komma igång.',
        dataPoints: 'datapunkter',
      },
      visualization: {
        titlePlaceholder: 'Ange visualiseringstitel',
        create: 'Skapa visualisering',
      },
      type: {
        title: 'Visualiseringstyp',
        options: {
          choropleth: { name: 'Koropletkarta', description: 'Färgkodade regioner baserat på datavärden' },
          heatmap: { name: 'Värmekarta', description: 'Intensitetsbaserad visualisering som visar datatäthet' },
          bubble: { name: 'Bubbelkarta', description: 'Proportionella symboler som representerar datastorlek' },
          categorical: { name: 'Kategorisk', description: 'Diskreta kategorier med distinkta färger' },
          temporal: { name: 'Tidsserie', description: 'Animerad visualisering som visar förändringar över tid' },
        },
      },
      colors: {
        title: 'Färgkonfiguration',
        predefinedSchemes: 'Snabbscheman',
        scaleType: 'Skaltyp',
        palette: 'Färgpalett',
        reverse: 'Omvänd färgordning',
        types: {
          sequential: 'Sekventiell',
          diverging: 'Divergerande',
          categorical: 'Kategorisk',
          quantile: 'Kvantil',
        },
        schemes: {
          population: 'Befolkning',
          density: 'Täthet',
          change: 'Förändring',
          category: 'Kategori',
          income: 'Inkomst',
          temperature: 'Temperatur',
        },
        palettes: {
          blues: 'Blå',
          greens: 'Grön',
          reds: 'Röd',
          oranges: 'Orange',
          purples: 'Lila',
          greys: 'Grå',
          redBlue: 'Röd-Blå',
          redYellowBlue: 'Röd-Gul-Blå',
          brownBlueGreen: 'Brun-Blå-Grön',
          pinkGreen: 'Rosa-Grön',
          set1: 'Set 1',
          set2: 'Set 2',
          set3: 'Set 3',
          pastel: 'Pastell',
          viridis: 'Viridis',
        },
      },
      animation: {
        title: 'Animation',
        duration: 'Varaktighet',
        easing: 'Övergång',
        stagger: 'Förskjutning',
        easingTypes: {
          linear: 'Linjär',
          easeIn: 'Lätt in',
          easeOut: 'Lätt ut',
          easeInOut: 'Lätt in-ut',
        },
      },
      legend: {
        title: 'Förklaring',
        show: 'Visa förklaring',
        position: 'Position',
        customTitle: 'Anpassad titel',
        titlePlaceholder: 'Ange förklaringstitel',
        positions: {
          top: 'Topp',
          bottom: 'Botten',
          left: 'Vänster',
          right: 'Höger',
        },
      },
    },
  },
};