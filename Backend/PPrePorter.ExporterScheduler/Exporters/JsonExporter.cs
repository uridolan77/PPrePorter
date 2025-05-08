using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// JSON format exporter using Newtonsoft.Json
    /// </summary>
    public class JsonExporter : ExporterBase
    {
        private readonly ILogger<JsonExporter> _logger;
        private readonly JsonSerializerSettings _jsonSettings;

        public JsonExporter(ILogger<JsonExporter> logger)
        {
            _logger = logger;
            _jsonSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                DateFormatString = "yyyy-MM-dd HH:mm:ss",
                NullValueHandling = NullValueHandling.Include
            };
        }

        public override string ContentType => "application/json";
        public override string FileExtension => ".json";
        
        public override async Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters)
        {
            _logger.LogInformation("Starting JSON export for report {ReportName}", parameters.ReportName);
            
            var dataList = data.ToList();
            
            // Filter properties if specified
            if (parameters.SelectedColumns.Any() && dataList.Any())
            {
                dataList = dataList.Select(item => FilterProperties(item, parameters.SelectedColumns)).ToList();
            }
            
            // Create result object with metadata
            var result = new
            {
                metadata = new
                {
                    reportName = parameters.ReportName,
                    generatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    rowCount = dataList.Count,
                    filters = parameters.Filters,
                    groupBy = parameters.GroupBy,
                    sortBy = parameters.SortBy
                },
                data = dataList
            };
            
            // Serialize to JSON
            var json = JsonConvert.SerializeObject(result, _jsonSettings);
            
            _logger.LogInformation("Completed JSON export for report {ReportName} with {RowCount} rows", 
                parameters.ReportName, dataList.Count);
            
            return await Task.FromResult(Encoding.UTF8.GetBytes(json));
        }
        
        private dynamic FilterProperties(dynamic item, List<string> properties)
        {
            // Create a new object with only the selected properties
            var result = new ExpandoObject() as IDictionary<string, object>;
            var dictionary = (IDictionary<string, object>)item;
            
            foreach (var property in properties)
            {
                if (dictionary.TryGetValue(property, out var value))
                {
                    result[property] = value;
                }
            }
            
            return result;
        }
    }
}