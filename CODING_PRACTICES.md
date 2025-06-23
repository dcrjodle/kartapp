# Coding Practices Guide

This document outlines coding standards and best practices for React and TypeScript development in this project.

## Table of Contents

- [Project Structure](#project-structure)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Standards](#react-component-standards)
- [Styling Guidelines](#styling-guidelines)
- [Performance Best Practices](#performance-best-practices)
- [Testing Standards](#testing-standards)
- [Git Workflow](#git-workflow)
- [Code Review Checklist](#code-review-checklist)

## Project Structure

### Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── ComponentName/
│   │   ├── index.tsx    # Main component file
│   │   ├── ComponentName.scss
│   │   └── ComponentName.test.tsx
├── utils/              # Utility functions and helpers
├── data/               # Static data and constants
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── assets/             # Images, fonts, and other static assets
```

### File Naming Conventions

- **Components**: PascalCase (`CustomMap.tsx`)
- **Utilities**: camelCase (`mapProjection.ts`)
- **Styles**: Match component name (`CustomMap.scss`)
- **Tests**: Component name + `.test.tsx` (`CustomMap.test.tsx`)
- **Types**: camelCase with `.types.ts` suffix (`map.types.ts`)

## TypeScript Guidelines

### Type Definitions

```typescript
// ✅ Good - Explicit interface definitions
interface Municipality {
  coordinates: number[][][];
  name?: string;
  id?: string;
}

// ✅ Good - Union types for specific values
type MapMode = 'pan' | 'zoom' | 'select';

// ❌ Avoid - Using 'any' type
const data: any = fetchData();
```

### Function Signatures

```typescript
// ✅ Good - Clear parameter and return types
const calculateBounds = (municipalities: Municipality[]): Bounds => {
  // implementation
};

// ✅ Good - Optional parameters with defaults
const generateGrid = (
  bounds: Bounds, 
  interval: number = 2
): GridLine[] => {
  // implementation
};
```

### Generic Types

```typescript
// ✅ Good - Use generics for reusable utilities
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  // implementation
}

// ✅ Good - Constraint generics appropriately
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

### Import/Export Standards

```typescript
// ✅ Good - Named exports for utilities
export const calculateBounds = () => {};
export const projectCoordinates = () => {};

// ✅ Good - Default export for main component
export default CustomMap;

// ✅ Good - Grouped imports
import React, { useState, useEffect, useMemo } from 'react';
import { calculateBounds, projectCoordinates } from '../utils/mapProjection';
import type { Municipality, Bounds } from '../types/map.types';
```

## React Component Standards

### Component Structure

```typescript
/**
 * Component description
 * 
 * @author Your Name
 */

import React, { useState, useEffect } from 'react';
import './ComponentName.scss';

interface ComponentProps {
  /** Description of prop */
  requiredProp: string;
  /** Optional prop with default */
  optionalProp?: number;
}

const ComponentName: React.FC<ComponentProps> = ({
  requiredProp,
  optionalProp = 10
}) => {
  // 1. State declarations
  const [state, setState] = useState<StateType>(initialValue);
  
  // 2. Memoized calculations
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(requiredProp);
  }, [requiredProp]);
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, [dependencies]);
  
  // 4. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // 5. Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Props Guidelines

```typescript
// ✅ Good - Clear prop interface with JSDoc
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Click handler function */
  onClick: () => void;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disabled state */
  disabled?: boolean;
}

// ✅ Good - Default props within destructuring
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  // implementation
};
```

### State Management

```typescript
// ✅ Good - Typed state with initial value
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);

// ✅ Good - State updates with proper typing
const updateUser = (newUser: User) => {
  setUser(prevUser => ({
    ...prevUser,
    ...newUser
  }));
};

// ✅ Good - Complex state with useReducer
interface State {
  data: Item[];
  loading: boolean;
  error: string | null;
}

type Action = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: Item[] }
  | { type: 'ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
```

### Custom Hooks

```typescript
// ✅ Good - Custom hook with clear return type
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useApi = <T>(url: string): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    // implementation
  }, [url]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};
```

## Styling Guidelines

### SASS Structure

```scss
// Variables at the top
$primary-color: #4a90e2;
$secondary-color: #2c5aa0;
$spacing-unit: 8px;

// Mixins for reusable patterns
@mixin button-base {
  border: none;
  border-radius: 4px;
  padding: $spacing-unit $spacing-unit * 2;
  cursor: pointer;
  transition: all 0.2s ease;
}

// Component styles with BEM methodology
.component-name {
  display: flex;
  flex-direction: column;
  
  &__element {
    padding: $spacing-unit;
    
    &--modifier {
      background-color: $primary-color;
    }
  }
  
  &__button {
    @include button-base;
    background-color: $primary-color;
    
    &:hover {
      background-color: darken($primary-color, 10%);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
```

### CSS Class Naming

```typescript
// ✅ Good - BEM methodology
<div className="custom-map">
  <div className="custom-map__controls">
    <button className="custom-map__button custom-map__button--primary">
      Reset
    </button>
  </div>
</div>

// ✅ Good - Conditional classes
const buttonClasses = `
  custom-map__button 
  ${variant && `custom-map__button--${variant}`}
  ${disabled ? 'custom-map__button--disabled' : ''}
`.trim();
```

### Responsive Design

```scss
// Mobile-first approach
.component {
  padding: 8px;
  
  // Tablet
  @media (min-width: 768px) {
    padding: 16px;
  }
  
  // Desktop
  @media (min-width: 1024px) {
    padding: 24px;
  }
}
```

## Performance Best Practices

### Memoization

```typescript
// ✅ Good - Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return municipalities.map(m => transformData(m));
}, [municipalities]);

// ✅ Good - Memoize callbacks to prevent re-renders
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// ✅ Good - Memoize components when needed
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Code Splitting

```typescript
// ✅ Good - Lazy load components
const LazyMap = React.lazy(() => import('./components/CustomMap'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyMap />
</Suspense>
```

### Event Handling

```typescript
// ✅ Good - Prevent unnecessary re-renders
const handleSubmit = useCallback((e: React.FormEvent) => {
  e.preventDefault();
  onSubmit(formData);
}, [formData, onSubmit]);

// ✅ Good - Debounce expensive operations
const debouncedSearch = useMemo(() => 
  debounce((query: string) => {
    performSearch(query);
  }, 300), 
  []
);
```

## Testing Standards

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CustomMap from './CustomMap';

describe('CustomMap', () => {
  const mockMunicipalities = [
    { id: '1', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1]]] }
  ];

  it('renders municipality data correctly', () => {
    render(<CustomMap municipalities={mockMunicipalities} />);
    
    expect(screen.getByText(/municipalities: 1/i)).toBeInTheDocument();
  });

  it('handles zoom interaction', () => {
    render(<CustomMap municipalities={mockMunicipalities} />);
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    expect(screen.getByText(/zoom: 1.00/i)).toBeInTheDocument();
  });
});
```

### Utility Testing

```typescript
import { calculateBounds } from './mapProjection';

describe('mapProjection utilities', () => {
  it('calculates bounds correctly', () => {
    const municipalities = [
      { coordinates: [[[0, 0], [10, 10]]] }
    ];
    
    const bounds = calculateBounds(municipalities);
    
    expect(bounds).toEqual({
      minLng: 0,
      maxLng: 10,
      minLat: 0,
      maxLat: 10
    });
  });
});
```

## Git Workflow

### Commit Messages

```bash
# ✅ Good - Clear, descriptive commits
feat: add zoom controls to custom map component
fix: resolve coordinate projection accuracy issue
refactor: extract map utilities to separate module
docs: update component API documentation
style: improve responsive design for mobile devices
test: add unit tests for map projection utilities
```

### Branch Naming

```bash
# ✅ Good - Descriptive branch names
feature/map-zoom-controls
bugfix/coordinate-projection-fix
refactor/extract-map-utilities
docs/component-documentation
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No console errors

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Code Review Checklist

### For Reviewers

- [ ] **Functionality**: Does the code work as intended?
- [ ] **Type Safety**: Are all TypeScript types properly defined?
- [ ] **Performance**: Are there any performance concerns?
- [ ] **Accessibility**: Is the component accessible?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code well-documented?
- [ ] **Consistency**: Does it follow project conventions?

### For Authors

- [ ] **Self-Review**: Have you reviewed your own code?
- [ ] **Testing**: Have you tested all scenarios?
- [ ] **Documentation**: Have you updated relevant docs?
- [ ] **Performance**: Have you considered performance impact?
- [ ] **Breaking Changes**: Are there any breaking changes?

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SASS Documentation](https://sass-lang.com/documentation)
- [Testing Library](https://testing-library.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Remember**: These are guidelines, not rigid rules. Use your judgment and discuss with the team when in doubt.