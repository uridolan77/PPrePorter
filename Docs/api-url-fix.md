# API URL Configuration Fix

## Problem

The frontend application was unable to connect to the backend API due to incorrect URL configuration. The following issues were identified:

1. The API URL in the `.env.development` file was pointing to the frontend server itself (`http://localhost:3001/api`) instead of the backend API server.
2. The health check endpoint was being accessed at the wrong path (`${API_URL}/health` instead of `${baseUrl}/health`).

## Solution

The following changes were made to fix the API URL configuration:

### 1. Updated the .env.development file

```
# Development environment variables
REACT_APP_API_URL=https://localhost:7075/api
```

### 2. Fixed the health check URL in apiClient.ts

```javascript
// Function to enable mock data mode if API is unavailable
const enableMockDataIfApiUnavailable = async () => {
  try {
    // Extract the base URL without the /api part for health check
    const baseUrl = API_URL.replace('/api', '');
    console.log('Checking API availability at:', `${baseUrl}/health`);

    // Try to ping the API server
    const response = await fetch(`${baseUrl}/health`, {
      method: 'HEAD',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
```

### 3. Created an API Test Page

Created a dedicated API test page to verify the API connection:

- `src/components/ApiHealthCheck.js`: Component to check API health
- `src/pages/ApiTestPage.js`: Page to display API health check
- Updated `App.tsx` to include a route to the API test page at `/api-test`

## How It Works

1. The frontend now correctly points to the backend API at `https://localhost:7075/api`.
2. The health check correctly accesses the health endpoint at `https://localhost:7075/health`.
3. The API test page provides a visual way to verify the API connection.

## Testing

To test the changes:

1. Start the backend API: `dotnet run --project Backend\PPrePorter.API\PPrePorter.API.csproj`
2. Start the frontend application: `cd Frontend\ppreporter-client && npm start`
3. Navigate to `http://localhost:3001/api-test` to see the API health check.

## Troubleshooting

If API connection issues persist:

1. Check that the backend API is running on `https://localhost:7075`.
2. Check that the frontend is running on `http://localhost:3001`.
3. Check the browser console for any API-related errors.
4. Verify that the API URL in `.env.development` is correct.
5. Check that the CORS policy in the backend is correctly configured.
