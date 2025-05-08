using System;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// Factory for creating exporters based on the requested format
    /// </summary>
    public class ExporterFactory
    {
        private readonly IServiceProvider _serviceProvider;
        
        public ExporterFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        /// <summary>
        /// Creates an exporter for the specified format
        /// </summary>
        public IExporter CreateExporter(ExportFormat format)
        {
            return format switch
            {
                ExportFormat.Excel => _serviceProvider.GetRequiredService<ExcelExporter>(),
                ExportFormat.PDF => _serviceProvider.GetRequiredService<PdfExporter>(),
                ExportFormat.CSV => _serviceProvider.GetRequiredService<CsvExporter>(),
                ExportFormat.JSON => _serviceProvider.GetRequiredService<JsonExporter>(),
                _ => throw new ArgumentException($"Unsupported export format: {format}")
            };
        }
    }
}