# Analytics Feature

This directory contains all components, hooks, and utilities related to the Analytics feature of the PPreporter application.

## Directory Structure

```
analytics/
├── components/         # UI components specific to analytics
│   ├── charts/         # Chart components
│   ├── metrics/        # Metric display components
│   ├── tables/         # Table components
│   └── common/         # Common components used across analytics
├── hooks/              # Custom hooks for analytics
├── store/              # Redux store integration
│   ├── slice.ts        # Redux slice for analytics
│   └── selectors.ts    # Selectors for analytics data
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── pages/              # Page components
│   ├── AnalyticsPage.tsx  # Main analytics page
│   └── tabs/           # Tab components
└── index.ts            # Barrel exports
```

## Usage

The Analytics feature provides a comprehensive dashboard for visualizing and analyzing data. It includes:

- Key metrics display
- Performance charts
- Player analysis
- Game analysis

## Components

### AnalyticsPage

The main entry point for the Analytics feature. It displays a tabbed interface with different analytics views.

```tsx
import { AnalyticsPage } from 'features/analytics';

function App() {
  return (
    <div className="app">
      <AnalyticsPage />
    </div>
  );
}
```

### Tabs

The Analytics feature includes several tabs:

- **Overview**: Displays key metrics and recent transactions
- **Performance**: Shows detailed performance analytics
- **Player Analysis**: Provides insights into player behavior
- **Game Analysis**: Analyzes game performance

## Redux Integration

The Analytics feature uses Redux for state management. The main slice is `analyticsSlice` which handles:

- Loading dashboard data
- Managing tab state
- Handling errors

## Custom Hooks

Several custom hooks are available for use in components:

- `useDashboardData`: Manages loading and refreshing dashboard data
- `useTabs`: Handles tab navigation and state
- `useAnalyticsFilters`: Manages filter state for analytics data

## Contributing

When adding new components or functionality to the Analytics feature, please follow these guidelines:

1. Place components in the appropriate subdirectory
2. Add proper JSDoc comments
3. Create tests for new components
4. Update this README if necessary
