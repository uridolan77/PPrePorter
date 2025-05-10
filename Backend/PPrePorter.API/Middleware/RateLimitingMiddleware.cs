using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Configuration;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace PPrePorter.API.Middleware
{
    /// <summary>
    /// Middleware for implementing rate limiting on API requests
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingSettings _settings;

        public RateLimitingMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            ILogger<RateLimitingMiddleware> logger,
            IOptions<RateLimitingSettings> settings)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip rate limiting if it's disabled
            if (!_settings.Enabled)
            {
                await _next(context);
                return;
            }

            // Get client IP address
            var clientIp = GetClientIpAddress(context);
            var endpoint = context.Request.Path;
            var cacheKey = $"rate_limit_{clientIp}_{endpoint}";

            // Check if the client has exceeded the rate limit
            if (!_cache.TryGetValue(cacheKey, out RateLimitCounter counter))
            {
                counter = new RateLimitCounter
                {
                    Count = 1,
                    FirstRequest = DateTime.UtcNow,
                    LastRequest = DateTime.UtcNow
                };
            }
            else
            {
                // Check if the time window has elapsed
                var timeElapsed = DateTime.UtcNow - counter.FirstRequest;
                if (timeElapsed > TimeSpan.FromSeconds(_settings.WindowSeconds))
                {
                    // Reset the counter for a new time window
                    counter = new RateLimitCounter
                    {
                        Count = 1,
                        FirstRequest = DateTime.UtcNow,
                        LastRequest = DateTime.UtcNow
                    };
                }
                else
                {
                    // Increment the counter
                    counter.Count++;
                    counter.LastRequest = DateTime.UtcNow;
                }
            }

            // Store the updated counter
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(_settings.WindowSeconds * 2))
                .SetSize(1); // Set a small size for the counter object

            _cache.Set(cacheKey, counter, cacheOptions);

            // Check if the request limit has been exceeded
            if (counter.Count > _settings.MaxRequests)
            {
                _logger.LogWarning("Rate limit exceeded for IP: {ClientIp}, Endpoint: {Endpoint}", clientIp, endpoint);

                // Check if the response has already started
                if (context.Response.HasStarted)
                {
                    _logger.LogWarning("Response has already started, cannot apply rate limiting headers");
                    return;
                }

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    StatusCode = 429,
                    Message = "Too many requests. Please try again later.",
                    RetryAfter = _settings.WindowSeconds - (int)(DateTime.UtcNow - counter.FirstRequest).TotalSeconds
                };

                try
                {
                    // Add retry-after header
                    context.Response.Headers.Add("Retry-After", response.RetryAfter.ToString());

                    var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    await context.Response.WriteAsync(jsonResponse);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error writing rate limit response");
                }
                return;
            }

            // Continue with the request
            await _next(context);
        }

        private string GetClientIpAddress(HttpContext context)
        {
            // Try to get the IP from X-Forwarded-For header
            string ip = context.Request.Headers["X-Forwarded-For"].ToString();

            // If not available, use the remote IP address
            if (string.IsNullOrEmpty(ip))
            {
                ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            }

            return ip;
        }
    }

    /// <summary>
    /// Counter for tracking rate limit usage
    /// </summary>
    public class RateLimitCounter
    {
        public int Count { get; set; }
        public DateTime FirstRequest { get; set; }
        public DateTime LastRequest { get; set; }
    }
}
