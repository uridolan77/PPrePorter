using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace PPrePorter.API.Features.Configuration
{
    /// <summary>
    /// Operation filter to set default values for parameters in Swagger
    /// </summary>
    public class SwaggerDefaultValueOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Set default values for parameters
            foreach (var parameter in operation.Parameters)
            {
                var description = context.ApiDescription.ParameterDescriptions
                    .FirstOrDefault(p => p.Name == parameter.Name);

                if (description == null)
                {
                    continue;
                }

                // Set default value for startDate parameter to yesterday
                if (parameter.Name.Equals("startDate", StringComparison.OrdinalIgnoreCase))
                {
                    var yesterday = DateTime.UtcNow.Date.AddDays(-1).ToString("yyyy-MM-dd");
                    parameter.Example = new OpenApiString(yesterday);
                    parameter.Description = $"{parameter.Description} (defaults to yesterday: {yesterday})";
                }
                
                // Set default value for endDate parameter to today
                if (parameter.Name.Equals("endDate", StringComparison.OrdinalIgnoreCase))
                {
                    var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
                    parameter.Example = new OpenApiString(today);
                    parameter.Description = $"{parameter.Description} (defaults to today: {today})";
                }
            }
        }
    }
}
