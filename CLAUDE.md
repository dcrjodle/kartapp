# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Development Commands

- `npm start` - Start development server on http://localhost:3001
- `npm run build` - Build for production
- `npm test` - Run tests

## Git Workflow

### Branch: custom (current working branch)
### Main branch: main

### Commit Convention
Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes  
- `refactor:` - Code refactoring
- `style:` - Styling changes

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
│   └── useMapKeyboard.ts      # Keyboard events
├── utils/
│   ├── mapProjection.ts       # Geographic calculations
│   ├── mapInteractions.ts     # Interaction utilities
│   └── mapCalculations.ts     # Calculation hooks
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

### Hook Guidelines
- **Single responsibility** - Each hook should handle one specific concern (state, interactions, calculations, etc.)
- **Reusable** - Design hooks to be potentially reusable across components
- **Clear naming** - Use descriptive names like `useMapInteractions`, `useMapState`

### Utility Guidelines  
- **Pure functions** - Utility functions should be pure (no side effects)
- **Well documented** - Include JSDoc comments for complex calculations
- **Testable** - Structure utilities to be easily unit tested
