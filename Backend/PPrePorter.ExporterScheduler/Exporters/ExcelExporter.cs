using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// Excel format exporter using EPPlus
    /// </summary>
    public class ExcelExporter : ExporterBase
    {
        private readonly ILogger<ExcelExporter> _logger;

        public ExcelExporter(ILogger<ExcelExporter> logger)
        {
            _logger = logger;
        }

        public override string ContentType => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        public override string FileExtension => ".xlsx";
        
        public override async Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters)
        {
            _logger.LogInformation("Starting Excel export for report {ReportName}", parameters.ReportName);
            
            // Use EPPlus for Excel generation
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add(parameters.ReportName);
            
            var dataList = data.ToList();
            if (!dataList.Any())
            {
                _logger.LogWarning("No data to export for report {ReportName}", parameters.ReportName);
                worksheet.Cells["A1"].Value = "No data available";
                return package.GetAsByteArray();
            }
            
            // Get properties to export
            var properties = parameters.SelectedColumns.Any() 
                ? parameters.SelectedColumns 
                : GetDynamicProperties(dataList.First());
            
            // Create headers
            if (parameters.IncludeHeaders)
            {
                for (int i = 0; i < properties.Count; i++)
                {
                    worksheet.Cells[1, i + 1].Value = properties[i];
                    worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }
            }
            
            // Add data
            int row = parameters.IncludeHeaders ? 2 : 1;
            foreach (var item in dataList)
            {
                for (int i = 0; i < properties.Count; i++)
                {
                    var value = GetPropertyValue(item, properties[i]);
                    worksheet.Cells[row, i + 1].Value = value;
                    
                    // Format dates
                    if (value is DateTime)
                    {
                        worksheet.Cells[row, i + 1].Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                    }
                    // Format numbers
                    else if (value is decimal || value is double || value is float)
                    {
                        worksheet.Cells[row, i + 1].Style.Numberformat.Format = "#,##0.00";
                    }
                }
                row++;
            }
            
            // Format as table
            var tableRange = worksheet.Cells[1, 1, row - 1, properties.Count];
            var table = worksheet.Tables.Add(tableRange, parameters.ReportName.Replace(" ", ""));
            table.ShowHeader = parameters.IncludeHeaders;
            
            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();
            
            // Add title and metadata
            worksheet.HeaderFooter.OddHeader.CenteredText = parameters.ReportName;
            worksheet.HeaderFooter.OddFooter.RightAlignedText = $"Generated: {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}";
            
            _logger.LogInformation("Completed Excel export for report {ReportName} with {RowCount} rows", 
                parameters.ReportName, dataList.Count);
            
            return await Task.FromResult(package.GetAsByteArray());
        }
    }
}