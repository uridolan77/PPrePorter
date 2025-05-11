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
            // Create a single v1 document with all endpoints
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "PPrePorter API",
                Version = "v1",
                Description = "API for PPrePorter application",
                Contact = new OpenApiContact
                {
                    Name = "ProgressPlay Support",
                    Email = "support@progressplay.com"
                }
            });

            // Include all endpoints in the v1 document
            options.DocInclusionPredicate((docName, apiDesc) => true);
        }
    }
}
