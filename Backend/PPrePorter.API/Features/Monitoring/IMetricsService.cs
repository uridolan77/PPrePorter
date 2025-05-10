namespace PPrePorter.API.Features.Monitoring
{
    /// <summary>
    /// Service for recording and retrieving application metrics
    /// </summary>
    public interface IMetricsService
    {
        /// <summary>
        /// Records the duration of a request
        /// </summary>
        /// <param name="path">The request path</param>
        /// <param name="method">The HTTP method</param>
        /// <param name="statusCode">The response status code</param>
        /// <param name="durationMs">The request duration in milliseconds</param>
        void RecordRequestDuration(string path, string method, int statusCode, long durationMs);

        /// <summary>
        /// Gets the average request duration for a specific path and method
        /// </summary>
        /// <param name="path">The request path</param>
        /// <param name="method">The HTTP method</param>
        /// <returns>The average duration in milliseconds</returns>
        double GetAverageRequestDuration(string path, string method);

        /// <summary>
        /// Gets the total number of requests for a specific path and method
        /// </summary>
        /// <param name="path">The request path</param>
        /// <param name="method">The HTTP method</param>
        /// <returns>The total number of requests</returns>
        long GetRequestCount(string path, string method);

        /// <summary>
        /// Gets the number of requests with a specific status code for a path and method
        /// </summary>
        /// <param name="path">The request path</param>
        /// <param name="method">The HTTP method</param>
        /// <param name="statusCode">The HTTP status code</param>
        /// <returns>The number of requests with the specified status code</returns>
        long GetRequestCountByStatusCode(string path, string method, int statusCode);

        /// <summary>
        /// Gets all metrics for all paths and methods
        /// </summary>
        /// <returns>A dictionary of metrics by path and method</returns>
        Dictionary<string, RequestMetrics> GetAllMetrics();
    }

    /// <summary>
    /// Metrics for a specific request path and method
    /// </summary>
    public class RequestMetrics
    {
        /// <summary>
        /// The request path
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// The HTTP method
        /// </summary>
        public string Method { get; set; }

        /// <summary>
        /// The total number of requests
        /// </summary>
        public long TotalRequests { get; set; }

        /// <summary>
        /// The average duration in milliseconds
        /// </summary>
        public double AverageDurationMs { get; set; }

        /// <summary>
        /// The minimum duration in milliseconds
        /// </summary>
        public long MinDurationMs { get; set; }

        /// <summary>
        /// The maximum duration in milliseconds
        /// </summary>
        public long MaxDurationMs { get; set; }

        /// <summary>
        /// The number of requests by status code
        /// </summary>
        public Dictionary<int, long> RequestsByStatusCode { get; set; } = new Dictionary<int, long>();
    }
}
