# CORS Issue Fix Documentation

## Problem

The frontend application running on `http://localhost:3001` was unable to communicate with the backend API running on `https://localhost:7075` due to CORS (Cross-Origin Resource Sharing) restrictions. This resulted in the following error:

```
Access to fetch at 'https://localhost:7075/api/health' from origin 'http://localhost:3001' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

The following changes were made to fix the CORS issue:

### 1. Backend Changes (Program.cs)

1. Updated the CORS policy to include `http://localhost:3001` as an allowed origin:

```csharp
// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

2. Moved the CORS middleware to the correct position in the request pipeline (after routing but before authentication):

```csharp
// Add routing early in the pipeline
app.UseRouting();

// Enable CORS after routing but before authentication
app.UseCors("AllowReactApp");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();
```

3. Applied the CORS policy to the health check endpoints:

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false // Prevent caching of health check responses
}).RequireCors("AllowReactApp"); // Apply CORS policy to health endpoint
```

### 2. Frontend Changes

1. Created a `.env.development` file to set the API URL:

```
# Development environment variables
REACT_APP_API_URL=http://localhost:3001/api
```

2. Updated the setupProxy.js file to handle CORS properly:

```javascript
const commonOptions = {
  target: 'https://localhost:7075',
  changeOrigin: true,
  secure: false,
  headers: {
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
    proxyReq.setHeader('Origin', 'http://localhost:3001');
    // ...
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    // ...
  }
};
```

## How It Works

1. The backend now accepts requests from `http://localhost:3001` through the CORS policy.
2. The CORS middleware is correctly positioned in the request pipeline.
3. The health check endpoints now have the CORS policy applied.
4. The frontend proxy is configured to handle CORS headers properly.

## Testing

To test the changes:

1. Start the backend API: `dotnet run --project Backend\PPrePorter.API\PPrePorter.API.csproj`
2. Start the frontend application: `cd Frontend\ppreporter-client && npm start`
3. The frontend should now be able to communicate with the backend API without CORS errors.

## Troubleshooting

If CORS issues persist:

1. Check that the backend API is running on `https://localhost:7075`.
2. Check that the frontend is running on `http://localhost:3001`.
3. Check the browser console for any CORS-related errors.
4. Verify that the CORS policy in the backend is correctly configured.
5. Verify that the proxy settings in the frontend are correctly configured.
