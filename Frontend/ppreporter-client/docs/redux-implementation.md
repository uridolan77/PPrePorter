# Redux Implementation in PPreporter

## Overview

This document explains how Redux is implemented in the PPreporter application for state management, particularly for authentication and dashboard data.

## Store Structure

The Redux store is organized as follows:

```
store/
  ├── store.js           # Store configuration and middleware setup
  └── slices/            # Feature-based state slices
      ├── authSlice.js   # Authentication state management
      ├── dashboardSlice.js # Dashboard data and loading states
      ├── reportsSlice.js   # Reports data and configuration
      ├── naturalLanguageSlice.js # Natural language query features
      └── ...            # Other feature slices
```

## Key Redux Slices

### Authentication Slice
- **Path**: `src/store/slices/authSlice.js`
- **State**: User details, authentication status, loading states, errors
- **Actions**: Login, logout, register, password reset, profile updates

### Dashboard Slice
- **Path**: `src/store/slices/dashboardSlice.js`
- **State**: Dashboard metrics, charts data, loading states, component-specific errors
- **Actions**: Fetch dashboard data, refresh metrics, update visualizations

### Reports Slice
- **Path**: `src/store/slices/reportsSlice.js`
- **State**: Report configurations, generated reports, report scheduling
- **Actions**: Generate reports, schedule reports, export reports

### Natural Language Slice
- **Path**: `src/store/slices/naturalLanguageSlice.js`
- **State**: Query results, query history, suggested queries
- **Actions**: Execute queries, save queries, get query suggestions

## Integration with React Components

### Authentication
Authentication is handled through a dual approach:
1. **Context API**: `AuthContext` for backward compatibility and simpler components
2. **Redux**: For more complex state management and integration with other features

```jsx
// Using Redux for authentication
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../store/slices/authSlice';

function LoginComponent() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };
  
  // Component implementation
}
```

### Dashboard
Dashboard components use Redux for:
- Fetching and storing data
- Managing loading states
- Handling errors
- Persisting user preferences

```jsx
// Using Redux in dashboard components
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';

function DashboardComponent() {
  const dispatch = useDispatch();
  const { summaryStats, isLoading, error } = useSelector(state => state.dashboard);
  
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);
  
  // Component implementation
}
```

## Async Operations

Redux Toolkit's `createAsyncThunk` is used for all async operations, with standardized handling for:
- Loading states
- Success responses
- Error handling

```jsx
// Example of async thunk in a slice
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
```

## Extending with New Features

To add a new Redux-managed feature:

1. Create a new slice in `src/store/slices/`
2. Define initial state and reducers
3. Create async thunks for API calls
4. Add the reducer to the store configuration
5. Use the `useSelector` and `useDispatch` hooks in components

## Best Practices

- Use selectors for accessing state to improve performance and maintainability
- Keep component-specific state local when possible
- Use Redux for shared state that needs to be accessed across components
- Leverage Redux DevTools for debugging (enabled in development)
- Use standardized error handling throughout the application
