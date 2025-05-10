using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Exceptions;

namespace PPrePorter.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Check if the response has already started
            if (context.Response.HasStarted)
            {
                // If the response has already started, we can't modify the status code or headers
                // Just log the error and return
                return;
            }

            context.Response.ContentType = "application/json";

            var response = new ApiErrorResponse
            {
                TraceId = context.TraceIdentifier
            };

            // For now, handle all exceptions the same way
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            response.StatusCode = context.Response.StatusCode;
            response.Message = "An unexpected error occurred. Our team has been notified.";
            #if DEBUG
            response.DetailedMessage = exception.Message;
            response.StackTrace = exception.StackTrace;
            #endif

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }

    public class ApiErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string DetailedMessage { get; set; }
        public string TraceId { get; set; }
        public object ValidationErrors { get; set; }
        public string StackTrace { get; set; }
    }
}