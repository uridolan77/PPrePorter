# API Integration Documentation

This document outlines the API integration between the PPreporter React client application and the backend service running at https://localhost:7075.

## Overview

The application uses a RESTful API approach with the following components:

1. API client configuration
2. Service modules for different functional areas
3. Redux integration for state management
4. Error handling and fallbacks

## API Base Configuration

```javascript
// src/config/appConfig.js
const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://localhost:7075/api',
    timeout: 10000, // 10 seconds
  },
  // Other configuration options...
};
```

## API Client

```javascript
// src/services/api/apiClient.js
import axios from 'axios';
import config from '../../config/appConfig';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout,
});

// Add interceptors for auth token handling
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

## Service Modules

The application uses service modules to encapsulate API calls for different functional areas:

### Dashboard Service

```javascript
// src/services/api/dashboardService.js
import apiClient from './apiClient';

const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Other dashboard-related API methods...

export default {
  getDashboardStats,
  // Other exported methods...
};
```

### Contextual Service

```javascript
// src/services/api/contextualService.js
import apiClient from './apiClient';

const getContextualExplanation = async (params) => {
  try {
    const response = await apiClient.post('/contextual/explain', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Other contextual data methods...

export default {
  getContextualExplanation,
  // Other exported methods...
};
```

## Redux Integration

The application uses Redux for state management with thunks for handling asynchronous API calls:

```javascript
// src/store/actions/dashboardActions.js
import dashboardService from '../../services/api/dashboardService';

export const fetchDashboardData = () => {
  return async (dispatch) => {
    dispatch({ type: 'dashboard/fetchStart' });
    
    try {
      // API calls using the dashboard service
      const stats = await dashboardService.getDashboardStats();
      // More API calls...
      
      dispatch({ 
        type: 'dashboard/fetchSuccess',
        payload: data
      });
    } catch (error) {
      dispatch({ 
        type: 'dashboard/fetchFailure',
        payload: error.message 
      });
    }
  }
};
```

## Component API Usage

Components use the Redux store or service modules directly:

### Using Redux

```javascript
// Component using Redux
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../store/actions/dashboardActions';

const DashboardComponent = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.dashboard);
  
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);
  
  // Component rendering...
};
```

### Direct Service Usage

```javascript
// Component using services directly
import { useState, useEffect } from 'react';
import contextualService from '../services/api/contextualService';

const ContextualExplanationComponent = ({ metric, data }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const result = await contextualService.getContextualExplanation({
        metric,
        data,
        insightType: 'trend'
      });
      setExplanation(result);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      // Handle error or use fallbacks
    } finally {
      setLoading(false);
    }
  };
  
  // Component rendering...
};
```

## API Endpoints

The following API endpoints are used by the application:

### Dashboard

- `GET /api/dashboard/stats` - Get overview statistics
- `GET /api/dashboard/player-registrations` - Get player registration data
- `GET /api/dashboard/recent-transactions` - Get recent transactions
- `GET /api/dashboard/top-games` - Get top games by various metrics
- `GET /api/dashboard/casino-revenue` - Get revenue by casino
- `GET /api/dashboard/player-journey` - Get player journey data for Sankey diagram
- `GET /api/dashboard/kpis` - Get KPI data with targets and trends
- `GET /api/dashboard/metrics/trend` - Get trend data for specific metrics
- `GET /api/dashboard/metrics/anomalies` - Get anomaly detection for metrics
- `GET /api/dashboard/metrics/forecast` - Get forecast data for metrics
- `GET /api/dashboard/metrics/comparison` - Get comparison data for metrics
- `POST /api/dashboard/query` - Run natural language queries against dashboard data

### Contextual Information

- `POST /api/contextual/explain` - Get contextual explanations for metrics
- `POST /api/contextual/detailed-analysis` - Get detailed analysis for metrics
- `POST /api/contextual/insights-recommendations` - Get insights with recommendations
- `POST /api/contextual/anomaly-detection` - Get anomaly detection results
- `POST /api/contextual/forecast` - Get forecast data

## Error Handling

The application includes error handling at multiple levels:

1. Service level - Each service method has try/catch blocks
2. Component level - Components handle loading states and error conditions
3. Redux level - Redux actions handle API errors and update state
4. Fallback mechanisms - Development mode can fall back to mock data

## Development & Testing

For local development, the application can fall back to mock data if the backend API is unavailable. This behavior is controlled by the `NODE_ENV` environment variable.

```javascript
if (process.env.NODE_ENV === 'development') {
  console.warn('Falling back to mock data...');
  // Use mock data
} else {
  // Show error to user
}
```
