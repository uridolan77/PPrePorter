using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Exporters;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Service for coordinating the export process of reports
    /// </summary>
    public class ExportService
    {
        private readonly ExporterFactory _exporterFactory;
        private readonly IReportDataService _reportDataService;
        private readonly ILogger<ExportService> _logger;
        
        /// <summary>
        /// Initializes a new instance of the ExportService class
        /// </summary>
        /// <param name="exporterFactory">Factory for creating exporters based on the requested format</param>
        /// <param name="reportDataService">Service for retrieving report data</param>
        /// <param name="logger">Logger for the export service</param>
        public ExportService(
            ExporterFactory exporterFactory, 
            IReportDataService reportDataService,
            ILogger<ExportService> logger)
        {
            _exporterFactory = exporterFactory;
            _reportDataService = reportDataService;
            _logger = logger;
        }
        
        /// <summary>
        /// Exports a report with the specified parameters and returns the resulting data, content type, and filename
        /// </summary>
        public async Task<(byte[] Data, string ContentType, string FileName)> ExportReportAsync(
            string reportName, 
            ExportParameters parameters)
        {
            _logger.LogInformation("Starting export process for report {ReportName} in {Format} format", 
                reportName, parameters.Format);
            
            // Get the appropriate exporter
            var exporter = _exporterFactory.CreateExporter(parameters.Format);
            
            // Fetch report data
            var data = await _reportDataService.GetReportDataAsync(
                reportName, 
                parameters.Filters, 
                parameters.GroupBy, 
                parameters.SortBy);
            
            // Export data to the specified format
            var exportedData = await exporter.ExportAsync(data, parameters);
            
            // Generate filename
            var fileName = $"{reportName}_{DateTime.Now:yyyyMMdd_HHmmss}{exporter.FileExtension}";
            
            _logger.LogInformation("Export completed for report {ReportName} - size: {Size} bytes", 
                reportName, exportedData.Length);
            
            return (exportedData, exporter.ContentType, fileName);
        }
    }
}