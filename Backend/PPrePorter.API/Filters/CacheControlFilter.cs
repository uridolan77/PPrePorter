using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using PPrePorter.API.Features.Configuration;

namespace PPrePorter.API.Filters
{
    /// <summary>
    /// Filter to add cache control headers to responses
    /// </summary>
    public class CacheControlFilter : IActionFilter
    {
        private readonly CacheSettings _cacheSettings;

        public CacheControlFilter(IOptions<CacheSettings> cacheSettings)
        {
            _cacheSettings = cacheSettings.Value;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            // No action needed before execution
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Only apply to successful responses
            if (context.Result is ObjectResult objectResult && objectResult.StatusCode >= 200 && objectResult.StatusCode < 300)
            {
                // Check if the action has a ResponseCache attribute
                var responseCacheAttribute = context.ActionDescriptor.FilterDescriptors
                    .Select(fd => fd.Filter)
                    .OfType<ResponseCacheAttribute>()
                    .FirstOrDefault();

                if (responseCacheAttribute != null)
                {
                    // Get the cache duration from the attribute or use the default
                    int duration = responseCacheAttribute.Duration > 0 
                        ? responseCacheAttribute.Duration 
                        : _cacheSettings.DefaultResponseCacheDurationSeconds;

                    // Add Cache-Control header
                    context.HttpContext.Response.Headers.CacheControl = $"public, max-age={duration}";
                    
                    // Add Expires header
                    var expiresDate = DateTime.UtcNow.AddSeconds(duration);
                    context.HttpContext.Response.Headers.Expires = expiresDate.ToString("R");
                    
                    // Add Vary header if specified
                    if (!string.IsNullOrEmpty(responseCacheAttribute.VaryByHeader))
                    {
                        context.HttpContext.Response.Headers.Vary = responseCacheAttribute.VaryByHeader;
                    }
                    
                    // Add debug headers
                    context.HttpContext.Response.Headers["X-Cache-Enabled"] = "true";
                    context.HttpContext.Response.Headers["X-Cache-Duration"] = duration.ToString();
                }
            }
        }
    }
}
