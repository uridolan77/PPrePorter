/**
 * React development proxy configuration
 * This file is used by Create React App to configure the development proxy
 * It helps avoid CORS issues during development
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Common proxy options
  const commonOptions = {
    target: 'https://localhost:7075',
    changeOrigin: true,
    secure: false, // Ignore SSL certificate errors for local development
    headers: {
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Allow any origin during development
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add any custom headers needed for the API
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      proxyReq.setHeader('Origin', 'http://localhost:3001');

      // Add a custom header to identify proxy requests
      proxyReq.setHeader('X-Proxy-Request', 'true');

      // Log proxy requests with more details
      console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      console.log(`[PROXY] Headers: ${JSON.stringify(proxyReq.getHeaders())}`);
    },
    onError: (err, req, res) => {
      console.error('[PROXY ERROR]', err);

      // Log more detailed error information
      console.error(`[PROXY ERROR DETAILS] URL: ${req.url}, Method: ${req.method}`);
      console.error(`[PROXY ERROR DETAILS] Error Code: ${err.code}, Message: ${err.message}`);

      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({
        message: 'Proxy error. The API server may be down or unreachable.',
        error: err.message,
        code: err.code,
        url: req.url,
        method: req.method
      }));
    },
    // Add a timeout to the proxy request
    proxyTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
  };

  // Proxy all API requests
  app.use(
    '/api',
    createProxyMiddleware({
      ...commonOptions,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix when forwarding
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to the response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

        // Log proxy response
        console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      }
    })
  );

  // Also proxy Swagger requests
  app.use(
    '/swagger',
    createProxyMiddleware({
      ...commonOptions,
      // No path rewrite needed for swagger
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to the response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

        // Log proxy response
        console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      }
    })
  );

  // Proxy health check endpoint with shorter timeout
  app.use(
    '/health',
    createProxyMiddleware({
      ...commonOptions,
      // No path rewrite needed for health
      // Use a shorter timeout for health checks
      proxyTimeout: 5000, // 5 seconds
      timeout: 5000, // 5 seconds
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to the response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

        // Log proxy response with more details
        console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
        console.log(`[PROXY RESPONSE HEADERS] ${JSON.stringify(proxyRes.headers)}`);
      }
    })
  );
};
