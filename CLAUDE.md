# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Development Commands

- `npm start` - Start development server on http://localhost:3001
- `npm run build` - Build for production
- `npm test` - Run all Cypress tests
- `npm run test:open` - Open Cypress test runner GUI
- `npm run test:controls` - Run map controls tests only
- `npm run test:provinces` - Run province interaction tests only
- `npm run test:cities` - Run city marker tests only
- `npm run test:clouds` - Run cloud animation tests only
- `npm run test:accessibility` - Run accessibility tests only

## Git Workflow

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `style:`
- Main branch: **main**
- Commit frequently with clear, descriptive messages

## Project Overview

**Swedish Statistics Visualization Platform** - Interactive data visualization application that displays statistical information overlaid on Swedish provinces and municipalities. The platform transforms complex statistical data into intuitive visual representations for government analysis, research, business intelligence, and education.

### Core Purpose
- Visualize crime rates, demographics, economic indicators by region
- Display survey results, market data, and comparative analysis
- Support multiple visualization types: heat maps, event markers, choropleth maps
- Import data from CSV, JSON, Excel formats with geographic matching
- Provide interactive filtering, legends, and data export capabilities

### Implementation Status
- ✅ Foundation: Interactive SVG map with pan/zoom, province selection, city markers
- 🎯 Next: Data management system, visualization engine, control panels, advanced analytics

### Technology Stack

- React 19 + TypeScript
- Webpack 5 + SASS
- Custom SVG rendering
- Mercator projection

### Key Architecture

```
src/
├── components/
│   ├── CustomMap.tsx          # Main map component
│   ├── DataUpload.tsx         # Data import interface (planned)
│   ├── VisualizationControls.tsx # Visualization toggles (planned)
│   └── Legend.tsx             # Dynamic legends (planned)
├── hooks/
│   ├── useMapState.ts         # State management
│   ├── useMapInteractions.ts  # Mouse/wheel events
│   ├── useDataVisualization.ts # Data visualization logic (planned)
│   └── useTranslations.ts     # Internationalization
├── utils/
│   ├── mapProjection.ts       # Geographic calculations
│   ├── dataProcessing.ts      # Data parsing and validation (planned)
│   ├── colorScales.ts         # Color interpolation (planned)
│   └── i18n.ts               # Translation utilities
├── content/translations.ts    # All text content
├── styles/_colors.scss        # Color variables
└── data/sweden.ts             # GeoJSON data
```

### Technology Stack

- React 19 + TypeScript
- Custom SVG rendering with Mercator projection
- SASS for styling
- No external mapping libraries

## Coding Rules

### Component Guidelines

- **Clean & focused** - Components handle rendering only, extract logic to hooks/utils
- **Size limit** - Max 100-150 lines, break down complex rendering
- **Accessibility** - Keyboard accessible, ARIA labels, semantic HTML, .sr-only for screen readers

### Code Organization

- **Hooks**: Single responsibility, reusable, clear naming (`useMapState`, `useDataVisualization`)
- **Utils**: Pure functions with JSDoc comments, easily testable
- **Styling**: All colors in `src/styles/_colors.scss`, import with `@use "../styles/colors" as *;`
- **Content**: All text in `src/content/translations.ts`, access via `useTranslations()` hook
- **Data**: Only data files and types in `src/data/`, no utility functions
- **Naming**: Descriptive file names, consistent patterns within folders


## Testing Guidelines

### Test Requirements

**ALWAYS run tests when making changes to UI features** - Every change to map controls, provinces, cities, clouds, or accessibility features must be tested before committing.

### Test Mapping

- **Controls**: `npm run test:controls` - zoom, pan, reset, interactions
- **Provinces**: `npm run test:provinces` - hover, selection, styling
- **Cities**: `npm run test:cities` - visibility, markers, interactions
- **Accessibility**: `npm run test:accessibility` - keyboard, ARIA, focus
- **All tests**: `npm test` - run before major commits

**Always test before committing UI changes**

### Test Requirements

Components need `data-testid` attributes for testing. Always test before committing UI changes.
