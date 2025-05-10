using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Operation filter to add authorization header to all endpoints that require it
    /// </summary>
    public class SwaggerAuthorizationOperationFilter : IOperationFilter
    {
        private readonly AppSettings _appSettings;

        public SwaggerAuthorizationOperationFilter(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // If authentication is disabled, don't add the authorization requirement
            if (!_appSettings.EnableAuthentication)
            {
                return;
            }

            // Check if the endpoint has [AllowAnonymous] attribute
            var allowAnonymous = context.MethodInfo.DeclaringType.GetCustomAttributes(true)
                .Union(context.MethodInfo.GetCustomAttributes(true))
                .OfType<AllowAnonymousAttribute>()
                .Any();

            if (allowAnonymous)
            {
                return;
            }

            // Check if the endpoint has [Authorize] attribute
            var hasAuthorize = context.MethodInfo.DeclaringType.GetCustomAttributes(true)
                .Union(context.MethodInfo.GetCustomAttributes(true))
                .OfType<AuthorizeAttribute>()
                .Any();

            // If the endpoint requires authorization, add the security requirement
            if (hasAuthorize)
            {
                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            Array.Empty<string>()
                        }
                    }
                };

                // Add a note about authentication
                operation.Description = string.IsNullOrEmpty(operation.Description)
                    ? "This endpoint requires authentication."
                    : $"{operation.Description}\n\nThis endpoint requires authentication.";
            }
        }
    }
}
