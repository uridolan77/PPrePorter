using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.API.Features.Reports.Models;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Models.Reports;
using System.Text.Json;
using System.IO;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace PPrePorter.Infrastructure.Services
{
    public class ReportService : IReportService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<ReportService> _logger;
        private readonly string _exportDirectory;

        public ReportService(
            IPPRePorterDbContext dbContext,
            IUserContextService userContextService,
            ILogger<ReportService> logger)
        {
            _dbContext = dbContext;
            _userContextService = userContextService;
            _logger = logger;
            
            // Set export directory
            _exportDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ReportExports");
            if (!Directory.Exists(_exportDirectory))
            {
                Directory.CreateDirectory(_exportDirectory);
            }
        }

        public async Task<ReportResultDto> GenerateReportAsync(ReportRequestDto request, string userId)
        {
            try
            {
                _logger.LogInformation("Generating report for user {UserId} with template {TemplateId}", userId, request.TemplateId);
                
                // Create report record
                var report = new GeneratedReport
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    TemplateId = request.TemplateId,
                    Status = "Processing",
                    CreatedAt = DateTime.UtcNow,
                    RequestJson = JsonSerializer.Serialize(request)
                };
                
                _dbContext.GeneratedReports.Add(report);
                await _dbContext.SaveChangesAsync();
                
                try
                {
                    // Get template
                    var template = await _dbContext.ReportTemplates
                        .FirstOrDefaultAsync(t => t.Id == request.TemplateId);
                    
                    if (template == null)
                    {
                        throw new Exception($"Report template with ID {request.TemplateId} not found");
                    }
                    
                    report.Name = $"{template.Name} - {DateTime.UtcNow:yyyy-MM-dd HH:mm}";
                    
                    // Fetch template details
                    var columns = template.AvailableColumns;
                    
                    // Validate selected columns
                    foreach (var column in request.SelectedColumns)
                    {
                        if (!columns.Contains(column))
                        {
                            throw new Exception($"Invalid column selection: {column}");
                        }
                    }
                    
                    // Apply selected columns or use all available
                    var selectedColumns = request.SelectedColumns.Any() 
                        ? request.SelectedColumns 
                        : columns;
                    
                    // Prepare dynamic SQL based on template and filters
                    var (data, columnMetadata) = await ExecuteReportQueryAsync(template, request);
                    
                    // Update report
                    report.Status = "Completed";
                    report.CompletedAt = DateTime.UtcNow;
                    report.TotalRows = data.Count;
                    report.Data = data;
                    report.Columns = columnMetadata;
                    
                    await _dbContext.SaveChangesAsync();
                    
                    // Map to response DTO
                    var pageSize = request.PageSize ?? 100;
                    var pageNumber = request.PageNumber ?? 1;
                    var totalPages = (int)Math.Ceiling((double)report.TotalRows / pageSize);
                    
                    var result = new ReportResultDto
                    {
                        ReportId = report.Id,
                        Name = report.Name,
                        Status = report.Status,
                        CreatedAt = report.CreatedAt,
                        CompletedAt = report.CompletedAt,
                        TotalRows = report.TotalRows,
                        TotalPages = totalPages,
                        CurrentPage = pageNumber,
                        Data = data
                            .Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .ToList(),
                        Columns = columnMetadata.Select(c => new ColumnMetadataDto
                        {
                            Name = c.Name,
                            DisplayName = c.DisplayName,
                            DataType = c.DataType,
                            Format = c.Format,
                            IsNumeric = c.IsNumeric,
                            IsDate = c.IsDate,
                            IsGrouped = c.IsGrouped,
                            IsAggregated = c.IsAggregated,
                            AggregateFunction = c.AggregateFunction
                        }).ToList()
                    };
                    
                    _logger.LogInformation("Report {ReportId} generated successfully with {RowCount} rows", report.Id, report.TotalRows);
                    
                    return result;
                }
                catch (Exception ex)
                {
                    // Update report with error
                    report.Status = "Failed";
                    report.ErrorMessage = ex.Message;
                    report.CompletedAt = DateTime.UtcNow;
                    
                    await _dbContext.SaveChangesAsync();
                    
                    _logger.LogError(ex, "Error generating report for user {UserId}", userId);
                    
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                throw;
            }
        }

        public async Task<ReportResultDto> GetReportAsync(string reportId, string userId)
        {
            try
            {
                var report = await _dbContext.GeneratedReports
                    .FirstOrDefaultAsync(r => r.Id == reportId && r.UserId == userId);
                
                if (report == null)
                {
                    return null;
                }
                
                // Deserialize stored data
                var request = JsonSerializer.Deserialize<ReportRequestDto>(report.RequestJson);
                
                // Regenerate data if needed (or load from cache/storage in a real implementation)
                if (report.Status == "Completed" && report.Data == null)
                {
                    var template = await _dbContext.ReportTemplates
                        .FirstOrDefaultAsync(t => t.Id == report.TemplateId);
                    
                    var (data, columnMetadata) = await ExecuteReportQueryAsync(template, request);
                    report.Data = data;
                    report.Columns = columnMetadata;
                }
                
                // Map to DTO
                var pageSize = request.PageSize ?? 100;
                var pageNumber = request.PageNumber ?? 1;
                var totalPages = (int)Math.Ceiling((double)report.TotalRows / pageSize);
                
                return new ReportResultDto
                {
                    ReportId = report.Id,
                    Name = report.Name,
                    Status = report.Status,
                    CreatedAt = report.CreatedAt,
                    CompletedAt = report.CompletedAt,
                    TotalRows = report.TotalRows,
                    TotalPages = totalPages,
                    CurrentPage = pageNumber,
                    Data = report.Data?
                        .Skip((pageNumber - 1) * pageSize)
                        .Take(pageSize)
                        .ToList(),
                    Columns = report.Columns?.Select(c => new ColumnMetadataDto
                    {
                        Name = c.Name,
                        DisplayName = c.DisplayName,
                        DataType = c.DataType,
                        Format = c.Format,
                        IsNumeric = c.IsNumeric,
                        IsDate = c.IsDate,
                        IsGrouped = c.IsGrouped,
                        IsAggregated = c.IsAggregated,
                        AggregateFunction = c.AggregateFunction
                    }).ToList(),
                    ErrorMessage = report.ErrorMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report {ReportId}", reportId);
                throw;
            }
        }

        public async Task<ExportResultDto> ExportReportAsync(string reportId, string format, User user)
        {
            try
            {
                var report = await _dbContext.GeneratedReports
                    .FirstOrDefaultAsync(r => r.Id == reportId && r.UserId == user.Id);
                
                if (report == null)
                {
                    return null;
                }
                
                // Check if already exported
                var existingExport = await _dbContext.ReportExports
                    .FirstOrDefaultAsync(e => e.ReportId == reportId && e.Format == format && e.ExpiresAt > DateTime.UtcNow);
                
                if (existingExport != null)
                {
                    return new ExportResultDto
                    {
                        FileUrl = $"/api/reports/download/{existingExport.Id}",
                        FileName = existingExport.FileName,
                        Format = existingExport.Format,
                        FileSizeBytes = existingExport.FileSizeBytes,
                        ExpiresAt = existingExport.ExpiresAt
                    };
                }
                
                // Deserialize stored data
                var request = JsonSerializer.Deserialize<ReportRequestDto>(report.RequestJson);
                
                // Regenerate data if needed
                if (report.Status == "Completed" && report.Data == null)
                {
                    var template = await _dbContext.ReportTemplates
                        .FirstOrDefaultAsync(t => t.Id == report.TemplateId);
                    
                    var (data, columnMetadata) = await ExecuteReportQueryAsync(template, request);
                    report.Data = data;
                    report.Columns = columnMetadata;
                }
                
                if (report.Data == null || !report.Data.Any())
                {
                    throw new Exception("No data available for export");
                }
                
                // Generate file based on format
                var fileName = $"{report.Name.Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMdd_HHmmss}";
                var filePath = "";
                long fileSize = 0;
                
                switch (format.ToLower())
                {
                    case "excel":
                        fileName += ".xlsx";
                        filePath = Path.Combine(_exportDirectory, fileName);
                        fileSize = ExportToExcel(report, filePath);
                        break;
                    
                    case "csv":
                        fileName += ".csv";
                        filePath = Path.Combine(_exportDirectory, fileName);
                        fileSize = ExportToCsv(report, filePath);
                        break;
                    
                    case "pdf":
                        fileName += ".pdf";
                        filePath = Path.Combine(_exportDirectory, fileName);
                        fileSize = ExportToPdf(report, filePath);
                        break;
                    
                    default:
                        throw new Exception($"Unsupported export format: {format}");
                }
                
                // Save export record
                var expiresAt = DateTime.UtcNow.AddDays(7); // Files expire after 7 days
                var export = new ReportExport
                {
                    Id = Guid.NewGuid().ToString(),
                    ReportId = reportId,
                    UserId = user.Id,
                    Format = format,
                    FilePath = filePath,
                    FileName = fileName,
                    FileSizeBytes = fileSize,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt
                };
                
                _dbContext.ReportExports.Add(export);
                await _dbContext.SaveChangesAsync();
                
                return new ExportResultDto
                {
                    FileUrl = $"/api/reports/download/{export.Id}",
                    FileName = export.FileName,
                    Format = export.Format,
                    FileSizeBytes = export.FileSizeBytes,
                    ExpiresAt = export.ExpiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report {ReportId} to {Format}", reportId, format);
                throw;
            }
        }

        public async Task<List<GeneratedReport>> GetRecentReportsAsync(string userId, int limit = 10)
        {
            try
            {
                return await _dbContext.GeneratedReports
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent reports for user {UserId}", userId);
                throw;
            }
        }

        #region Helper Methods

        private async Task<(List<Dictionary<string, object>> Data, List<ColumnMetadata> Columns)> ExecuteReportQueryAsync(
            ReportTemplate template, 
            ReportRequestDto request)
        {
            // This method would normally generate and execute a SQL query based on the template and request
            // For this implementation, we'll use a simulated data source
            
            // Simulate report data based on template
            var data = await GenerateSimulatedDataAsync(template, request);
            
            // Create column metadata
            var columnMetadata = template.AvailableColumns
                .Where(c => request.SelectedColumns.Count == 0 || request.SelectedColumns.Contains(c))
                .Select(c => new ColumnMetadata
                {
                    Name = c,
                    DisplayName = FormatColumnName(c),
                    DataType = DetermineDataType(c),
                    Format = GetDefaultFormat(c),
                    IsNumeric = IsNumericColumn(c),
                    IsDate = IsDateColumn(c),
                    IsGrouped = request.Groupings.Any(g => g.Field == c),
                    IsAggregated = request.Groupings.Any(g => g.Function != null && g.Field == c),
                    AggregateFunction = request.Groupings.FirstOrDefault(g => g.Field == c)?.Function
                })
                .ToList();
            
            return (data, columnMetadata);
        }

        private async Task<List<Dictionary<string, object>>> GenerateSimulatedDataAsync(
            ReportTemplate template, 
            ReportRequestDto request)
        {
            // Simulated data generation based on template type
            // In a real implementation, this would execute database queries
            
            var result = new List<Dictionary<string, object>>();
            var random = new Random();
            
            // Determine number of rows based on template
            var rowCount = 1000; // Default row count
            
            // Generate simulated data
            for (int i = 0; i < rowCount; i++)
            {
                var row = new Dictionary<string, object>();
                
                // Add columns based on template
                foreach (var column in template.AvailableColumns)
                {
                    if (request.SelectedColumns.Count == 0 || request.SelectedColumns.Contains(column))
                    {
                        row[column] = GenerateValueForColumn(column, random);
                    }
                }
                
                result.Add(row);
            }
            
            // Apply filters
            foreach (var filter in request.Filters)
            {
                result = ApplyFilter(result, filter);
            }
            
            // Apply grouping
            if (request.Groupings.Any())
            {
                result = ApplyGrouping(result, request.Groupings);
            }
            
            // Apply sorting
            if (request.SortBy.Any())
            {
                result = ApplySorting(result, request.SortBy);
            }
            
            return result;
        }

        private object GenerateValueForColumn(string column, Random random)
        {
            // Generate example values based on column name
            if (IsDateColumn(column))
            {
                return DateTime.UtcNow.AddDays(-random.Next(1, 365));
            }
            else if (IsNumericColumn(column))
            {
                if (column.Contains("Amount") || column.Contains("Value"))
                {
                    return Math.Round(random.NextDouble() * 10000, 2);
                }
                else
                {
                    return random.Next(1, 1000);
                }
            }
            else if (column.Contains("Name") || column.Contains("Title"))
            {
                var names = new[] { "Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry" };
                return names[random.Next(names.Length)];
            }
            else if (column.Contains("Status"))
            {
                var statuses = new[] { "Active", "Inactive", "Pending", "Completed", "Rejected" };
                return statuses[random.Next(statuses.Length)];
            }
            else if (column.Contains("Type") || column.Contains("Category"))
            {
                var types = new[] { "Type A", "Type B", "Type C", "Type D", "Type E" };
                return types[random.Next(types.Length)];
            }
            else
            {
                return $"Value-{random.Next(1, 1000)}";
            }
        }

        private List<Dictionary<string, object>> ApplyFilter(
            List<Dictionary<string, object>> data, 
            FilterCriteriaDto filter)
        {
            return data.Where(row =>
            {
                if (!row.ContainsKey(filter.Field))
                {
                    return true;
                }
                
                var value = row[filter.Field];
                
                switch (filter.Operator)
                {
                    case "equals":
                        if (value is DateTime dateVal && filter.DateValue.HasValue)
                        {
                            return dateVal.Date == filter.DateValue.Value.Date;
                        }
                        return value?.ToString() == filter.Value;
                    
                    case "notEquals":
                        return value?.ToString() != filter.Value;
                    
                    case "contains":
                        return value?.ToString().Contains(filter.Value, StringComparison.OrdinalIgnoreCase) == true;
                    
                    case "greaterThan":
                        if (value is double dblVal && double.TryParse(filter.Value, out double compareVal))
                        {
                            return dblVal > compareVal;
                        }
                        else if (value is int intVal && int.TryParse(filter.Value, out int compareIntVal))
                        {
                            return intVal > compareIntVal;
                        }
                        else if (value is DateTime dateTimeVal && filter.DateValue.HasValue)
                        {
                            return dateTimeVal > filter.DateValue.Value;
                        }
                        return false;
                    
                    case "lessThan":
                        if (value is double dblVal2 && double.TryParse(filter.Value, out double compareVal2))
                        {
                            return dblVal2 < compareVal2;
                        }
                        else if (value is int intVal2 && int.TryParse(filter.Value, out int compareIntVal2))
                        {
                            return intVal2 < compareIntVal2;
                        }
                        else if (value is DateTime dateTimeVal2 && filter.DateValue.HasValue)
                        {
                            return dateTimeVal2 < filter.DateValue.Value;
                        }
                        return false;
                    
                    case "in":
                        return filter.Values.Contains(value?.ToString());
                    
                    case "between":
                        if (value is double dblVal3 && double.TryParse(filter.Value, out double start) && 
                            double.TryParse(filter.Values.FirstOrDefault(), out double end))
                        {
                            return dblVal3 >= start && dblVal3 <= end;
                        }
                        else if (value is DateTime dateTimeVal3 && filter.DateValue.HasValue && filter.DateEnd.HasValue)
                        {
                            return dateTimeVal3 >= filter.DateValue.Value && dateTimeVal3 <= filter.DateEnd.Value;
                        }
                        return false;
                    
                    default:
                        return true;
                }
            }).ToList();
        }

        private List<Dictionary<string, object>> ApplyGrouping(
            List<Dictionary<string, object>> data, 
            List<GroupingDto> groupings)
        {
            // For simplicity, just return the original data
            // In a real implementation, this would perform grouping operations
            return data;
        }

        private List<Dictionary<string, object>> ApplySorting(
            List<Dictionary<string, object>> data, 
            List<SortingDto> sortBy)
        {
            // Apply sorting based on the first sort field (for simplicity)
            if (sortBy.Any())
            {
                var firstSort = sortBy.First();
                
                if (firstSort.Descending)
                {
                    data = data.OrderByDescending(row => row.ContainsKey(firstSort.Field) ? row[firstSort.Field] : null).ToList();
                }
                else
                {
                    data = data.OrderBy(row => row.ContainsKey(firstSort.Field) ? row[firstSort.Field] : null).ToList();
                }
            }
            
            return data;
        }

        private bool IsNumericColumn(string column)
        {
            return column.Contains("Count") || column.Contains("Amount") || column.Contains("Value") || 
                   column.Contains("Number") || column.Contains("Id") || column.Contains("Quantity") ||
                   column.Contains("Total") || column.Contains("Sum") || column.Contains("Average");
        }

        private bool IsDateColumn(string column)
        {
            return column.Contains("Date") || column.Contains("Time") || column.Contains("Created") || 
                   column.Contains("Updated") || column.Contains("Modified") || column.Contains("Timestamp") ||
                   column.Contains("Birthday") || column.Contains("Anniversary");
        }

        private string DetermineDataType(string column)
        {
            if (IsDateColumn(column))
            {
                return "date";
            }
            else if (IsNumericColumn(column))
            {
                if (column.Contains("Amount") || column.Contains("Value") || column.Contains("Price") || 
                    column.Contains("Total") || column.Contains("Sum") || column.Contains("Average"))
                {
                    return "number";
                }
                else
                {
                    return "integer";
                }
            }
            else
            {
                return "string";
            }
        }

        private string GetDefaultFormat(string column)
        {
            if (IsDateColumn(column))
            {
                return "yyyy-MM-dd";
            }
            else if (IsNumericColumn(column))
            {
                if (column.Contains("Amount") || column.Contains("Value") || column.Contains("Price") || 
                    column.Contains("Total") || column.Contains("Sum") || column.Contains("Average"))
                {
                    return "C2";
                }
                else
                {
                    return "N0";
                }
            }
            
            return null;
        }

        private string FormatColumnName(string column)
        {
            // Split by camel case and capitalize each word
            var words = System.Text.RegularExpressions.Regex.Replace(
                column,
                "([A-Z])",
                " $1"
            ).Trim().Split(' ');
            
            return string.Join(" ", words.Select(w => w.Length > 0 ? char.ToUpper(w[0]) + w.Substring(1) : ""));
        }

        private long ExportToExcel(GeneratedReport report, string filePath)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            
            using (var package = new ExcelPackage())
            {
                // Add a new worksheet to the workbook
                var worksheet = package.Workbook.Worksheets.Add("Report");
                
                // Create headers
                for (int i = 0; i < report.Columns.Count; i++)
                {
                    worksheet.Cells[1, i + 1].Value = report.Columns[i].DisplayName;
                    
                    // Format header
                    worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    worksheet.Cells[1, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }
                
                // Add data
                for (int rowIndex = 0; rowIndex < report.Data.Count; rowIndex++)
                {
                    var dataRow = report.Data[rowIndex];
                    
                    for (int colIndex = 0; colIndex < report.Columns.Count; colIndex++)
                    {
                        var column = report.Columns[colIndex];
                        var value = dataRow.ContainsKey(column.Name) ? dataRow[column.Name] : null;
                        
                        worksheet.Cells[rowIndex + 2, colIndex + 1].Value = value;
                        
                        // Apply formatting based on data type
                        if (column.IsNumeric)
                        {
                            worksheet.Cells[rowIndex + 2, colIndex + 1].Style.Numberformat.Format = 
                                column.Format ?? "#,##0.00";
                        }
                        else if (column.IsDate && value is DateTime)
                        {
                            worksheet.Cells[rowIndex + 2, colIndex + 1].Style.Numberformat.Format = 
                                column.Format ?? "yyyy-mm-dd";
                        }
                    }
                }
                
                // Autofit columns
                worksheet.Cells.AutoFitColumns();
                
                // Save file
                package.SaveAs(new FileInfo(filePath));
                
                return new FileInfo(filePath).Length;
            }
        }

        private long ExportToCsv(GeneratedReport report, string filePath)
        {
            using (var writer = new StreamWriter(filePath))
            {
                // Write headers
                var headerRow = string.Join(",", report.Columns.Select(c => $"\"{c.DisplayName}\""));
                writer.WriteLine(headerRow);
                
                // Write data
                foreach (var dataRow in report.Data)
                {
                    var row = string.Join(",", report.Columns.Select(column => 
                    {
                        var value = dataRow.ContainsKey(column.Name) ? dataRow[column.Name] : null;
                        if (value == null)
                        {
                            return "\"\"";
                        }
                        else if (value is string)
                        {
                            return $"\"{value.ToString().Replace("\"", "\"\"")}\"";
                        }
                        else if (value is DateTime dateValue)
                        {
                            return $"\"{dateValue.ToString(column.Format ?? "yyyy-MM-dd")}\"";
                        }
                        else
                        {
                            return $"\"{value}\"";
                        }
                    }));
                    
                    writer.WriteLine(row);
                }
            }
            
            return new FileInfo(filePath).Length;
        }

        private long ExportToPdf(GeneratedReport report, string filePath)
        {
            // In a real implementation, this would generate a PDF file
            // For this example, we'll just create a text file with a placeholder message
            using (var writer = new StreamWriter(filePath))
            {
                writer.WriteLine("This is a placeholder for PDF export functionality");
                writer.WriteLine($"Report: {report.Name}");
                writer.WriteLine($"Generated on: {DateTime.UtcNow}");
                writer.WriteLine();
                writer.WriteLine("Columns:");
                foreach (var column in report.Columns)
                {
                    writer.WriteLine($"- {column.DisplayName}");
                }
                writer.WriteLine();
                writer.WriteLine($"Total rows: {report.TotalRows}");
            }
            
            return new FileInfo(filePath).Length;
        }

        #endregion
    }
}