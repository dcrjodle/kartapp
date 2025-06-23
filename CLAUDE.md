# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start the development server on http://localhost:3001
- `npm run build` - Build the application for production
- `npm test` - Run tests (currently placeholder)

## Architecture Overview

This is a React TypeScript application that displays Swedish municipalities on an interactive custom map using SVG rendering and Mercator projection. The project uses a completely custom mapping solution without external mapping libraries, following modern React patterns and best practices.

### Technology Stack

- **React 19** with TypeScript
- **Webpack 5** for bundling and development server with SASS support
- **SASS/SCSS** for styling with modern syntax
- **Custom SVG rendering** for map visualization
- **Mercator projection** for geographic coordinate transformation

### Project Structure

```
src/
├── components/
│   ├── CustomMap.tsx        # Main interactive map component
│   └── CustomMap.scss       # Component-specific SASS styles
├── utils/
│   ├── mapProjection.ts     # Geographic calculation utilities
│   └── mapInteractions.ts   # User interaction utilities
├── data/
│   └── sweden.ts           # GeoJSON data and transformations
├── App.tsx                 # Root application component
└── index.tsx              # Application entry point
```

### Key Components

#### **CustomMap** (`src/components/CustomMap.tsx`)
Production-ready interactive map component with:
- **Clean Architecture**: Separated concerns with utility modules
- **TypeScript Interfaces**: Comprehensive type definitions
- **Performance Optimized**: Memoized calculations and event handlers
- **Accessibility**: ARIA labels and semantic markup
- **Configurable Props**: Customizable grid intervals and zoom limits
- **SASS Styling**: Professional styling with BEM methodology

**Features:**
- Pan and zoom functionality with smooth interactions
- Geographic grid lines (meridians and parallels)
- Municipality hover effects with visual feedback
- Proper aspect ratio calculation for Sweden's latitude
- Reset view functionality
- Real-time zoom and bounds display

#### **Utility Modules**

**mapProjection.ts** - Geographic calculation utilities:
- `calculateGeographicBounds()` - Computes data bounds
- `calculateMapDimensions()` - Optimal aspect ratio calculation
- `projectToSVG()` - Mercator coordinate transformation
- `polygonToSVGPath()` - GeoJSON to SVG path conversion
- `generateMeridians/Parallels()` - Grid line generation

**mapInteractions.ts** - User interaction utilities:
- `calculateZoomFactor()` - Zoom calculation from wheel events
- `constrainZoom()` - Zoom level constraints
- `calculateZoomedViewBox()` - Zoom-centered viewBox updates
- `calculatePannedViewBox()` - Pan operation calculations

#### **Styling Architecture**

**CustomMap.scss** - Professional SASS stylesheet featuring:
- **SASS Variables**: Centralized color and spacing system
- **Mixins**: Reusable style patterns
- **BEM Methodology**: Semantic, maintainable class structure
- **Responsive Design**: Mobile-first media queries
- **Accessibility**: High contrast and reduced motion support
- **Modern SASS**: Uses `@use` syntax and `color.adjust()` functions

### Map Projection Details

The application uses **Mercator projection** with optimizations:
- Correctly handles Earth's spherical geometry
- Preserves shapes and angles accurately
- Uses logarithmic latitude transformation: `ln(tan(π/4 + lat/2))`
- Compensates for latitude compression at Sweden's northern location (~55-69°N)
- Dynamic aspect ratio calculation prevents over-compression

### Performance Optimizations

- **Memoized Calculations**: All expensive operations cached with useMemo
- **Pre-calculated Paths**: SVG paths computed once and reused
- **Efficient Event Handling**: Non-passive wheel events for proper zoom control
- **Clean Re-renders**: useCallback for stable event handlers
- **Optimized Bundle**: Webpack configured for development and production

### Development Standards

#### **Code Quality**
- **JSDoc Documentation**: Comprehensive function and interface documentation
- **TypeScript Strict Mode**: Type safety with explicit interfaces
- **Clean Code Patterns**: Separated concerns and single responsibility
- **Error Handling**: Proper error boundaries and edge case handling

#### **Styling Standards**
- **SASS Architecture**: Variables, mixins, and modular organization
- **BEM Methodology**: Consistent, semantic class naming
- **Responsive Design**: Mobile-first approach with media queries
- **Modern CSS**: Flexbox, CSS Grid, and modern properties

#### **Testing Considerations**
- Components designed for testability with clear interfaces
- Utility functions are pure and easily unit testable
- Event handlers are separated for isolated testing
- Props interface allows for comprehensive testing scenarios

### Map Features

- **Interactive Navigation**: Smooth pan and zoom with mouse/touch
- **Geographic Grid**: Configurable meridian and parallel spacing
- **Visual Feedback**: Hover states and cursor changes
- **Information Display**: Real-time zoom level and bounds
- **Reset Functionality**: One-click return to initial view
- **Accessibility**: Screen reader support and keyboard navigation

### Coordinate System

- **Input Format**: WGS84 coordinates (longitude, latitude)
- **Projection Method**: Mercator with Sweden-specific optimizations
- **Aspect Ratio**: Latitude compensation factor of 0.55
- **Output Format**: SVG coordinates with proper scaling
- **Constraints**: Minimum height of 400px prevents compression

### Configuration

#### **Webpack Setup**
- SASS/SCSS loader configured for modern syntax
- Development server on port 3001
- Hot reload for components and styles
- TypeScript compilation with ts-loader

#### **TypeScript Configuration**
- Strict mode disabled for flexibility
- Modern JSX transform
- Path resolution for clean imports
- Comprehensive type checking

### Build and Development

#### **Development Workflow**
1. Start development server: `npm start`
2. Edit components with hot reload
3. SASS compilation happens automatically
4. TypeScript type checking in real-time

#### **Production Build**
- Optimized bundle with webpack
- SASS compiled to optimized CSS
- TypeScript compiled to efficient JavaScript
- Source maps for debugging

### Coding Practices

The project follows the guidelines outlined in `CODING_PRACTICES.md`:
- React component best practices
- TypeScript type safety standards
- SASS/SCSS styling conventions
- Performance optimization patterns
- Testing and documentation standards

### External Resources

- **No external mapping libraries** - Completely custom solution
- **Minimal dependencies** - Only essential React and build tools
- **Self-contained** - All mapping logic implemented internally
- **Extensible** - Clean architecture allows easy feature additions