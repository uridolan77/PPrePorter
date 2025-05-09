using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// CSV format exporter using CsvHelper
    /// </summary>
    public class CsvExporter : ExporterBase
    {
        private readonly ILogger<CsvExporter> _logger;
        
        public CsvExporter(ILogger<CsvExporter> logger)
        {
            _logger = logger;
        }
        
        public override string ContentType => "text/csv";
        public override string FileExtension => ".csv";
        
        public override async Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters)
        {
            _logger.LogInformation("Starting CSV export for report {ReportName}", parameters.ReportName);
            
            var dataList = data.ToList();
            if (!dataList.Any())
            {
                _logger.LogWarning("No data to export for report {ReportName}", parameters.ReportName);
                return new byte[] { };
            }
            
            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream);
              // Configure CSV writer settings
            var csvConfig = new CsvConfiguration(CultureInfo.GetCultureInfo(parameters.Locale))
            {
                HasHeaderRecord = parameters.IncludeHeaders,
                Delimiter = ",",
                ShouldQuote = field => true // Quote all fields
            };
            
            using var csv = new CsvWriter(writer, csvConfig);
            
            // Get properties to export
            var properties = parameters.SelectedColumns.Any() 
                ? parameters.SelectedColumns 
                : GetDynamicProperties(dataList.First());
            
            // Write headers if enabled
            if (parameters.IncludeHeaders)
            {
                foreach (var property in properties)
                {
                    csv.WriteField(property);
                }
                csv.NextRecord();
            }
            
            // Write data rows
            foreach (var item in dataList)
            {
                foreach (var property in properties)
                {
                    var value = GetPropertyValue(item, property);
                    csv.WriteField(FormatValue(value, parameters.Locale));
                }
                csv.NextRecord();
            }
            
            await writer.FlushAsync();
            
            _logger.LogInformation("Completed CSV export for report {ReportName} with {RowCount} rows", 
                parameters.ReportName, dataList.Count);
            
            return memoryStream.ToArray();
        }
        
        private string FormatValue(object value, string locale)
        {
            if (value == null)
            {
                return string.Empty;
            }
            
            var cultureInfo = CultureInfo.GetCultureInfo(locale);
            
            // Format based on value type
            return value switch
            {
                DateTime dateTime => dateTime.ToString("yyyy-MM-dd HH:mm:ss", cultureInfo),
                DateTimeOffset dateTimeOffset => dateTimeOffset.ToString("yyyy-MM-dd HH:mm:ss", cultureInfo),
                decimal decimalValue => decimalValue.ToString("N2", cultureInfo),
                double doubleValue => doubleValue.ToString("N2", cultureInfo),
                float floatValue => floatValue.ToString("N2", cultureInfo),
                bool boolValue => boolValue ? "True" : "False",
                _ => value.ToString()
            };
        }
    }
}