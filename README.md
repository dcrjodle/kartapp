# KartApp - Interactive Swedish Province Map

An interactive SVG-based map of Swedish provinces with city markers, internationalization support, and accessibility features. Built with React, TypeScript, and custom Mercator projection without external mapping libraries.

## Features

- 🗺️ **Interactive Map**: Pan, zoom, and click to select Swedish provinces
- 🏙️ **City Markers**: Population-based city visualization with hover tooltips
- 🌐 **Internationalization**: Automatic language detection (Swedish/English) with fallback
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 🎨 **Custom Styling**: Centralized color system and responsive design
- ☁️ **Animated Clouds**: Dynamic cloud effects with province-responsive behavior

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kartapp

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3001`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Architecture

```
src/
├── components/           # React components
│   ├── CustomMap.tsx    # Main map component
│   ├── MapControls.tsx  # Control panel
│   ├── MapGrid.tsx      # Map grid rendering
│   ├── MapProvinces.tsx # Province polygons
│   ├── CityMarkers.tsx  # City markers
│   └── MovingClouds.tsx # Animated clouds
├── hooks/               # Custom React hooks
│   ├── useMapState.ts   # Map state management
│   ├── useMapInteractions.ts # Mouse/wheel events
│   ├── useMapKeyboard.ts # Keyboard events
│   └── useTranslations.ts # Internationalization
├── utils/               # Utility functions
│   ├── mapProjection.ts # Geographic calculations
│   ├── mapInteractions.ts # Interaction utilities
│   ├── mapCalculations.ts # Calculation hooks
│   ├── cityDataProcessing.ts # City data utilities
│   └── i18n.ts         # Translation utilities
├── content/             # Text content
│   └── translations.ts  # All translations
├── styles/              # Styling
│   └── _colors.scss    # Color variables
└── data/               # Static data
    ├── sweden_provinces.ts # Province GeoJSON
    └── swedish-cities.json # City data
```

## Technology Stack

- **React 19** with TypeScript
- **Webpack 5** + SASS
- **Custom SVG rendering** with Mercator projection
- **No external mapping libraries**

## Key Features

### Interactive Map
- Custom Mercator projection for accurate Swedish geography
- Pan and zoom functionality with mouse and keyboard
- Province selection with visual feedback
- Responsive design for all screen sizes

### City Markers
- Population-based sizing (30k+ inhabitants)
- Appear only when provinces are selected
- Instant hover tooltips with city names
- Accessible with keyboard navigation

### Internationalization
- Automatic browser language detection
- Swedish and English translations
- Fallback to English for missing translations
- Template string support for dynamic content

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility
- ARIA labels and descriptions
- High contrast mode support
- Reduced motion support

## Usage

### Basic Navigation
- **Mouse**: Click and drag to pan, scroll to zoom
- **Keyboard**: Tab to navigate provinces, Enter/Space to select
- **Reset**: Press Escape or click "Reset View" button

### Province Selection
- Click any province to zoom in and show cities
- Cities appear as colored dots sized by population
- Hover over cities to see names
- Click "Show All" to return to full map view

### Language Support
The app automatically detects your browser language:
- Swedish users see Swedish interface
- All others see English interface
- All province and city names are localized

## Development

### Code Style
- TypeScript with strict mode
- Component-based architecture
- Custom hooks for logic separation
- Centralized color and content management

### Accessibility Standards
- WCAG 2.1 compliant
- Keyboard-only navigation support
- Screen reader optimization
- Color contrast compliance

### Performance
- Memoized calculations with useMemo/useCallback
- Pre-calculated SVG paths
- Optimized rendering with React best practices

## Contributing

### Development Workflow
1. Follow conventional commit format (`feat:`, `fix:`, `refactor:`)
2. Keep components under 150 lines
3. Extract logic into custom hooks
4. Store utilities in `src/utils/`
5. Add text content to `src/content/`
6. Use centralized colors from `src/styles/_colors.scss`

### Architecture Guidelines
- **Components**: Rendering and basic prop management only
- **Hooks**: State management and complex logic
- **Utils**: Pure functions and calculations
- **Content**: All text content and translations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

[Add your license information here]

## Acknowledgments

- Built with Claude Code
- Geographic data from Swedish authorities
- City population data from public sources