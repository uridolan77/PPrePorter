using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// PDF format exporter using iTextSharp
    /// </summary>
    public class PdfExporter : ExporterBase
    {
        private readonly ILogger<PdfExporter> _logger;
        
        public PdfExporter(ILogger<PdfExporter> logger)
        {
            _logger = logger;
        }
        
        public override string ContentType => "application/pdf";
        public override string FileExtension => ".pdf";
        
        public override async Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters)
        {
            _logger.LogInformation("Starting PDF export for report {ReportName}", parameters.ReportName);
            
            var dataList = data.ToList();
            if (!dataList.Any())
            {
                _logger.LogWarning("No data to export for report {ReportName}", parameters.ReportName);
                
                // Return a simple PDF with "No data available" message
                return CreateEmptyPdf(parameters.ReportName);
            }
            
            using var memoryStream = new MemoryStream();
            
            // Create document with A4 size
            var document = new Document(PageSize.A4, 36, 36, 54, 36);
            var writer = PdfWriter.GetInstance(document, memoryStream);
            
            // Add metadata
            document.AddTitle(parameters.ReportName);
            document.AddCreator("PPrePorter Export System");
            document.AddCreationDate();
            
            // Add page numbers
            writer.PageEvent = new PdfPageEvents(parameters.ReportName);
            
            document.Open();
            
            // Add title
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            var title = new Paragraph(parameters.ReportName, titleFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 20
            };
            document.Add(title);
            
            // Add generated date
            var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);
            var generatedDate = new Paragraph($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", smallFont)
            {
                Alignment = Element.ALIGN_RIGHT,
                SpacingAfter = 20
            };
            document.Add(generatedDate);
            
            // Get properties to export
            var properties = parameters.SelectedColumns.Any() 
                ? parameters.SelectedColumns 
                : GetDynamicProperties(dataList.First());
            
            // Create table with columns for each property
            var table = new PdfPTable(properties.Count)
            {
                WidthPercentage = 100,
                SpacingBefore = 10,
                SpacingAfter = 10
            };
            
            // Set column widths based on property names
            var widths = new float[properties.Count];
            for (int i = 0; i < properties.Count; i++)
            {
                // Calculate width based on property name - could be more sophisticated
                widths[i] = Math.Max(properties[i].Length, 10) * 0.5f;
            }
            table.SetWidths(NormalizeWidths(widths));
            
            // Add headers if enabled
            if (parameters.IncludeHeaders)
            {
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
                
                foreach (var property in properties)
                {
                    var cell = new PdfPCell(new Phrase(property, headerFont))
                    {
                        BackgroundColor = new BaseColor(66, 66, 66),
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 5
                    };
                    table.AddCell(cell);
                }
            }
            
            // Add data rows
            var dataFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
            var alternateRowColor = new BaseColor(240, 240, 240);
            
            for (int rowIdx = 0; rowIdx < dataList.Count; rowIdx++)
            {
                var item = dataList[rowIdx];
                
                foreach (var property in properties)
                {
                    var value = GetPropertyValue(item, property);
                    var formattedValue = FormatValue(value);
                    
                    var cell = new PdfPCell(new Phrase(formattedValue, dataFont))
                    {
                        Padding = 4
                    };
                    
                    // Alternate row colors for better readability
                    if (rowIdx % 2 == 1)
                    {
                        cell.BackgroundColor = alternateRowColor;
                    }
                    
                    table.AddCell(cell);
                }
            }
            
            document.Add(table);
            
            // Add footer with summary
            var summaryText = $"Total Records: {dataList.Count}";
            if (!string.IsNullOrEmpty(parameters.GroupBy))
            {
                summaryText += $" | Grouped By: {parameters.GroupBy}";
            }
            if (!string.IsNullOrEmpty(parameters.SortBy))
            {
                summaryText += $" | Sorted By: {parameters.SortBy}";
            }
            
            var summary = new Paragraph(summaryText, smallFont)
            {
                Alignment = Element.ALIGN_LEFT,
                SpacingBefore = 10
            };
            document.Add(summary);
            
            document.Close();
            
            _logger.LogInformation("Completed PDF export for report {ReportName} with {RowCount} rows", 
                parameters.ReportName, dataList.Count);
            
            return await Task.FromResult(memoryStream.ToArray());
        }
        
        private string FormatValue(object value)
        {
            if (value == null)
            {
                return string.Empty;
            }
            
            // Format based on value type
            return value switch
            {
                DateTime dateTime => dateTime.ToString("yyyy-MM-dd HH:mm:ss"),
                DateTimeOffset dateTimeOffset => dateTimeOffset.ToString("yyyy-MM-dd HH:mm:ss"),
                decimal decimalValue => decimalValue.ToString("N2"),
                double doubleValue => doubleValue.ToString("N2"),
                float floatValue => floatValue.ToString("N2"),
                bool boolValue => boolValue ? "Yes" : "No",
                _ => value.ToString()
            };
        }
        
        private float[] NormalizeWidths(float[] widths)
        {
            // Ensure minimum width for all columns and normalize
            float totalWidth = widths.Sum();
            var normalizedWidths = new float[widths.Length];
            
            for (int i = 0; i < widths.Length; i++)
            {
                normalizedWidths[i] = widths[i] / totalWidth * 100;
            }
            
            return normalizedWidths;
        }
        
        private byte[] CreateEmptyPdf(string reportName)
        {
            using var memoryStream = new MemoryStream();
            
            var document = new Document(PageSize.A4, 36, 36, 54, 36);
            var writer = PdfWriter.GetInstance(document, memoryStream);
            
            document.AddTitle(reportName);
            document.AddCreator("PPrePorter Export System");
            document.AddCreationDate();
            
            document.Open();
            
            // Add title
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            var title = new Paragraph(reportName, titleFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 20
            };
            document.Add(title);
            
            // Add generated date
            var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);
            var generatedDate = new Paragraph($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", smallFont)
            {
                Alignment = Element.ALIGN_RIGHT,
                SpacingAfter = 20
            };
            document.Add(generatedDate);
            
            // Add no data message
            var messageFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
            var message = new Paragraph("No data available for this report", messageFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingBefore = 50,
                SpacingAfter = 50
            };
            document.Add(message);
            
            document.Close();
            
            return memoryStream.ToArray();
        }
        
        /// <summary>
        /// Page event handler for adding headers and footers to PDF pages
        /// </summary>
        private class PdfPageEvents : PdfPageEventHelper
        {
            private readonly string _reportName;
            private readonly Font _headerFont;
            private readonly Font _footerFont;
            
            public PdfPageEvents(string reportName)
            {
                _reportName = reportName;
                _headerFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);
                _footerFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);
            }
            
            public override void OnEndPage(PdfWriter writer, Document document)
            {
                base.OnEndPage(writer, document);
                
                // Add footer with page number
                PdfPTable footer = new PdfPTable(3)
                {
                    TotalWidth = document.PageSize.Width - document.LeftMargin - document.RightMargin,
                    LockedWidth = true
                };
                
                // First column - report name
                footer.AddCell(new PdfPCell(new Phrase(_reportName, _footerFont))
                {
                    Border = 0,
                    HorizontalAlignment = Element.ALIGN_LEFT
                });
                
                // Second column - date
                footer.AddCell(new PdfPCell(new Phrase(DateTime.Now.ToString("yyyy-MM-dd"), _footerFont))
                {
                    Border = 0,
                    HorizontalAlignment = Element.ALIGN_CENTER
                });
                
                // Third column - page number
                footer.AddCell(new PdfPCell(new Phrase($"Page {writer.PageNumber}", _footerFont))
                {
                    Border = 0,
                    HorizontalAlignment = Element.ALIGN_RIGHT
                });
                
                // Write footer at the bottom of the page
                footer.WriteSelectedRows(0, -1, document.LeftMargin, document.BottomMargin, writer.DirectContent);
            }
        }
    }
}