# Swedish Statistics Visualization Platform - Technical Implementation Guide - Part 1

## Overview

This document outlines the technical architecture and implementation strategy for Phase 1 of the data visualization platform, focusing on backend data processing, standardized data contracts, and frontend integration with animated map visualizations.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│   Data Sources  │
│  (React/TS)     │    │   (Node.js)     │    │ (Files/APIs/LLM)│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │                 │              │
         └──────────────►│  Data Contract  │◄─────────────┘
                        │   (Standard)    │
                        │                 │
                        └─────────────────┘
```

## Backend Architecture

### Technology Choice: Node.js + Express
**Rationale**: 
- JavaScript ecosystem alignment with frontend
- Rich data processing libraries (lodash, d3-scale, moment)
- Easy JSON handling and validation
- Future TypeScript migration path
- Excellent LLM API integration libraries

### Core Backend Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── dataController.js      # Main data processing endpoints
│   │   ├── promptController.js    # Future LLM prompt handling
│   │   └── healthController.js    # Health checks
│   ├── services/
│   │   ├── dataProcessor.js       # Core data transformation logic
│   │   ├── geoMatcher.js         # Province/coordinate matching
│   │   ├── rankingEngine.js      # Ranking and scoring algorithms
│   │   └── validationService.js  # Data validation and cleaning
│   ├── utils/
│   │   ├── constants.js          # Swedish provinces, cities data
│   │   ├── colorScales.js        # Color interpolation utilities
│   │   └── responseFormatter.js  # Standardized response formatting
│   ├── middleware/
│   │   ├── cors.js              # CORS configuration
│   │   ├── validation.js        # Request validation
│   │   └── errorHandler.js      # Global error handling
│   ├── routes/
│   │   ├── api.js               # Main API routes
│   │   └── health.js            # Health check routes
│   └── app.js                   # Express app setup
├── data/
│   ├── swedish-provinces.json   # Master province data
│   ├── sample-datasets/         # Example datasets for testing
│   └── schemas/                 # JSON schemas for validation
└── package.json
```

## Data Contract Specification

### Standard Response Format

All backend responses follow this contract:

```typescript
interface VisualizationResponse {
  success: boolean;
  timestamp: string;
  requestId: string;
  data: {
    type: 'choropleth' | 'markers' | 'heatmap' | 'animation';
    visualizationConfig: {
      colorScale: {
        type: 'linear' | 'ordinal' | 'diverging';
        domain: [number, number] | string[];
        range: string[];
        legend: {
          title: string;
          labels: string[];
          position: 'top-right' | 'bottom-left' | 'bottom-right';
        };
      };
      animation?: {
        duration: number;
        easing: 'ease-in-out' | 'linear' | 'bounce';
        delay: number;
        stagger: number;
      };
    };
    regions: Array<{
      id: string;                    // Province ID (e.g., "stockholm")
      name: string;                  // Display name
      value: number;                 // Normalized value (0-1)
      rawValue: number | string;     // Original value
      rank?: number;                 // Optional ranking
      category?: string;             // Optional category
      color: string;                 // Computed hex color
      opacity?: number;              // Optional opacity (0-1)
      strokeWidth?: number;          // Optional border thickness
      metadata: {
        source: string;
        description: string;
        additionalInfo?: Record<string, any>;
      };
    }>;
    markers?: Array<{
      id: string;
      coordinates: [number, number]; // [lng, lat]
      value: number;
      size: number;                  // Computed size
      color: string;
      metadata: Record<string, any>;
    }>;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Backend API Endpoints

### 1. Data Processing Endpoint
```
POST /api/visualize
Content-Type: application/json

Request Body:
{
  "type": "button_trigger" | "data_upload" | "prompt_request",
  "config": {
    "visualizationType": "choropleth" | "markers" | "heatmap",
    "animationEnabled": boolean,
    "colorScheme": "blue-red" | "green-yellow" | "custom"
  },
  "data": {
    // For button_trigger
    "preset": "crime_rates" | "population_density" | "economic_indicators",
    
    // For data_upload
    "format": "csv" | "json" | "excel",
    "content": string | object,
    
    // For prompt_request (future)
    "prompt": string,
    "context": object
  }
}
```

### 2. Preset Data Endpoints
```
GET /api/presets
GET /api/presets/{presetId}
POST /api/presets/{presetId}/execute
```

### 3. Health and Status
```
GET /api/health
GET /api/status
```

## Frontend Integration Architecture

### 1. Data Service Layer

```typescript
// src/services/dataVisualizationService.ts
class DataVisualizationService {
  private baseUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  async executePreset(presetId: string, config: VisualizationConfig): Promise<VisualizationResponse> {
    // Handle preset button clicks
  }
  
  async uploadAndVisualize(file: File, config: VisualizationConfig): Promise<VisualizationResponse> {
    // Handle file uploads and processing
  }
  
  async promptVisualize(prompt: string, config: VisualizationConfig): Promise<VisualizationResponse> {
    // Future LLM integration
  }
}
```

### 2. Map Visualization Engine

```typescript
// src/hooks/useDataVisualization.ts
interface UseDataVisualizationReturn {
  visualizationData: VisualizationResponse | null;
  isLoading: boolean;
  error: string | null;
  applyVisualization: (data: VisualizationResponse) => void;
  clearVisualization: () => void;
  animateTransition: (from: VisualizationResponse, to: VisualizationResponse) => void;
}

const useDataVisualization = (): UseDataVisualizationReturn => {
  // Core visualization state management
  // Animation coordination
  // Color application logic
  // Region styling updates
};
```

### 3. Animation System

```typescript
// src/utils/mapAnimations.ts
interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  stagger: number;
}

class MapAnimationEngine {
  animateRegionColors(
    regions: string[],
    fromColors: Record<string, string>,
    toColors: Record<string, string>,
    config: AnimationConfig
  ): Promise<void> {
    // Use Web Animations API or CSS transitions
    // Stagger animations across regions
    // Handle opacity and stroke changes
  }
  
  animateMarkers(
    markers: Array<{id: string, from: Position, to: Position}>,
    config: AnimationConfig
  ): Promise<void> {
    // Animate marker positions, sizes, and colors
  }
  
  morphVisualization(
    from: VisualizationResponse,
    to: VisualizationResponse
  ): Promise<void> {
    // Smooth transitions between different visualizations
  }
}
```

### 4. Component Integration

```typescript
// src/components/DataVisualizationPanel.tsx
const DataVisualizationPanel: React.FC = () => {
  const { applyVisualization, isLoading } = useDataVisualization();
  const dataService = new DataVisualizationService();
  
  const handlePresetClick = async (presetId: string) => {
    const response = await dataService.executePreset(presetId, {
      visualizationType: 'choropleth',
      animationEnabled: true,
      colorScheme: 'blue-red'
    });
    
    if (response.success) {
      applyVisualization(response);
    }
  };
  
  return (
    <div className="data-visualization-panel">
      <PresetButtons onPresetClick={handlePresetClick} />
      <DataUploader onDataUploaded={handleDataUpload} />
      <VisualizationControls />
      <Legend data={visualizationData} />
    </div>
  );
};
```

## Implementation Phases

### Phase 1: Core Backend (Week 1)
1. **Setup Express.js backend with TypeScript**
   - Initialize project structure
   - Configure CORS and middleware
   - Setup basic routing

2. **Implement data contract and response formatting**
   - Create response formatter utility
   - Implement validation schemas
   - Setup error handling

3. **Create preset data system**
   - Swedish provinces master data
   - Sample datasets (crime, population, economy)
   - Preset configuration system

### Phase 2: Data Processing Engine (Week 2)
1. **Geographic data matching**
   - Province name normalization
   - Coordinate-to-region mapping
   - Fuzzy matching for user data

2. **Ranking and scoring algorithms**
   - Value normalization (0-1 scaling)
   - Ranking calculation
   - Outlier detection

3. **Color scale computation**
   - Linear interpolation
   - Ordinal color mapping
   - Accessibility-friendly palettes

### Phase 3: Frontend Integration (Week 3)
1. **Data service implementation**
   - API client with error handling
   - Request/response caching
   - Loading state management

2. **Visualization hook development**
   - State management for visualization data
   - Color application to SVG elements
   - Dynamic styling updates

3. **Animation system**
   - CSS transition coordination
   - Staggered animations
   - Performance optimization

### Phase 4: UI Components (Week 4)
1. **Control panel implementation**
   - Preset buttons with categories
   - File upload interface
   - Visualization configuration

2. **Legend system**
   - Dynamic legend generation
   - Color scale display
   - Interactive elements

3. **Testing and optimization**
   - Unit tests for data processing
   - Integration tests for API
   - Performance profiling

## Example Implementation: Crime Rate Visualization

### Backend Preset Configuration
```javascript
// data/presets/crime-rates.json
{
  "id": "crime_rates_2023",
  "name": "Crime Rates by Province (2023)",
  "description": "Violent crime incidents per 100,000 residents",
  "visualizationType": "choropleth",
  "data": {
    "stockholm": { "value": 127.5, "category": "high" },
    "skane": { "value": 89.2, "category": "medium" },
    "vastra_gotaland": { "value": 95.8, "category": "medium" },
    // ... other provinces
  },
  "colorScale": {
    "type": "linear",
    "scheme": "yellow-red",
    "domain": [0, 200],
    "legend": {
      "title": "Crime Rate (per 100k)",
      "position": "bottom-right"
    }
  },
  "animation": {
    "duration": 1000,
    "easing": "ease-in-out",
    "stagger": 50
  }
}
```

### Frontend Button Handler
```typescript
const handleCrimeRatesClick = async () => {
  setIsLoading(true);
  
  try {
    const response = await dataService.executePreset('crime_rates_2023', {
      visualizationType: 'choropleth',
      animationEnabled: true,
      colorScheme: 'yellow-red'
    });
    
    if (response.success) {
      // Apply visualization with animation
      await mapAnimationEngine.animateRegionColors(
        response.data.regions.map(r => r.id),
        getCurrentColors(), // Current province colors
        response.data.regions.reduce((acc, r) => ({
          ...acc,
          [r.id]: r.color
        }), {}),
        response.data.visualizationConfig.animation
      );
      
      // Update legend
      updateLegend(response.data.visualizationConfig.colorScale);
    }
  } catch (error) {
    setError('Failed to load crime rate data');
  } finally {
    setIsLoading(false);
  }
};
```

## Future LLM Integration Architecture

### Preparation for Phase 5
```typescript
// src/services/llmService.ts
interface LLMRequest {
  prompt: string;
  context: {
    availableDatasets: string[];
    currentVisualization?: VisualizationResponse;
    userPreferences: Record<string, any>;
  };
}

class LLMService {
  async interpretPrompt(request: LLMRequest): Promise<{
    intent: 'visualize' | 'compare' | 'analyze' | 'filter';
    datasetSuggestions: string[];
    visualizationConfig: VisualizationConfig;
    processingSteps: string[];
  }> {
    // Send prompt to LLM API (OpenAI, Anthropic, etc.)
    // Parse structured response
    // Return actionable visualization instructions
  }
}
```

## Performance Considerations

### Backend Optimization
- **Caching**: Redis for frequently requested presets
- **Data Processing**: Stream processing for large datasets
- **Response Compression**: Gzip compression for JSON responses
- **Rate Limiting**: Prevent API abuse

### Frontend Optimization
- **Animation Performance**: Use `transform` and `opacity` for 60fps animations
- **Memory Management**: Clean up animation listeners and intervals
- **Debouncing**: Debounce rapid visualization requests
- **Progressive Loading**: Load visualizations incrementally

## Security Considerations

### Backend Security
- **Input Validation**: Strict schema validation for all inputs
- **File Upload Security**: Validate file types and sizes
- **Rate Limiting**: Prevent DoS attacks
- **CORS Configuration**: Restrict to known domains

### Data Privacy
- **No Persistent Storage**: Process and return data without storing
- **Data Sanitization**: Remove sensitive information
- **Audit Logging**: Log API usage for monitoring

## Testing Strategy

### Backend Testing
```javascript
// tests/integration/dataController.test.js
describe('Data Visualization API', () => {
  test('should process preset crime data correctly', async () => {
    const response = await request(app)
      .post('/api/presets/crime_rates_2023/execute')
      .send({ visualizationType: 'choropleth' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.regions).toHaveLength(21); // Swedish provinces
    expect(response.body.data.regions[0]).toHaveProperty('color');
  });
});
```

### Frontend Testing
```typescript
// tests/hooks/useDataVisualization.test.ts
describe('useDataVisualization', () => {
  test('should apply visualization data to map', async () => {
    const { result } = renderHook(() => useDataVisualization());
    
    await act(async () => {
      result.current.applyVisualization(mockVisualizationResponse);
    });
    
    expect(result.current.visualizationData).toBeDefined();
    expect(document.querySelector('[data-testid="province-stockholm"]'))
      .toHaveStyle('fill: #ff4444');
  });
});
```

## Deployment Strategy

### Backend Deployment
- **Platform**: Vercel, Railway, or DigitalOcean App Platform
- **Environment Variables**: API keys, CORS origins, cache settings
- **Health Checks**: Endpoint monitoring and alerting

### Frontend Integration
- **Environment Configuration**: API URL configuration
- **Build Process**: Include backend URL in production builds
- **Error Handling**: Graceful degradation when backend unavailable

## Conclusion

This technical implementation provides a solid foundation for transforming the current static map into a dynamic data visualization platform. The modular architecture allows for incremental development while maintaining code quality and performance standards.

The standardized data contract ensures consistent communication between frontend and backend, while the animation system provides engaging user experiences. The prepared LLM integration architecture positions the platform for future AI-powered data interpretation capabilities.

Key success factors:
- **Standardized data contracts** enable reliable frontend-backend communication
- **Modular architecture** supports incremental feature development
- **Performance optimization** ensures smooth animations and responsive interactions
- **Future-ready design** accommodates LLM integration and advanced analytics

This implementation guide serves as a comprehensive roadmap for building a professional-grade data visualization platform that meets the project's current needs while preparing for future enhancements.