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

### Branch: custom (current working branch)

### Main branch: main

### Commit Convention

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `style:` - Styling changes

### Commit Requirements

- **Commit each change** - Always commit when making changes to the codebase
- **Frequent commits** - Don't batch multiple unrelated changes into one commit
- **Descriptive messages** - Use clear, descriptive commit messages that explain what was changed
- **One logical change per commit** - Each commit should represent one logical change or fix

## Project Overview

React TypeScript application displaying Swedish municipalities on an interactive SVG map using custom Mercator projection. No external mapping libraries used.

### Technology Stack

- React 19 + TypeScript
- Webpack 5 + SASS
- Custom SVG rendering
- Mercator projection

### Key Architecture

```
src/
├── components/CustomMap.tsx    # Main map component
├── hooks/                      # Custom React hooks
│   ├── useMapState.ts         # State management
│   ├── useMapInteractions.ts  # Mouse/wheel events
│   ├── useMapKeyboard.ts      # Keyboard events
│   └── useTranslations.ts     # Internationalization
├── utils/
│   ├── mapProjection.ts       # Geographic calculations
│   ├── mapInteractions.ts     # Interaction utilities
│   ├── mapCalculations.ts     # Calculation hooks
│   └── i18n.ts               # Translation utilities
├── content/
│   └── translations.ts       # All text content
├── styles/
│   └── _colors.scss          # Color variables
└── data/sweden.ts             # GeoJSON data
```

### Performance Notes

- All calculations memoized with useMemo/useCallback
- SVG paths pre-calculated
- Non-passive wheel events for zoom control

## Coding Rules

### Component Structure

- **Keep components clean and focused** - Components should only handle rendering and basic prop management
- **Extract logic into custom hooks** - All state management, effects, and complex logic must go into custom hooks in `src/hooks/`
- **Use utility functions** - All calculations, transformations, and pure functions must go into `src/utils/`
- **Maximum component size** - Components should not exceed 100-150 lines. If larger, extract logic into hooks/utils
- **Break down complex rendering** - Don't render too much in a single component block. Extract rendered elements into separate components for better maintainability and reusability
- **Component composition** - Prefer composition over large monolithic components. Create smaller, focused components that can be combined

### Accessibility Guidelines

- **All interactive elements must be keyboard accessible** - Use proper tabIndex, onKeyDown handlers for Enter/Space
- **Provide ARIA labels and roles** - Use role, aria-label, aria-describedby for screen readers
- **Include screen reader instructions** - Add hidden instructions using .sr-only class
- **Focus management** - Ensure proper focus styling and logical tab order
- **Semantic HTML** - Use appropriate HTML elements and ARIA roles

### Hook Guidelines

- **Single responsibility** - Each hook should handle one specific concern (state, interactions, calculations, etc.)
- **Reusable** - Design hooks to be potentially reusable across components
- **Clear naming** - Use descriptive names like `useMapInteractions`, `useMapState`

### Utility Guidelines

- **Pure functions** - Utility functions should be pure (no side effects)
- **Well documented** - Include JSDoc comments for complex calculations
- **Testable** - Structure utilities to be easily unit tested

### Styling Guidelines

- **Centralized colors** - All color variables must be defined in `src/styles/_colors.scss`
- **Import color variables** - Use `@use "../styles/colors" as *;` in component SCSS files
- **No hardcoded colors** - Never use color values directly in component styles

### Content Management Guidelines

- **Content folder** - All text content must be stored in `src/content/` folder
- **Translation files** - Text content goes in `src/content/translations.ts`
- **Utility separation** - Content retrieval utilities go in `src/utils/` folder
- **Hook access** - Components access content through hooks in `src/hooks/`

### Internationalization Guidelines

- **Translation hook** - Use `useTranslations()` hook in components for text content
- **Content structure** - All text content must be in `src/content/translations.ts` 
- **Utility functions** - Translation utilities in `src/utils/i18n.ts`
- **Language detection** - Regional language is automatically detected from browser
- **Fallback language** - English is always the fallback language
- **Template strings** - Use `t('key', variables)` for dynamic content with placeholders

### Data Folder Guidelines

- **Data only** - The `src/data/` folder should only contain data files and type definitions
- **No utility functions** - Never export utility functions from data files
- **One enabler function maximum** - Only include simple data transformation functions if absolutely necessary
- **Import utilities directly** - Components and hooks should import utility functions directly from `src/utils/`

### Naming Conventions

- **File naming** - Use descriptive names that reflect the file's purpose
  - Utils: `mapProjection.ts`, `cityDataProcessing.ts`, `mapCalculations.ts`
  - Components: `CustomMap.tsx`, `MapControls.tsx`, `CityMarkers.tsx`
  - Hooks: `useMapState.ts`, `useMapInteractions.ts`
  - Data: `sweden_provinces.ts`, `swedish-cities.json`
- **Consistency within folders** - All files in a folder should follow the same naming pattern
- **Avoid duplicates** - Never create duplicate interfaces or types across files

## Accessibility Guidelines

- When adding new elements and content always make sure they are accessible according to a11y standard

## Testing Guidelines

### Test Requirements

**ALWAYS run tests when making changes to UI features** - Every change to map controls, provinces, cities, clouds, or accessibility features must be tested before committing.

### Feature-Specific Test Mapping

When modifying specific features, run the corresponding test suites:

#### Map Controls Changes
- **Run**: `npm run test:controls`
- **When**: Modifying zoom, pan, reset functionality, mouse/wheel interactions, or control button behavior
- **Tests**: Zoom in/out buttons, mouse wheel zoom, pan with drag, reset view, keyboard navigation

#### Province Interactions Changes
- **Run**: `npm run test:provinces`
- **When**: Modifying province hover effects, selection logic, province styling, or province information display
- **Tests**: Province hover states, click selection, deselection, province info display, cloud opacity changes

#### City Markers Changes
- **Run**: `npm run test:cities`
- **When**: Modifying city visibility logic, city marker styling, city interactions, or city data display
- **Tests**: City visibility on province selection, city marker interactions, scaling with zoom, hover effects

#### Cloud Animations Changes
- **Run**: `npm run test:clouds`
- **When**: Modifying cloud animations, opacity changes, or cloud layering
- **Tests**: Cloud animation continuity, opacity changes with province selection, responsive behavior

#### Accessibility Features Changes
- **Run**: `npm run test:accessibility`
- **When**: Modifying keyboard navigation, ARIA labels, focus management, or screen reader support
- **Tests**: Keyboard navigation, ARIA compliance, focus indicators, reduced motion support

#### Major UI Changes
- **Run**: `npm test` (all tests)
- **When**: Making changes that affect multiple UI components or core map functionality
- **Tests**: Complete test suite covering all features

### Test Integration Workflow

1. **Before starting development**: Run relevant test suite to ensure baseline functionality
2. **During development**: Run specific tests frequently to catch regressions early
3. **Before committing**: Run all affected test suites to ensure no breaking changes
4. **For accessibility changes**: Always run accessibility tests in addition to feature tests

### Test Data Requirements

Tests require specific `data-testid` attributes on components:
- Map: `data-testid="custom-map"`
- Controls: `data-testid="map-controls"`
- Zoom buttons: `data-testid="zoom-in"`, `data-testid="zoom-out"`
- Reset button: `data-testid="reset-view"`
- Provinces: `data-testid="province-{provinceName}"`
- Cities: `data-testid="city-{cityName}"`
- Clouds: `data-testid="clouds"`
- Info displays: `data-testid="province-info"`, `data-testid="city-info"`
