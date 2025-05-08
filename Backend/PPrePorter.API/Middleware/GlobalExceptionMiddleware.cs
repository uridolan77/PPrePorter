using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

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
            context.Response.ContentType = "application/json";
            
            var response = new ApiErrorResponse
            {
                TraceId = context.TraceIdentifier
            };

            switch (exception)
            {
                case DbDataAccessException dbEx:
                    context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                    response.StatusCode = context.Response.StatusCode;
                    response.Message = "Database service is currently unavailable. Please try again later.";
                    response.DetailedMessage = dbEx.Message;
                    break;

                case ResourceNotFoundException notFoundEx:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.StatusCode = context.Response.StatusCode;
                    response.Message = "The requested resource was not found.";
                    response.DetailedMessage = notFoundEx.Message;
                    break;

                case ValidationException validationEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.StatusCode = context.Response.StatusCode;
                    response.Message = "The request contains invalid data.";
                    response.DetailedMessage = validationEx.Message;
                    response.ValidationErrors = validationEx.Errors;
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    response.StatusCode = context.Response.StatusCode;
                    response.Message = "You don't have permission to access this resource.";
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.StatusCode = context.Response.StatusCode;
                    response.Message = "An unexpected error occurred. Our team has been notified.";
                    #if DEBUG
                    response.DetailedMessage = exception.Message;
                    response.StackTrace = exception.StackTrace;
                    #endif
                    break;
            }

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