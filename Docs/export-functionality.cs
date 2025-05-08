// Export Functionality Implementation

// --------------------------
// 1. Backend Export Service
// --------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using iTextSharp.text;
using iTextSharp.text.pdf;
using CsvHelper;
using System.Globalization;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Models;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface IExportService
    {
        Task<ExportResult> ExportToCsvAsync(IEnumerable<dynamic> data, string reportName);
        Task<ExportResult> ExportToExcelAsync(IEnumerable<dynamic> data, string reportName, string worksheetName = "Report");
        Task<ExportResult> ExportToPdfAsync(IEnumerable<dynamic> data, string reportName);
        Task<ExportResult> ExportToJsonAsync(IEnumerable<dynamic> data, string reportName);
    }

    public class ExportService : IExportService
    {
        private readonly ILogger<ExportService> _logger;

        public ExportService(ILogger<ExportService> logger)
        {
            _logger = logger;
        }

        public async Task<ExportResult> ExportToCsvAsync(IEnumerable<dynamic> data, string reportName)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    throw new ArgumentException("No data to export");
                }

                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                // Get property names from the first item
                var firstItem = data.First();
                var properties = GetPropertyNames(firstItem);

                // Write headers
                foreach (var prop in properties)
                {
                    csv.WriteField(prop);
                }
                csv.NextRecord();

                // Write data
                foreach (var item in data)
                {
                    foreach (var prop in properties)
                    {
                        var value = GetPropertyValue(item, prop);
                        csv.WriteField(value);
                    }
                    csv.NextRecord();
                }

                await writer.FlushAsync();
                
                return new ExportResult
                {
                    Data = memoryStream.ToArray(),
                    ContentType = "text/csv",
                    FileName = $"{SanitizeFileName(reportName)}_{DateTime.Now:yyyyMMdd}.csv"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to CSV: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<ExportResult> ExportToExcelAsync(IEnumerable<dynamic> data, string reportName, string worksheetName = "Report")
        {
            try
            {
                if (data == null || !data.Any())
                {
                    throw new ArgumentException("No data to export");
                }

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add(worksheetName);

                // Get property names from the first item
                var firstItem = data.First();
                var properties = GetPropertyNames(firstItem);

                // Add headers
                for (int i = 0; i < properties.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = properties[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                    worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
                }

                // Add data
                int row = 2;
                foreach (var item in data)
                {
                    for (int i = 0; i < properties.Count; i++)
                    {
                        var value = GetPropertyValue(item, properties[i]);
                        worksheet.Cell(row, i + 1).Value = value?.ToString();
                    }
                    row++;
                }

                // Auto-size columns
                worksheet.Columns().AdjustToContents();

                // Apply styling
                var range = worksheet.Range(1, 1, row - 1, properties.Count);
                range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                
                return new ExportResult
                {
                    Data = memoryStream.ToArray(),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"{SanitizeFileName(reportName)}_{DateTime.Now:yyyyMMdd}.xlsx"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<ExportResult> ExportToPdfAsync(IEnumerable<dynamic> data, string reportName)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    throw new ArgumentException("No data to export");
                }

                using var memoryStream = new MemoryStream();
                var document = new Document(PageSize.A4.Rotate(), 10f, 10f, 10f, 10f);
                var writer = PdfWriter.GetInstance(document, memoryStream);

                document.Open();

                // Add title
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                var title = new Paragraph(reportName, titleFont)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(title);
                document.Add(new Paragraph(" ")); // Add space

                // Get property names from the first item
                var firstItem = data.First();
                var properties = GetPropertyNames(firstItem);

                // Create table
                var table = new PdfPTable(properties.Count)
                {
                    WidthPercentage = 100
                };

                // Add headers
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                foreach (var prop in properties)
                {
                    var cell = new PdfPCell(new Phrase(prop, headerFont))
                    {
                        BackgroundColor = new BaseColor(200, 200, 200),
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 5
                    };
                    table.AddCell(cell);
                }

                // Add data
                var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);
                foreach (var item in data)
                {
                    foreach (var prop in properties)
                    {
                        var value = GetPropertyValue(item, prop);
                        var cell = new PdfPCell(new Phrase(value?.ToString() ?? "", cellFont))
                        {
                            HorizontalAlignment = Element.ALIGN_LEFT,
                            Padding = 5
                        };
                        table.AddCell(cell);
                    }
                }

                document.Add(table);

                // Add footer with date
                var footerFont = FontFactory.GetFont(FontFactory.HELVETICA_ITALIC, 8);
                var footer = new Paragraph($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}", footerFont)
                {
                    Alignment = Element.ALIGN_RIGHT
                };
                document.Add(footer);

                document.Close();
                
                return new ExportResult
                {
                    Data = memoryStream.ToArray(),
                    ContentType = "application/pdf",
                    FileName = $"{SanitizeFileName(reportName)}_{DateTime.Now:yyyyMMdd}.pdf"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to PDF: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<ExportResult> ExportToJsonAsync(IEnumerable<dynamic> data, string reportName)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    throw new ArgumentException("No data to export");
                }

                var json = System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true
                });

                var bytes = System.Text.Encoding.UTF8.GetBytes(json);
                
                return new ExportResult
                {
                    Data = bytes,
                    ContentType = "application/json",
                    FileName = $"{SanitizeFileName(reportName)}_{DateTime.Now:yyyyMMdd}.json"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to JSON: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        // Helper methods
        private List<string> GetPropertyNames(dynamic obj)
        {
            var properties = new List<string>();

            if (obj is System.Dynamic.ExpandoObject)
            {
                var expandoDict = obj as IDictionary<string, object>;
                properties.AddRange(expandoDict.Keys);
            }
            else
            {
                // Handle other dynamic types
                var type = obj.GetType();
                var propertyInfos = type.GetProperties();
                properties.AddRange(propertyInfos.Select(p => p.Name));
            }

            return properties;
        }

        private object GetPropertyValue(dynamic obj, string propName)
        {
            if (obj is System.Dynamic.ExpandoObject)
            {
                var expandoDict = obj as IDictionary<string, object>;
                if (expandoDict.TryGetValue(propName, out var value))
                {
                    return value;
                }
                return null;
            }
            else
            {
                // Handle other dynamic types
                var type = obj.GetType();
                var prop = type.GetProperty(propName);
                return prop?.GetValue(obj);
            }
        }

        private string SanitizeFileName(string name)
        {
            return string.Join("_", name.Split(Path.GetInvalidFileNameChars()));
        }
    }
}

// --------------------------
// 2. API Controller for Exports
// --------------------------

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Services;

namespace ProgressPlay.Reporting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IExportService _exportService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(
            IReportService reportService,
            IExportService exportService,
            IUserContextService userContextService,
            ILogger<ExportController> logger)
        {
            _reportService = reportService;
            _exportService = exportService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet("report/{reportId}")]
        public async Task<IActionResult> ExportReport(string reportId, [FromQuery] string format)
        {
            try
            {
                _logger.LogInformation("Exporting report {ReportId} to {Format}", reportId, format);

                var currentUser = _userContextService.GetCurrentUser();
                var report = await _reportService.GetReportByIdAsync(reportId);

                if (report == null)
                {
                    _logger.LogWarning("Report {ReportId} not found", reportId);
                    return NotFound($"Report with ID {reportId} not found");
                }

                ExportResult exportResult;
                
                switch (format?.ToLower())
                {
                    case "csv":
                        exportResult = await _exportService.ExportToCsvAsync(report.Data, report.Name);
                        break;
                    case "excel":
                        exportResult = await _exportService.ExportToExcelAsync(report.Data, report.Name);
                        break;
                    case "pdf":
                        exportResult = await _exportService.ExportToPdfAsync(report.Data, report.Name);
                        break;
                    case "json":
                        exportResult = await _exportService.ExportToJsonAsync(report.Data, report.Name);
                        break;
                    default:
                        return BadRequest($"Unsupported export format: {format}");
                }

                _logger.LogInformation("Export of report {ReportId} to {Format} completed successfully", reportId, format);
                
                return File(exportResult.Data, exportResult.ContentType, exportResult.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report {ReportId} to {Format}: {ErrorMessage}", reportId, format, ex.Message);
                return StatusCode(500, $"Error exporting report: {ex.Message}");
            }
        }

        [HttpPost("data")]
        public async Task<IActionResult> ExportData([FromBody] ExportDataRequest request)
        {
            try
            {
                if (request.Data == null || request.Data.Count == 0)
                {
                    return BadRequest("No data to export");
                }

                _logger.LogInformation("Exporting data to {Format}", request.Format);

                ExportResult exportResult;
                
                switch (request.Format?.ToLower())
                {
                    case "csv":
                        exportResult = await _exportService.ExportToCsvAsync(request.Data, request.ReportName);
                        break;
                    case "excel":
                        exportResult = await _exportService.ExportToExcelAsync(request.Data, request.ReportName);
                        break;
                    case "pdf":
                        exportResult = await _exportService.ExportToPdfAsync(request.Data, request.ReportName);
                        break;
                    case "json":
                        exportResult = await _exportService.ExportToJsonAsync(request.Data, request.ReportName);
                        break;
                    default:
                        return BadRequest($"Unsupported export format: {request.Format}");
                }
                
                _logger.LogInformation("Export of data to {Format} completed successfully", request.Format);
                
                return File(exportResult.Data, exportResult.ContentType, exportResult.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting data to {Format}: {ErrorMessage}", request.Format, ex.Message);
                return StatusCode(500, $"Error exporting data: {ex.Message}");
            }
        }
    }

    public class ExportDataRequest
    {
        public List<dynamic> Data { get; set; }
        public string ReportName { get; set; }
        public string Format { get; set; }
    }
}

// --------------------------
// 3. Frontend Export Component
// --------------------------

// src/components/common/ExportOptionsMenu.js
import React from 'react';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import CodeIcon from '@mui/icons-material/Code';

const ExportOptionsMenu = ({ anchorEl, open, onClose, onExport }) => {
  const handleExport = (format) => {
    onExport(format);
    onClose();
  };
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={() => handleExport('csv')}>
        <ListItemIcon>
          <DescriptionIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>CSV</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleExport('excel')}>
        <ListItemIcon>
          <GridOnIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Excel</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleExport('pdf')}>
        <ListItemIcon>
          <PictureAsPdfIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>PDF</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => handleExport('json')}>
        <ListItemIcon>
          <CodeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>JSON</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ExportOptionsMenu;

// --------------------------
// 4. Export Service Implementation
// --------------------------

// src/services/exportService.js
import { API_BASE_URL } from '../config';
import { authHeader } from '../utils/authUtils';

const exportService = {
  exportReport: async (reportId, format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/report/${reportId}?format=${format}`, {
        method: 'GET',
        headers: authHeader(),
      });
      
      if (!response.ok) {
        throw new Error(`Error exporting report: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'report';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Append to body, click and cleanup
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
  
  exportData: async (data, reportName, format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/data`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          reportName,
          format
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error exporting data: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `${reportName}.${format}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Append to body, click and cleanup
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
};

export default exportService;

// --------------------------
// 5. Export Hook Implementation
// --------------------------

// src/hooks/useExport.js
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import exportService from '../services/exportService';

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  const exportReport = async (reportId, format) => {
    setIsExporting(true);
    
    try {
      await exportService.exportReport(reportId, format);
      enqueueSnackbar(`Report exported successfully as ${format.toUpperCase()}`, { variant: 'success' });
      return true;
    } catch (error) {
      enqueueSnackbar(`Failed to export report: ${error.message}`, { variant: 'error' });
      return false;
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportData = async (data, reportName, format) => {
    setIsExporting(true);
    
    try {
      await exportService.exportData(data, reportName, format);
      enqueueSnackbar(`Data exported successfully as ${format.toUpperCase()}`, { variant: 'success' });
      return true;
    } catch (error) {
      enqueueSnackbar(`Failed to export data: ${error.message}`, { variant: 'error' });
      return false;
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    isExporting,
    exportReport,
    exportData
  };
};

// --------------------------
// 6. Integration with Report Component
// --------------------------

// Example usage in a report component
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExportOptionsMenu from '../../components/common/ExportOptionsMenu';
import { useExport } from '../../hooks/useExport';

const ReportComponent = ({ report }) => {
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const { isExporting, exportReport, exportData } = useExport();
  
  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };
  
  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };
  
  const handleExport = async (format) => {
    if (report?.reportId) {
      // Export from saved report
      await exportReport(report.reportId, format);
    } else if (report?.data) {
      // Export directly from data
      await exportData(report.data, 'Report', format);
    }
  };
  
  return (
    <Box>
      {/* Report content */}
      
      {/* Export button */}
      <Button
        variant="outlined"
        startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        onClick={handleOpenExportMenu}
        disabled={isExporting || !report}
      >
        Export
      </Button>
      
      <ExportOptionsMenu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseExportMenu}
        onExport={handleExport}
      />
    </Box>
  );
};

export default ReportComponent;
