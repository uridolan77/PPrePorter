using System.Collections.Concurrent;

namespace PPrePorter.API.Features.Monitoring
{
    /// <summary>
    /// Implementation of the metrics service
    /// </summary>
    public class MetricsService : IMetricsService
    {
        private readonly ILogger<MetricsService> _logger;
        private readonly ConcurrentDictionary<string, RequestMetricsInternal> _metrics = new();

        public MetricsService(ILogger<MetricsService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Records the duration of a request
        /// </summary>
        public void RecordRequestDuration(string path, string method, int statusCode, long durationMs)
        {
            var key = GetKey(path, method);
            var metrics = _metrics.GetOrAdd(key, _ => new RequestMetricsInternal
            {
                Path = path,
                Method = method
            });

            metrics.AddRequest(durationMs, statusCode);
            _logger.LogDebug("Recorded request: {Method} {Path}, Status: {StatusCode}, Duration: {DurationMs}ms", 
                method, path, statusCode, durationMs);
        }

        /// <summary>
        /// Gets the average request duration for a specific path and method
        /// </summary>
        public double GetAverageRequestDuration(string path, string method)
        {
            var key = GetKey(path, method);
            if (_metrics.TryGetValue(key, out var metrics))
            {
                return metrics.AverageDurationMs;
            }
            return 0;
        }

        /// <summary>
        /// Gets the total number of requests for a specific path and method
        /// </summary>
        public long GetRequestCount(string path, string method)
        {
            var key = GetKey(path, method);
            if (_metrics.TryGetValue(key, out var metrics))
            {
                return metrics.TotalRequests;
            }
            return 0;
        }

        /// <summary>
        /// Gets the number of requests with a specific status code for a path and method
        /// </summary>
        public long GetRequestCountByStatusCode(string path, string method, int statusCode)
        {
            var key = GetKey(path, method);
            if (_metrics.TryGetValue(key, out var metrics) && 
                metrics.RequestsByStatusCode.TryGetValue(statusCode, out var count))
            {
                return count;
            }
            return 0;
        }

        /// <summary>
        /// Gets all metrics for all paths and methods
        /// </summary>
        public Dictionary<string, RequestMetrics> GetAllMetrics()
        {
            var result = new Dictionary<string, RequestMetrics>();
            foreach (var kvp in _metrics)
            {
                var metrics = kvp.Value;
                result[kvp.Key] = new RequestMetrics
                {
                    Path = metrics.Path,
                    Method = metrics.Method,
                    TotalRequests = metrics.TotalRequests,
                    AverageDurationMs = metrics.AverageDurationMs,
                    MinDurationMs = metrics.MinDurationMs,
                    MaxDurationMs = metrics.MaxDurationMs,
                    RequestsByStatusCode = new Dictionary<int, long>(metrics.RequestsByStatusCode)
                };
            }
            return result;
        }

        /// <summary>
        /// Gets the key for a path and method
        /// </summary>
        private static string GetKey(string path, string method)
        {
            return $"{method}:{path}";
        }

        /// <summary>
        /// Internal class for storing metrics with thread-safe operations
        /// </summary>
        private class RequestMetricsInternal
        {
            private long _totalRequests;
            private long _totalDurationMs;
            private long _minDurationMs = long.MaxValue;
            private long _maxDurationMs;
            private readonly ConcurrentDictionary<int, long> _requestsByStatusCode = new();

            public string Path { get; set; }
            public string Method { get; set; }
            public long TotalRequests => _totalRequests;
            public double AverageDurationMs => _totalRequests > 0 ? (double)_totalDurationMs / _totalRequests : 0;
            public long MinDurationMs => _minDurationMs == long.MaxValue ? 0 : _minDurationMs;
            public long MaxDurationMs => _maxDurationMs;
            public Dictionary<int, long> RequestsByStatusCode => new(_requestsByStatusCode);

            public void AddRequest(long durationMs, int statusCode)
            {
                Interlocked.Increment(ref _totalRequests);
                Interlocked.Add(ref _totalDurationMs, durationMs);
                
                // Update min duration (thread-safe)
                long currentMin;
                do
                {
                    currentMin = _minDurationMs;
                    if (durationMs >= currentMin) break;
                } while (Interlocked.CompareExchange(ref _minDurationMs, durationMs, currentMin) != currentMin);
                
                // Update max duration (thread-safe)
                long currentMax;
                do
                {
                    currentMax = _maxDurationMs;
                    if (durationMs <= currentMax) break;
                } while (Interlocked.CompareExchange(ref _maxDurationMs, durationMs, currentMax) != currentMax);
                
                // Update status code count
                _requestsByStatusCode.AddOrUpdate(statusCode, 1, (_, count) => count + 1);
            }
        }
    }
}
