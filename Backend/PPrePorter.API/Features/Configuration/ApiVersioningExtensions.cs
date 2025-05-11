using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.Mvc.Versioning.Conventions;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Extensions for configuring API versioning
    /// </summary>
    public static class ApiVersioningExtensions
    {
        /// <summary>
        /// Adds API versioning to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection</returns>
        public static IServiceCollection AddApiVersioningConfiguration(this IServiceCollection services)
        {
            // Add API versioning
            services.AddApiVersioning(options =>
            {
                // Specify the default API version
                options.DefaultApiVersion = new ApiVersion(1, 0);

                // Assume the default API version when a version is not specified
                options.AssumeDefaultVersionWhenUnspecified = true;

                // Report the API version in the response header
                options.ReportApiVersions = true;

                // Use multiple ways to read the API version (header, query string, media type)
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new HeaderApiVersionReader("X-Api-Version"),
                    new QueryStringApiVersionReader("api-version"),
                    new MediaTypeApiVersionReader("v"));

                // Configure conventions
                options.Conventions.Add(new VersionByNamespaceConvention());
            });

            // Add API version explorer
            services.AddVersionedApiExplorer(options =>
            {
                // Format the version as "v'major[.minor][-status]"
                options.GroupNameFormat = "'v'VVV";

                // Substitute the version in the controller route
                options.SubstituteApiVersionInUrl = true;

                // Assume the default API version when unspecified
                options.AssumeDefaultVersionWhenUnspecified = true;
            });

            return services;
        }
    }
}
