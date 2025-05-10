using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PPrePorter.API.Features.Monitoring
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Restrict access to admin users
    public class MetricsController : ControllerBase
    {
        private readonly IMetricsService _metricsService;
        private readonly ILogger<MetricsController> _logger;

        public MetricsController(
            IMetricsService metricsService,
            ILogger<MetricsController> logger)
        {
            _metricsService = metricsService ?? throw new ArgumentNullException(nameof(metricsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all metrics
        /// </summary>
        [HttpGet]
        public ActionResult<Dictionary<string, RequestMetrics>> GetAllMetrics()
        {
            try
            {
                var metrics = _metricsService.GetAllMetrics();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metrics");
                return StatusCode(500, "An error occurred while retrieving metrics");
            }
        }

        /// <summary>
        /// Gets metrics for a specific path and method
        /// </summary>
        [HttpGet("{path}/{method}")]
        public ActionResult<RequestMetrics> GetMetrics(string path, string method)
        {
            try
            {
                // Normalize the path
                path = "/" + path;
                
                var averageDuration = _metricsService.GetAverageRequestDuration(path, method);
                var totalRequests = _metricsService.GetRequestCount(path, method);
                
                if (totalRequests == 0)
                {
                    return NotFound($"No metrics found for {method} {path}");
                }
                
                var metrics = new RequestMetrics
                {
                    Path = path,
                    Method = method,
                    TotalRequests = totalRequests,
                    AverageDurationMs = averageDuration,
                    RequestsByStatusCode = new Dictionary<int, long>()
                };
                
                // Get counts for common status codes
                foreach (var statusCode in new[] { 200, 201, 204, 400, 401, 403, 404, 500 })
                {
                    var count = _metricsService.GetRequestCountByStatusCode(path, method, statusCode);
                    if (count > 0)
                    {
                        metrics.RequestsByStatusCode[statusCode] = count;
                    }
                }
                
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metrics for {Method} {Path}", method, path);
                return StatusCode(500, "An error occurred while retrieving metrics");
            }
        }
    }
}
