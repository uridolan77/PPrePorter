/**
 * Application configuration settings
 * These settings can be overridden by environment variables
 */

const config = {
  // API settings
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://localhost:7075/api',
    timeout: 10000, // 10 seconds
  },
  
  // Auth settings
  auth: {
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    tokenExpiryKey: 'tokenExpiry',
  },
  
  // Feature flags
  features: {
    enableNaturalLanguage: process.env.REACT_APP_ENABLE_NL === 'true' || true,
    enableRealTimeData: process.env.REACT_APP_ENABLE_REALTIME === 'true' || false,
    debugMode: process.env.NODE_ENV === 'development',
  },
  
  // Dashboard settings
  dashboard: {
    defaultRefreshInterval: 300000, // 5 minutes
    maxDataPoints: 100,
  }
};

export default config;
