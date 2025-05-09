# PP Reporter Client Application

## Overview
PP Reporter is a web application that provides user authentication and a comprehensive dashboard for monitoring various performance metrics. The application allows users to register, log in, and access interactive reports.

## Features
- User authentication (login, registration, password reset)
- Interactive dashboard with key metrics visualization
- Data insights and analysis
- Responsive design for all device types
- Contextual explanations of metrics
- API integration with backend server

## Technologies Used
- React.js
- Material-UI for UI components
- React Router for navigation
- Redux & Redux Toolkit for state management
- Axios for API requests
- Context API for complementary state management

## Project Structure
```
ppreporter-client/
├── public/                  # Static files
├── src/                     # Source code
│   ├── components/          # Reusable React components
│   │   ├── auth/            # Authentication-related components
│   │   ├── common/          # Common UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── layout/          # Layout components
│   ├── config/              # Application configuration
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Application pages
│   │   ├── auth/            # Authentication pages
│   │   └── dashboard/       # Dashboard pages
│   ├── services/            # Service layer
│   │   └── api/             # API services
│   ├── store/               # Redux store and slices
│   │   ├── slices/          # Redux toolkit slices 
│   │   └── store.js         # Redux store configuration
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main application component
│   └── index.js             # Application entry point
├── docs/                    # Documentation
│   ├── api-integration.md   # API integration documentation
│   └── redux-implementation.md # Redux implementation docs
├── package.json             # Project dependencies
├── start-app.bat            # Windows batch script to start the app
└── start-app.ps1            # PowerShell script to start the app
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd ppreporter-client
```

2. Install dependencies:
```bash
npm install
```

### Running the Application
You can run the application using one of the following methods:

**Using npm:**
```bash
npm start
```

**Using provided scripts:**
- On Windows, run `start-app.bat` or `start-app.ps1`

The application will start at `http://localhost:3000` by default.

### Environment Variables
The application uses the following environment variables:

- `REACT_APP_API_URL`: API endpoint URL (default: http://localhost:5000/api)

## Authentication Flow
1. User registers or logs in through the authentication pages
2. On successful authentication, a JWT token is stored in local storage
3. Protected routes check for valid authentication before rendering
4. Authentication state is managed through the AuthContext

## State Management with Redux

The application uses Redux for global state management:

- **Authentication State**: User information, login status, and auth tokens
- **Dashboard Data**: Metrics, visualizations, and user preferences
- **Reports**: Report configurations and generated data

### Redux Structure

- **Store**: Centralized state container configured in `src/store/store.js`
- **Slices**: Feature-based state management using Redux Toolkit
  - `authSlice.js`: Authentication state
  - `dashboardSlice.js`: Dashboard metrics and data
  - Other feature-specific slices

### Using Redux in Components

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { someAction } from '../store/slices/someSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.feature.data);
  
  const handleAction = () => {
    dispatch(someAction(payload));
  };
  
  return (
    // Component JSX
  );
}
```

For more details, see the [Redux Implementation Documentation](./docs/redux-implementation.md).

## Dashboard
The dashboard provides various visualizations and insights:

- Key performance indicators (KPIs)
- Revenue charts
- Player activity metrics
- Contextual explanations and insights

## Development

### Adding New Components
1. Create a new component file in the appropriate directory
2. Import necessary dependencies
3. Define the component with appropriate props and state
4. Export the component

### Adding New Pages
1. Create a new page component in the pages directory
2. Add the route to the new page in App.jsx
3. Implement necessary authentication checks if required

### API Integration
1. Add new API service functions in the services/api directory
2. Use the apiClient for all API requests to ensure consistent error handling and authentication

## Backend API Integration

The application connects to a backend server running at `https://localhost:7075/api`. The API integration is structured as follows:

### API Configuration

The API base URL and other settings are centralized in `src/config/appConfig.js`:

```javascript
// API base configuration
const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://localhost:7075/api',
    timeout: 10000, // 10 seconds
  },
  // Other configuration...
};
```

### Service Layer

The application uses service modules to abstract API calls:

- `dashboardService.js` - Handles dashboard metrics and reports
- `contextualService.js` - Manages contextual explanations and insights
- `authService.js` - Handles authentication

### Redux Integration

API calls are integrated with Redux using thunk middleware:

```javascript
// Example of a Redux thunk
export const fetchDashboardData = () => {
  return async (dispatch) => {
    dispatch({ type: 'dashboard/fetchStart' });
    
    try {
      // API calls...
      dispatch({ type: 'dashboard/fetchSuccess', payload: data });
    } catch (error) {
      dispatch({ type: 'dashboard/fetchFailure', payload: error.message });
    }
  }
};
```

For more details, see the [API Integration Documentation](./docs/api-integration.md).

## Troubleshooting
- If you encounter CORS issues, ensure your API server is configured to allow requests from your client's origin
- For authentication issues, check that your token is being correctly stored and included in requests
- For component rendering issues, check the React DevTools for component state and props
