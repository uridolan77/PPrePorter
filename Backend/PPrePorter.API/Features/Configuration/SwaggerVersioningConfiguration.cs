using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Configures the Swagger generation options for API versioning
    /// </summary>
    public class SwaggerVersioningConfiguration : IConfigureOptions<SwaggerGenOptions>
    {
        private readonly IApiVersionDescriptionProvider _provider;

        public SwaggerVersioningConfiguration(IApiVersionDescriptionProvider provider)
        {
            _provider = provider;
        }

        /// <summary>
        /// Configures the Swagger generation options
        /// </summary>
        public void Configure(SwaggerGenOptions options)
        {
            // Note: We don't need to add API version documents here
            // They are already added in Program.cs with SwaggerDoc calls

            // The custom groups are already configured in Program.cs
            // We don't need to do anything here
        }

        /// <summary>
        /// Creates the OpenAPI info for an API version
        /// </summary>
        private static OpenApiInfo CreateInfoForApiVersion(ApiVersionDescription description)
        {
            var info = new OpenApiInfo
            {
                Title = "PPrePorter API",
                Version = description.ApiVersion.ToString(),
                Description = "API for PPrePorter application",
                Contact = new OpenApiContact
                {
                    Name = "ProgressPlay Support",
                    Email = "support@progressplay.com"
                }
            };

            if (description.IsDeprecated)
            {
                info.Description += " This API version has been deprecated.";
            }

            return info;
        }
    }
}
