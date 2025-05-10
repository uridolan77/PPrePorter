using System.Diagnostics;
using PPrePorter.API.Features.Monitoring;

namespace PPrePorter.API.Middleware
{
    /// <summary>
    /// Middleware for monitoring request performance
    /// </summary>
    public class PerformanceMonitoringMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMetricsService _metrics;
        private readonly ILogger<PerformanceMonitoringMiddleware> _logger;

        public PerformanceMonitoringMiddleware(
            RequestDelegate next,
            IMetricsService metrics,
            ILogger<PerformanceMonitoringMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _metrics = metrics ?? throw new ArgumentNullException(nameof(metrics));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Start the stopwatch
            var sw = Stopwatch.StartNew();
            
            try
            {
                // Continue with the request
                await _next(context);
            }
            finally
            {
                // Stop the stopwatch
                sw.Stop();
                
                // Record the request duration
                var path = GetNormalizedPath(context.Request.Path);
                var method = context.Request.Method;
                var statusCode = context.Response.StatusCode;
                var durationMs = sw.ElapsedMilliseconds;
                
                _metrics.RecordRequestDuration(path, method, statusCode, durationMs);
                
                // Log slow requests
                if (durationMs > 500)
                {
                    _logger.LogWarning("Slow request: {Method} {Path}, Status: {StatusCode}, Duration: {DurationMs}ms",
                        method, path, statusCode, durationMs);
                }
                
                // Add response headers for performance metrics
                context.Response.Headers.Append("X-Response-Time-Ms", durationMs.ToString());
            }
        }
        
        /// <summary>
        /// Normalizes the path to avoid creating too many unique metrics
        /// </summary>
        private string GetNormalizedPath(string path)
        {
            // Normalize paths with IDs to avoid creating too many unique metrics
            // Example: /api/users/123 -> /api/users/{id}
            
            // Check if the path is a Swagger path
            if (path.StartsWith("/swagger"))
            {
                return "/swagger";
            }
            
            // Check if the path is a health check path
            if (path.StartsWith("/health"))
            {
                return "/health";
            }
            
            // Split the path into segments
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var normalizedSegments = new List<string>();
            
            for (int i = 0; i < segments.Length; i++)
            {
                var segment = segments[i];
                
                // Check if the segment is an ID (numeric or GUID)
                if (i > 0 && (IsNumeric(segment) || IsGuid(segment)))
                {
                    normalizedSegments.Add("{id}");
                }
                else
                {
                    normalizedSegments.Add(segment);
                }
            }
            
            return "/" + string.Join("/", normalizedSegments);
        }
        
        /// <summary>
        /// Checks if a string is numeric
        /// </summary>
        private bool IsNumeric(string value)
        {
            return long.TryParse(value, out _);
        }
        
        /// <summary>
        /// Checks if a string is a GUID
        /// </summary>
        private bool IsGuid(string value)
        {
            return Guid.TryParse(value, out _);
        }
    }
}
