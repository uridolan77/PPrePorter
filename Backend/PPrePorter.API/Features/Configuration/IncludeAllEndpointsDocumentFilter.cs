using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Document filter to include all endpoints in the v1 document
    /// </summary>
    public class IncludeAllEndpointsDocumentFilter : IDocumentFilter
    {
        /// <summary>
        /// Applies the filter to the specified document
        /// </summary>
        /// <param name="swaggerDoc">The swagger document to apply the filter to</param>
        /// <param name="context">The document filter context</param>
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            // Only apply to the v1 document
            if (swaggerDoc.Info.Version != "v1")
            {
                return;
            }

            // Get all paths from all documents
            var paths = new Dictionary<string, OpenApiPathItem>();

            // Get all documents from the context
            var allDocuments = context.SchemaRepository.Schemas
                .Select(s => s.Key)
                .Where(k => k.Contains('/'))
                .Select(k => k.Split('/')[0])
                .Distinct()
                .ToList();

            // Add all paths from all documents to the v1 document
            foreach (var path in context.ApiDescriptions)
            {
                var key = path.RelativePath;

                if (key == null)
                {
                    continue;
                }

                // Add the path to the v1 document
                if (!swaggerDoc.Paths.ContainsKey("/" + key))
                {
                    // Create a new path item for the endpoint
                    var pathItem = new OpenApiPathItem();

                    // Add the path to the document
                    swaggerDoc.Paths.Add("/" + key, pathItem);
                }
            }
        }
    }
}
