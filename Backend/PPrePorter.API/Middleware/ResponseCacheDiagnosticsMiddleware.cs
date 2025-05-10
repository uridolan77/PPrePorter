using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Configuration;
using System.Diagnostics;

namespace PPrePorter.API.Middleware
{
    /// <summary>
    /// Middleware for diagnosing response caching issues
    /// </summary>
    public class ResponseCacheDiagnosticsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ResponseCacheDiagnosticsMiddleware> _logger;
        private readonly CacheSettings _cacheSettings;

        public ResponseCacheDiagnosticsMiddleware(
            RequestDelegate next,
            ILogger<ResponseCacheDiagnosticsMiddleware> logger,
            IOptions<CacheSettings> cacheSettings)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cacheSettings = cacheSettings?.Value ?? throw new ArgumentNullException(nameof(cacheSettings));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only diagnose GET requests to specific paths
            bool shouldDiagnose = context.Request.Method == "GET" && 
                (context.Request.Path.StartsWithSegments("/api/cache-test") ||
                 context.Request.Path.StartsWithSegments("/api/cache-diagnostics"));
            
            if (!shouldDiagnose)
            {
                await _next(context);
                return;
            }
            
            // Check if this is a cacheable request
            bool isCacheable = IsCacheableRequest(context);
            
            // Start the stopwatch
            var sw = Stopwatch.StartNew();
            
            // Capture the original response body
            var originalBodyStream = context.Response.Body;
            
            // Create a new memory stream to capture the response
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;
            
            try
            {
                // Continue with the request
                await _next(context);
                
                // Stop the stopwatch
                sw.Stop();
                
                // Add diagnostics headers
                if (!context.Response.HasStarted)
                {
                    context.Response.Headers.Append("X-Response-Time-Ms", sw.ElapsedMilliseconds.ToString());
                    context.Response.Headers.Append("X-Cacheable-Request", isCacheable.ToString());
                    
                    // Check if the response is cacheable
                    bool isCacheableResponse = IsCacheableResponse(context);
                    context.Response.Headers.Append("X-Cacheable-Response", isCacheableResponse.ToString());
                    
                    // Add reasons why the response might not be cacheable
                    if (!isCacheableResponse)
                    {
                        var reasons = GetNonCacheableReasons(context);
                        context.Response.Headers.Append("X-Non-Cacheable-Reasons", string.Join(", ", reasons));
                    }
                }
                
                // Copy the response to the original stream
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
            finally
            {
                // Restore the original response body
                context.Response.Body = originalBodyStream;
            }
        }
        
        /// <summary>
        /// Determines if a request is cacheable
        /// </summary>
        private bool IsCacheableRequest(HttpContext context)
        {
            // Only GET and HEAD requests are cacheable
            if (context.Request.Method != "GET" && context.Request.Method != "HEAD")
            {
                return false;
            }
            
            // Check if the path is excluded
            foreach (var excludedPath in _cacheSettings.ExcludedPaths)
            {
                if (context.Request.Path.StartsWithSegments(excludedPath))
                {
                    return false;
                }
            }
            
            // Check for cache control headers that prevent caching
            if (context.Request.Headers.CacheControl.ToString().Contains("no-cache") ||
                context.Request.Headers.CacheControl.ToString().Contains("no-store"))
            {
                return false;
            }
            
            return true;
        }
        
        /// <summary>
        /// Determines if a response is cacheable
        /// </summary>
        private bool IsCacheableResponse(HttpContext context)
        {
            // Only successful responses are cacheable
            if (context.Response.StatusCode < 200 || context.Response.StatusCode >= 300)
            {
                return false;
            }
            
            // Check for cache control headers that prevent caching
            if (context.Response.Headers.CacheControl.ToString().Contains("no-cache") ||
                context.Response.Headers.CacheControl.ToString().Contains("no-store") ||
                context.Response.Headers.CacheControl.ToString().Contains("private"))
            {
                return false;
            }
            
            // Check for Vary: * header which prevents caching
            if (context.Response.Headers.Vary.ToString() == "*")
            {
                return false;
            }
            
            return true;
        }
        
        /// <summary>
        /// Gets the reasons why a response is not cacheable
        /// </summary>
        private List<string> GetNonCacheableReasons(HttpContext context)
        {
            var reasons = new List<string>();
            
            // Check request method
            if (context.Request.Method != "GET" && context.Request.Method != "HEAD")
            {
                reasons.Add($"Method {context.Request.Method} is not cacheable");
            }
            
            // Check status code
            if (context.Response.StatusCode < 200 || context.Response.StatusCode >= 300)
            {
                reasons.Add($"Status code {context.Response.StatusCode} is not cacheable");
            }
            
            // Check request headers
            if (context.Request.Headers.CacheControl.ToString().Contains("no-cache"))
            {
                reasons.Add("Request has no-cache directive");
            }
            
            if (context.Request.Headers.CacheControl.ToString().Contains("no-store"))
            {
                reasons.Add("Request has no-store directive");
            }
            
            // Check response headers
            if (context.Response.Headers.CacheControl.ToString().Contains("no-cache"))
            {
                reasons.Add("Response has no-cache directive");
            }
            
            if (context.Response.Headers.CacheControl.ToString().Contains("no-store"))
            {
                reasons.Add("Response has no-store directive");
            }
            
            if (context.Response.Headers.CacheControl.ToString().Contains("private"))
            {
                reasons.Add("Response has private directive");
            }
            
            if (context.Response.Headers.Vary.ToString() == "*")
            {
                reasons.Add("Response has Vary: * header");
            }
            
            if (!context.Response.Headers.CacheControl.ToString().Contains("public") &&
                !context.Response.Headers.CacheControl.ToString().Contains("max-age"))
            {
                reasons.Add("Response lacks public or max-age directive");
            }
            
            return reasons;
        }
    }
}
