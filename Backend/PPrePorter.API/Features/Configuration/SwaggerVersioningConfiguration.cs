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
            // Add a swagger document for each discovered API version
            foreach (var description in _provider.ApiVersionDescriptions)
            {
                options.SwaggerDoc(
                    description.GroupName,
                    CreateInfoForApiVersion(description));
            }
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
