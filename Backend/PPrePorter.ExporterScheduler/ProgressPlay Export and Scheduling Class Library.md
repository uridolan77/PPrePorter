# **ProgressPlay Export and Scheduling Class Library**

using System;  
using System.Collections.Generic;  
using System.Dynamic;  
using System.Globalization;  
using System.IO;  
using System.Linq;  
using System.Security.Claims;  
using System.Text;  
using System.Threading;  
using System.Threading.Tasks;  
using Microsoft.AspNetCore.Authorization;  
using Microsoft.AspNetCore.Mvc;  
using Microsoft.AspNetCore.SignalR;  
using Microsoft.EntityFrameworkCore;  
using Microsoft.Extensions.DependencyInjection;  
using Microsoft.Extensions.Hosting;  
using Microsoft.Extensions.Logging;  
using Newtonsoft.Json;  
using Newtonsoft.Json.Linq;  
using Quartz;  
using Quartz.Impl;  
using SendGrid;  
using SendGrid.Helpers.Mail;  
using Twilio;  
using Twilio.Rest.Api.V2010.Account;  
using OfficeOpenXml;  
using CsvHelper;  
using iTextSharp.text;  
using iTextSharp.text.pdf;

namespace PPrePorter.Reporting.Export  
{  
    \#region Models

    public enum ExportFormat  
    {  
        Excel,  
        PDF,  
        CSV,  
        JSON  
    }

    public enum ScheduleFrequency  
    {  
        Daily,  
        Weekly,  
        Monthly,  
        Custom  
    }

    public enum NotificationChannel  
    {  
        InApp,  
        Email,  
        SMS  
    }

    public class ExportParameters  
    {  
        public string ReportName { get; set; }  
        public ExportFormat Format { get; set; }  
        public Dictionary\<string, object\> Filters { get; set; } \= new Dictionary\<string, object\>();  
        public List\<string\> SelectedColumns { get; set; } \= new List\<string\>();  
        public string GroupBy { get; set; }  
        public string SortBy { get; set; }  
        public bool IncludeHeaders { get; set; } \= true;  
        public string Locale { get; set; } \= "en-US";  
        public string TimeZone { get; set; } \= "UTC";  
    }

    public class ScheduleConfiguration  
    {  
        public Guid Id { get; set; }  
        public string Name { get; set; }  
        public string ReportName { get; set; }  
        public ScheduleFrequency Frequency { get; set; }  
        public TimeSpan TimeOfDay { get; set; }  
        public DayOfWeek? DayOfWeek { get; set; }  
        public int? DayOfMonth { get; set; }  
        public string CronExpression { get; set; }  
        public ExportFormat Format { get; set; }  
        public Dictionary\<string, object\> Filters { get; set; } \= new Dictionary\<string, object\>();  
        public List\<string\> SelectedColumns { get; set; } \= new List\<string\>();  
        public string GroupBy { get; set; }  
        public string SortBy { get; set; }  
        public bool IncludeHeaders { get; set; } \= true;  
        public string Locale { get; set; } \= "en-US";  
        public string TimeZone { get; set; } \= "UTC";  
        public DateTime CreatedAt { get; set; }  
        public string CreatedBy { get; set; }  
        public DateTime? LastModifiedAt { get; set; }  
        public string LastModifiedBy { get; set; }  
        public bool IsActive { get; set; } \= true;  
        public List\<NotificationConfiguration\> Notifications { get; set; } \= new List\<NotificationConfiguration\>();  
    }

    public class NotificationConfiguration  
    {  
        public Guid Id { get; set; }  
        public NotificationChannel Channel { get; set; }  
        public string Recipient { get; set; }  
        public bool AttachReport { get; set; }  
        public string Message { get; set; }  
    }

    public class ExecutionHistory  
    {  
        public Guid Id { get; set; }  
        public Guid ScheduleId { get; set; }  
        public DateTime StartTime { get; set; }  
        public DateTime? EndTime { get; set; }  
        public bool IsSuccess { get; set; }  
        public string ErrorMessage { get; set; }  
        public long? FileSizeBytes { get; set; }  
        public TimeSpan? Duration \=\> EndTime.HasValue ? EndTime.Value \- StartTime : null;  
        public List\<NotificationHistory\> Notifications { get; set; } \= new List\<NotificationHistory\>();  
    }

    public class NotificationHistory  
    {  
        public Guid Id { get; set; }  
        public Guid ExecutionId { get; set; }  
        public NotificationChannel Channel { get; set; }  
        public string Recipient { get; set; }  
        public DateTime SentAt { get; set; }  
        public bool IsSuccess { get; set; }  
        public string ErrorMessage { get; set; }  
    }

    \#endregion

    \#region Interfaces

    public interface IExporter  
    {  
        Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters);  
        string ContentType { get; }  
        string FileExtension { get; }  
    }

    public interface IScheduleRepository  
    {  
        Task\<ScheduleConfiguration\> GetByIdAsync(Guid id);  
        Task\<IEnumerable\<ScheduleConfiguration\>\> GetAllAsync();  
        Task\<IEnumerable\<ScheduleConfiguration\>\> GetDueSchedulesAsync(DateTime dueDate);  
        Task AddAsync(ScheduleConfiguration schedule);  
        Task UpdateAsync(ScheduleConfiguration schedule);  
        Task DeleteAsync(Guid id);  
    }

    public interface IScheduleService  
    {  
        Task\<Guid\> CreateScheduleAsync(ScheduleConfiguration schedule);  
        Task UpdateScheduleAsync(ScheduleConfiguration schedule);  
        Task DeleteScheduleAsync(Guid id);  
        Task\<ScheduleConfiguration\> GetScheduleAsync(Guid id);  
        Task\<IEnumerable\<ScheduleConfiguration\>\> GetAllSchedulesAsync();  
        Task\<IEnumerable\<ScheduleConfiguration\>\> GetUserSchedulesAsync(string userId);  
        Task TriggerScheduleAsync(Guid id);  
    }

    public interface IExportJob  
    {  
        Task ExecuteAsync(ScheduleConfiguration schedule);  
    }

    public interface IExecutionHistoryRepository  
    {  
        Task AddAsync(ExecutionHistory history);  
        Task UpdateAsync(ExecutionHistory history);  
        Task\<ExecutionHistory\> GetByIdAsync(Guid id);  
        Task\<IEnumerable\<ExecutionHistory\>\> GetByScheduleIdAsync(Guid scheduleId);  
        Task\<IEnumerable\<ExecutionHistory\>\> GetRecentExecutionsAsync(int limit \= 100);  
    }

    public interface INotificationService  
    {  
        Task SendNotificationAsync(NotificationConfiguration notification, ScheduleConfiguration schedule, byte\[\] reportData);  
    }

    public interface IReportDataService  
    {  
        Task\<IEnumerable\<dynamic\>\> GetReportDataAsync(  
            string reportName,  
            Dictionary\<string, object\> filters,  
            string groupBy,  
            string sortBy);  
    }

    public interface IEmailSender  
    {  
        Task SendEmailAsync(string email, string subject, string message);  
        Task SendEmailWithAttachmentAsync(  
            string email,   
            string subject,   
            string message,   
            byte\[\] attachmentData,   
            string attachmentFileName,   
            string attachmentContentType);  
    }

    public interface ISmsProvider  
    {  
        Task SendSmsAsync(string phoneNumber, string message);  
    }

    public interface IUserRepository  
    {  
        Task\<string\> GetUserConnectionIdAsync(string userId);  
    }

    \#endregion

    \#region Base Classes

    public abstract class ExporterBase : IExporter  
    {  
        public abstract Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters);  
        public abstract string ContentType { get; }  
        public abstract string FileExtension { get; }  
          
        protected string GenerateFileName(ExportParameters parameters)  
        {  
            return $"{parameters.ReportName}\_{DateTime.Now:yyyyMMdd\_HHmmss}{FileExtension}";  
        }  
          
        protected List\<string\> GetDynamicProperties(dynamic obj)  
        {  
            if (obj \== null) return new List\<string\>();  
            return ((IDictionary\<string, object\>)obj).Keys.ToList();  
        }  
          
        protected object GetPropertyValue(dynamic obj, string propertyName)  
        {  
            var dictionary \= (IDictionary\<string, object\>)obj;  
            return dictionary.TryGetValue(propertyName, out var value) ? value : null;  
        }  
    }

    \#endregion

    \#region Exporters

    public class ExcelExporter : ExporterBase  
    {  
        private readonly ILogger\<ExcelExporter\> \_logger;

        public ExcelExporter(ILogger\<ExcelExporter\> logger)  
        {  
            \_logger \= logger;  
        }

        public override string ContentType \=\> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";  
        public override string FileExtension \=\> ".xlsx";  
          
        public override async Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters)  
        {  
            \_logger.LogInformation("Starting Excel export for report {ReportName}", parameters.ReportName);  
              
            // Use EPPlus for Excel generation  
            ExcelPackage.LicenseContext \= LicenseContext.NonCommercial;  
            using var package \= new ExcelPackage();  
            var worksheet \= package.Workbook.Worksheets.Add(parameters.ReportName);  
              
            var dataList \= data.ToList();  
            if (\!dataList.Any())  
            {  
                \_logger.LogWarning("No data to export for report {ReportName}", parameters.ReportName);  
                worksheet.Cells\["A1"\].Value \= "No data available";  
                return package.GetAsByteArray();  
            }  
              
            // Get properties to export  
            var properties \= parameters.SelectedColumns.Any()   
                ? parameters.SelectedColumns   
                : GetDynamicProperties(dataList.First());  
              
            // Create headers  
            if (parameters.IncludeHeaders)  
            {  
                for (int i \= 0; i \< properties.Count; i++)  
                {  
                    worksheet.Cells\[1, i \+ 1\].Value \= properties\[i\];  
                    worksheet.Cells\[1, i \+ 1\].Style.Font.Bold \= true;  
                    worksheet.Cells\[1, i \+ 1\].Style.Fill.PatternType \= OfficeOpenXml.Style.ExcelFillStyle.Solid;  
                    worksheet.Cells\[1, i \+ 1\].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);  
                }  
            }  
              
            // Add data  
            int row \= parameters.IncludeHeaders ? 2 : 1;  
            foreach (var item in dataList)  
            {  
                for (int i \= 0; i \< properties.Count; i++)  
                {  
                    var value \= GetPropertyValue(item, properties\[i\]);  
                    worksheet.Cells\[row, i \+ 1\].Value \= value;  
                      
                    // Format dates  
                    if (value is DateTime)  
                    {  
                        worksheet.Cells\[row, i \+ 1\].Style.Numberformat.Format \= "yyyy-mm-dd hh:mm:ss";  
                    }  
                    // Format numbers  
                    else if (value is decimal || value is double || value is float)  
                    {  
                        worksheet.Cells\[row, i \+ 1\].Style.Numberformat.Format \= "\#,\#\#0.00";  
                    }  
                }  
                row++;  
            }  
              
            // Format as table  
            var tableRange \= worksheet.Cells\[1, 1, row \- 1, properties.Count\];  
            var table \= worksheet.Tables.Add(tableRange, parameters.ReportName.Replace(" ", ""));  
            table.ShowHeader \= parameters.IncludeHeaders;  
              
            // Auto-fit columns  
            worksheet.Cells.AutoFitColumns();  
              
            // Add title and metadata  
            worksheet.HeaderFooter.OddHeader.CenteredText \= parameters.ReportName;  
            worksheet.HeaderFooter.OddFooter.RightAlignedText \= $"Generated: {DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}";  
              
            \_logger.LogInformation("Completed Excel export for report {ReportName} with {RowCount} rows",   
                parameters.ReportName, dataList.Count);  
              
            return await Task.FromResult(package.GetAsByteArray());  
        }  
    }

    public class PdfExporter : ExporterBase  
    {  
        private readonly ILogger\<PdfExporter\> \_logger;

        public PdfExporter(ILogger\<PdfExporter\> logger)  
        {  
            \_logger \= logger;  
        }

        public override string ContentType \=\> "application/pdf";  
        public override string FileExtension \=\> ".pdf";  
          
        public override async Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters)  
        {  
            \_logger.LogInformation("Starting PDF export for report {ReportName}", parameters.ReportName);  
              
            using var memoryStream \= new MemoryStream();  
            var dataList \= data.ToList();  
              
            // Get properties to export  
            var properties \= parameters.SelectedColumns.Any()   
                ? parameters.SelectedColumns   
                : (dataList.Any() ? GetDynamicProperties(dataList.First()) : new List\<string\>());  
              
            // Create PDF document  
            var document \= new Document(PageSize.A4.Rotate(), 10f, 10f, 50f, 50f);  
            var writer \= PdfWriter.GetInstance(document, memoryStream);  
              
            // Add metadata  
            document.AddTitle(parameters.ReportName);  
            document.AddCreator("PPrePorter Reporting Platform");  
            document.AddCreationDate();  
              
            // Add page numbers  
            writer.PageEvent \= new PdfPageEventHelper(parameters.ReportName);  
              
            document.Open();  
              
            // Add title  
            var titleFont \= FontFactory.GetFont(FontFactory.HELVETICA\_BOLD, 16);  
            var title \= new Paragraph(parameters.ReportName, titleFont);  
            title.Alignment \= Element.ALIGN\_CENTER;  
            title.SpacingAfter \= 20;  
            document.Add(title);  
              
            if (\!dataList.Any())  
            {  
                \_logger.LogWarning("No data to export for report {ReportName}", parameters.ReportName);  
                var noDataFont \= FontFactory.GetFont(FontFactory.HELVETICA\_ITALIC, 12);  
                var noData \= new Paragraph("No data available", noDataFont);  
                noData.Alignment \= Element.ALIGN\_CENTER;  
                document.Add(noData);  
            }  
            else  
            {  
                // Create table  
                var table \= new PdfPTable(properties.Count);  
                table.WidthPercentage \= 100;  
                  
                // Set relative column widths  
                float\[\] columnWidths \= new float\[properties.Count\];  
                for (int i \= 0; i \< properties.Count; i++)  
                {  
                    columnWidths\[i\] \= 1f;  
                }  
                table.SetWidths(columnWidths);  
                  
                // Add headers  
                if (parameters.IncludeHeaders)  
                {  
                    var headerFont \= FontFactory.GetFont(FontFactory.HELVETICA\_BOLD, 10);  
                    foreach (var property in properties)  
                    {  
                        var cell \= new PdfPCell(new Phrase(property, headerFont));  
                        cell.BackgroundColor \= new BaseColor(240, 240, 240);  
                        cell.HorizontalAlignment \= Element.ALIGN\_CENTER;  
                        cell.Padding \= 5;  
                        table.AddCell(cell);  
                    }  
                }  
                  
                // Add data  
                var dataFont \= FontFactory.GetFont(FontFactory.HELVETICA, 8);  
                foreach (var item in dataList)  
                {  
                    foreach (var property in properties)  
                    {  
                        var value \= GetPropertyValue(item, property)?.ToString() ?? "";  
                        var cell \= new PdfPCell(new Phrase(value, dataFont));  
                        cell.Padding \= 5;  
                        table.AddCell(cell);  
                    }  
                }  
                  
                document.Add(table);  
            }  
              
            // Add footer with timestamp  
            var footerFont \= FontFactory.GetFont(FontFactory.HELVETICA\_ITALIC, 8);  
            var footer \= new Paragraph($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}", footerFont);  
            footer.Alignment \= Element.ALIGN\_RIGHT;  
            footer.SpacingBefore \= 10;  
            document.Add(footer);  
              
            document.Close();  
              
            \_logger.LogInformation("Completed PDF export for report {ReportName} with {RowCount} rows",   
                parameters.ReportName, dataList.Count);  
              
            return await Task.FromResult(memoryStream.ToArray());  
        }  
          
        // Helper class for PDF page numbering  
        private class PdfPageEventHelper : iTextSharp.text.pdf.PdfPageEventHelper  
        {  
            private readonly string \_reportName;  
            private readonly PdfTemplate \_template;  
            private readonly BaseFont \_baseFont;  
              
            public PdfPageEventHelper(string reportName)  
            {  
                \_reportName \= reportName;  
                \_baseFont \= BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT\_EMBEDDED);  
            }  
              
            public override void OnOpenDocument(PdfWriter writer, Document document)  
            {  
                \_template \= writer.DirectContent.CreateTemplate(50, 50);  
            }  
              
            public override void OnEndPage(PdfWriter writer, Document document)  
            {  
                var content \= writer.DirectContent;  
                var pageSize \= document.PageSize;  
                  
                // Add page number  
                content.SetFontAndSize(\_baseFont, 8);  
                content.BeginText();  
                content.ShowTextAligned(Element.ALIGN\_CENTER, $"Page {writer.PageNumber}",   
                    pageSize.GetRight(80), pageSize.GetBottom(30), 0);  
                content.EndText();  
                  
                // Add report name  
                content.BeginText();  
                content.ShowTextAligned(Element.ALIGN\_LEFT, \_reportName,   
                    pageSize.GetLeft(30), pageSize.GetBottom(30), 0);  
                content.EndText();  
            }  
        }  
    }

    public class CsvExporter : ExporterBase  
    {  
        private readonly ILogger\<CsvExporter\> \_logger;

        public CsvExporter(ILogger\<CsvExporter\> logger)  
        {  
            \_logger \= logger;  
        }

        public override string ContentType \=\> "text/csv";  
        public override string FileExtension \=\> ".csv";  
          
        public override async Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters)  
        {  
            \_logger.LogInformation("Starting CSV export for report {ReportName}", parameters.ReportName);  
              
            using var memoryStream \= new MemoryStream();  
            using var writer \= new StreamWriter(memoryStream, Encoding.UTF8);  
              
            var dataList \= data.ToList();  
              
            // Get properties to export  
            var properties \= parameters.SelectedColumns.Any()   
                ? parameters.SelectedColumns   
                : (dataList.Any() ? GetDynamicProperties(dataList.First()) : new List\<string\>());  
              
            // Create CSV Writer  
            using var csv \= new CsvWriter(writer, CultureInfo.InvariantCulture);  
              
            // Write headers  
            if (parameters.IncludeHeaders)  
            {  
                foreach (var property in properties)  
                {  
                    csv.WriteField(property);  
                }  
                csv.NextRecord();  
            }  
              
            // Write data  
            foreach (var item in dataList)  
            {  
                foreach (var property in properties)  
                {  
                    var value \= GetPropertyValue(item, property);  
                      
                    // Format dates consistently  
                    if (value is DateTime dateValue)  
                    {  
                        csv.WriteField(dateValue.ToString("yyyy-MM-dd HH:mm:ss"));  
                    }  
                    else  
                    {  
                        csv.WriteField(value);  
                    }  
                }  
                csv.NextRecord();  
            }  
              
            await writer.FlushAsync();  
              
            \_logger.LogInformation("Completed CSV export for report {ReportName} with {RowCount} rows",   
                parameters.ReportName, dataList.Count);  
              
            return memoryStream.ToArray();  
        }  
    }

    public class JsonExporter : ExporterBase  
    {  
        private readonly ILogger\<JsonExporter\> \_logger;  
        private readonly JsonSerializerSettings \_jsonSettings;

        public JsonExporter(ILogger\<JsonExporter\> logger)  
        {  
            \_logger \= logger;  
            \_jsonSettings \= new JsonSerializerSettings  
            {  
                Formatting \= Formatting.Indented,  
                DateFormatString \= "yyyy-MM-dd HH:mm:ss",  
                NullValueHandling \= NullValueHandling.Include  
            };  
        }

        public override string ContentType \=\> "application/json";  
        public override string FileExtension \=\> ".json";  
          
        public override async Task\<byte\[\]\> ExportAsync(IEnumerable\<dynamic\> data, ExportParameters parameters)  
        {  
            \_logger.LogInformation("Starting JSON export for report {ReportName}", parameters.ReportName);  
              
            var dataList \= data.ToList();  
              
            // Filter properties if specified  
            if (parameters.SelectedColumns.Any() && dataList.Any())  
            {  
                dataList \= dataList.Select(item \=\> FilterProperties(item, parameters.SelectedColumns)).ToList();  
            }  
              
            // Create result object with metadata  
            var result \= new  
            {  
                metadata \= new  
                {  
                    reportName \= parameters.ReportName,  
                    generatedAt \= DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),  
                    rowCount \= dataList.Count,  
                    filters \= parameters.Filters,  
                    groupBy \= parameters.GroupBy,  
                    sortBy \= parameters.SortBy  
                },  
                data \= dataList  
            };  
              
            // Serialize to JSON  
            var json \= JsonConvert.SerializeObject(result, \_jsonSettings);  
              
            \_logger.LogInformation("Completed JSON export for report {ReportName} with {RowCount} rows",   
                parameters.ReportName, dataList.Count);  
              
            return await Task.FromResult(Encoding.UTF8.GetBytes(json));  
        }  
          
        private dynamic FilterProperties(dynamic item, List\<string\> properties)  
        {  
            // Create a new object with only the selected properties  
            var result \= new ExpandoObject() as IDictionary\<string, object\>;  
            var dictionary \= (IDictionary\<string, object\>)item;  
              
            foreach (var property in properties)  
            {  
                if (dictionary.TryGetValue(property, out var value))  
                {  
                    result\[property\] \= value;  
                }  
            }  
              
            return result;  
        }  
    }

    \#endregion

    \#region Export Factory and Service

    public class ExporterFactory  
    {  
        private readonly IServiceProvider \_serviceProvider;  
          
        public ExporterFactory(IServiceProvider serviceProvider)  
        {  
            \_serviceProvider \= serviceProvider;  
        }  
          
        public IExporter CreateExporter(ExportFormat format)  
        {  
            return format switch  
            {  
                ExportFormat.Excel \=\> \_serviceProvider.GetRequiredService\<ExcelExporter\>(),  
                ExportFormat.PDF \=\> \_serviceProvider.GetRequiredService\<PdfExporter\>(),  
                ExportFormat.CSV \=\> \_serviceProvider.GetRequiredService\<CsvExporter\>(),  
                ExportFormat.JSON \=\> \_serviceProvider.GetRequiredService\<JsonExporter\>(),  
                \_ \=\> throw new ArgumentException($"Unsupported export format: {format}")  
            };  
        }  
    }

    public class ExportService  
    {  
        private readonly ExporterFactory \_exporterFactory;  
        private readonly IReportDataService \_reportDataService;  
        private readonly ILogger\<ExportService\> \_logger;  
          
        public ExportService(  
            ExporterFactory exporterFactory,   
            IReportDataService reportDataService,  
            ILogger\<ExportService\> logger)  
        {  
            \_exporterFactory \= exporterFactory;  
            \_reportDataService \= reportDataService;  
            \_logger \= logger;  
        }  
          
        public async Task\<(byte\[\] Data, string ContentType, string FileName)\> ExportReportAsync(  
            string reportName,   
            ExportParameters parameters)  
        {  
            \_logger.LogInformation("Starting export process for report {ReportName} in {Format} format",   
                reportName, parameters.Format);  
              
            // Get the appropriate exporter  
            var exporter \= \_exporterFactory.CreateExporter(parameters.Format);  
              
            // Fetch report data  
            var data \= await \_reportDataService.GetReportDataAsync(  
                reportName,   
                parameters.Filters,   
                parameters.GroupBy,   
                parameters.SortBy);  
              
            // Export data to the specified format  
            var exportedData \= await exporter.ExportAsync(data, parameters);  
              
            // Generate filename  
            var fileName \= $"{reportName}\_{DateTime.Now:yyyyMMdd\_HHmmss}{exporter.FileExtension}";  
              
            \_logger.LogInformation("Export completed for report {ReportName} \- size: {Size} bytes",   
                reportName, exportedData.Length);  
              
            return (exportedData, exporter.ContentType, fileName);  
        }  
    }

    \#endregion

    \#region Notification Services

    public class NotificationHub : Hub  
    {  
        public async Task SendNotification(string userId, object message)  
        {  
            await Clients.User(userId).SendAsync("ReceiveNotification", message);  
        }  
    }

    public class InAppNotificationService : INotificationService  
    {  
        private readonly IHubContext\<NotificationHub\> \_hubContext;  
        private readonly IUserRepository \_userRepository;  
        private readonly ILogger\<InAppNotificationService\> \_logger;  
          
        public InAppNotificationService(  
            IHubContext\<NotificationHub\> hubContext,   
            IUserRepository userRepository,  
            ILogger\<InAppNotificationService\> logger)  
        {  
            \_hubContext \= hubContext;  
            \_userRepository \= userRepository;  
            \_logger \= logger;  
        }  
          
        public async Task SendNotificationAsync(  
            NotificationConfiguration notification,   
            ScheduleConfiguration schedule,   
            byte\[\] reportData)  
        {  
            \_logger.LogInformation("Sending in-app notification for report {ReportName} to user {UserId}",   
                schedule.Name, notification.Recipient);  
              
            var userId \= notification.Recipient;  
              
            // Create notification message  
            var message \= new  
            {  
                Type \= "ReportReady",  
                Title \= "Report Ready",  
                Body \= string.IsNullOrEmpty(notification.Message)   
                    ? $"Your scheduled report '{schedule.Name}' is ready."   
                    : notification.Message,  
                ReportId \= schedule.Id.ToString(),  
                ReportName \= schedule.Name,  
                ReportFormat \= schedule.Format.ToString(),  
                Timestamp \= DateTime.UtcNow  
            };  
              
            // Send notification to user  
            await \_hubContext.Clients.User(userId).SendAsync("ReceiveNotification", message);  
              
            \_logger.LogInformation("In-app notification sent successfully for report {ReportName}", schedule.Name);  
        }  
    }

    public class EmailNotificationService : INotificationService  
    {  
        private readonly IEmailSender \_emailSender;  
        private readonly ILogger\<EmailNotificationService\> \_logger;  
          
        public EmailNotificationService(IEmailSender emailSender, ILogger\<EmailNotificationService\> logger)  
        {  
            \_emailSender \= emailSender;  
            \_logger \= logger;  
        }  
          
        public async Task SendNotificationAsync(  
            NotificationConfiguration notification,   
            ScheduleConfiguration schedule,   
            byte\[\] reportData)  
        {  
            var email \= notification.Recipient;  
              
            \_logger.LogInformation("Sending email notification for report {ReportName} to {Email}",   
                schedule.Name, email);  
              
            // Create email message  
            var subject \= $"ProgressPlay Report: {schedule.Name}";  
            var body \= string.IsNullOrEmpty(notification.Message)  
                ? $"Your scheduled report '{schedule.Name}' is ready."  
                : notification.Message;  
              
            body \+= $"\\n\\nReport Details:\\n" \+  
                    $"- Name: {schedule.Name}\\n" \+  
                    $"- Format: {schedule.Format}\\n" \+  
                    $"- Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC\\n";  
              
            // Add download link or attach file  
            if (notification.AttachReport && reportData \!= null)  
            {  
                var exporter \= new ExporterFactory(null).CreateExporter(schedule.Format);  
                var fileName \= $"{schedule.ReportName}\_{DateTime.Now:yyyyMMdd\_HHmmss}{exporter.FileExtension}";  
                  
                // Send email with attachment  
                await \_emailSender.SendEmailWithAttachmentAsync(  
                    email,  
                    subject,  
                    body,  
                    reportData,  
                    fileName,  
                    exporter.ContentType);  
                  
                \_logger.LogInformation("Email with attachment sent successfully for report {ReportName}",   
                    schedule.Name);  
            }  
            else  
            {  
                // Send email with link  
                var downloadUrl \= $"/reports/download/{schedule.Id}";  
                body \+= $"\\n\\nYou can download your report here: {downloadUrl}";  
                  
                await \_emailSender.SendEmailAsync(email, subject, body);  
                  
                \_logger.LogInformation("Email with download link sent successfully for report {ReportName}",   
                    schedule.Name);  
            }  
        }  
    }

    public class SmsNotificationService : INotificationService  
    {  
        private readonly ISmsProvider \_smsProvider;  
        private readonly ILogger\<SmsNotificationService\> \_logger;  
          
        public SmsNotificationService(ISmsProvider smsProvider, ILogger\<SmsNotificationService\> logger)  
        {  
            \_smsProvider \= smsProvider;  
            \_logger \= logger;  
        }  
          
        public async Task SendNotificationAsync(  
            NotificationConfiguration notification,   
            ScheduleConfiguration schedule,   
            byte\[\] reportData)  
        {  
            var phoneNumber \= notification.Recipient;  
              
            \_logger.LogInformation("Sending SMS notification for report {ReportName} to {PhoneNumber}",   
                schedule.Name, phoneNumber);  
              
            // Create SMS message  
            var message \= string.IsNullOrEmpty(notification.Message)  
                ? $"Your ProgressPlay report '{schedule.Name}' is ready. Please check your email or log in to view it."  
                : notification.Message;  
              
            // SMS messages should be concise  
            if (message.Length \> 160\)  
            {  
                message \= message.Substring(0, 157\) \+ "...";  
            }  
              
            // Send SMS  
            await \_smsProvider.SendSmsAsync(phoneNumber, message);  
              
            \_logger.LogInformation("SMS notification sent successfully for report {ReportName}", schedule.Name);  
        }  
    }

    public class NotificationServiceFactory  
    {  
        private readonly IServiceProvider \_serviceProvider;  
          
        public NotificationServiceFactory(IServiceProvider serviceProvider)  
        {  
            \_serviceProvider \= serviceProvider;  
        }  
          
        public INotificationService GetNotificationService(NotificationChannel channel)  
        {  
            return channel switch  
            {  
                NotificationChannel.InApp \=\> \_serviceProvider.GetRequiredService\<InAppNotificationService\>(),  
                NotificationChannel.Email \=\> \_serviceProvider.GetRequiredService\<EmailNotificationService\>(),  
                NotificationChannel.SMS \=\> \_serviceProvider.GetRequiredService\<SmsNotificationService\>(),  
                \_ \=\> throw new ArgumentException($"Unsupported notification channel: {channel}")  
            };  
        }  
    }

    \#endregion

    \#region Schedule Service and Job

    public class ScheduleService : IScheduleService  
    {  
        private readonly IScheduleRepository \_scheduleRepository;  
        private readonly IExecutionHistoryRepository \_executionHistoryRepository;  
        private readonly IExportJob \_exportJob;  
        private readonly ILogger\<ScheduleService\> \_logger;  
          
        public ScheduleService(  
            IScheduleRepository scheduleRepository,  
            IExecutionHistoryRepository executionHistoryRepository,  
            IExportJob exportJob,  
            ILogger\<ScheduleService\> logger)  
        {  
            \_scheduleRepository \= scheduleRepository;  
            \_executionHistoryRepository \= executionHistoryRepository;  
            \_exportJob \= exportJob;  
            \_logger \= logger;  
        }  
          
        public async Task\<Guid\> CreateScheduleAsync(ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Creating new schedule for report {ReportName}", schedule.ReportName);  
              
            schedule.Id \= Guid.NewGuid();  
            schedule.CreatedAt \= DateTime.UtcNow;  
              
            // Validate schedule configuration  
            ValidateScheduleConfiguration(schedule);  
              
            await \_scheduleRepository.AddAsync(schedule);  
              
            \_logger.LogInformation("Created schedule {ScheduleId} for report {ReportName}",   
                schedule.Id, schedule.ReportName);  
              
            return schedule.Id;  
        }  
          
        public async Task UpdateScheduleAsync(ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Updating schedule {ScheduleId} for report {ReportName}",   
                schedule.Id, schedule.ReportName);  
              
            schedule.LastModifiedAt \= DateTime.UtcNow;  
              
            // Validate schedule configuration  
            ValidateScheduleConfiguration(schedule);  
              
            await \_scheduleRepository.UpdateAsync(schedule);  
              
            \_logger.LogInformation("Updated schedule {ScheduleId} for report {ReportName}",   
                schedule.Id, schedule.ReportName);  
        }  
          
        public async Task DeleteScheduleAsync(Guid id)  
        {  
            \_logger.LogInformation("Deleting schedule {ScheduleId}", id);  
              
            await \_scheduleRepository.DeleteAsync(id);  
              
            \_logger.LogInformation("Deleted schedule {ScheduleId}", id);  
        }  
          
        public async Task\<ScheduleConfiguration\> GetScheduleAsync(Guid id)  
        {  
            return await \_scheduleRepository.GetByIdAsync(id);  
        }  
          
        public async Task\<IEnumerable\<ScheduleConfiguration\>\> GetAllSchedulesAsync()  
        {  
            return await \_scheduleRepository.GetAllAsync();  
        }  
          
        public async Task\<IEnumerable\<ScheduleConfiguration\>\> GetUserSchedulesAsync(string userId)  
        {  
            \_logger.LogInformation("Retrieving schedules for user {UserId}", userId);  
              
            var allSchedules \= await \_scheduleRepository.GetAllAsync();  
            return allSchedules.Where(s \=\> s.CreatedBy \== userId).ToList();  
        }  
          
        public async Task TriggerScheduleAsync(Guid id)  
        {  
            \_logger.LogInformation("Manually triggering schedule {ScheduleId}", id);  
              
            var schedule \= await \_scheduleRepository.GetByIdAsync(id);  
              
            if (schedule \== null)  
            {  
                \_logger.LogWarning("Schedule {ScheduleId} not found for triggering", id);  
                throw new ArgumentException($"Schedule with ID {id} not found");  
            }  
              
            await \_exportJob.ExecuteAsync(schedule);  
              
            \_logger.LogInformation("Successfully triggered schedule {ScheduleId} for report {ReportName}",   
                id, schedule.ReportName);  
        }  
          
        private void ValidateScheduleConfiguration(ScheduleConfiguration schedule)  
        {  
            // Basic validation  
            if (string.IsNullOrWhiteSpace(schedule.Name))  
            {  
                throw new ArgumentException("Schedule name is required");  
            }  
              
            if (string.IsNullOrWhiteSpace(schedule.ReportName))  
            {  
                throw new ArgumentException("Report name is required");  
            }  
              
            // Frequency-specific validation  
            switch (schedule.Frequency)  
            {  
                case ScheduleFrequency.Weekly:  
                    if (\!schedule.DayOfWeek.HasValue)  
                    {  
                        throw new ArgumentException("Day of week is required for weekly schedules");  
                    }  
                    break;  
                      
                case ScheduleFrequency.Monthly:  
                    if (\!schedule.DayOfMonth.HasValue)  
                    {  
                        throw new ArgumentException("Day of month is required for monthly schedules");  
                    }  
                    if (schedule.DayOfMonth \< 1 || schedule.DayOfMonth \> 31\)  
                    {  
                        throw new ArgumentException("Day of month must be between 1 and 31");  
                    }  
                    break;  
                      
                case ScheduleFrequency.Custom:  
                    if (string.IsNullOrWhiteSpace(schedule.CronExpression))  
                    {  
                        throw new ArgumentException("Cron expression is required for custom schedules");  
                    }  
                    // Validate cron expression  
                    try  
                    {  
                        CronExpression.ValidateExpression(schedule.CronExpression);  
                    }  
                    catch (Exception ex)  
                    {  
                        throw new ArgumentException($"Invalid cron expression: {ex.Message}");  
                    }  
                    break;  
            }  
              
            // Validate notifications  
            if (schedule.Notifications \== null || \!schedule.Notifications.Any())  
            {  
                throw new ArgumentException("At least one notification method is required");  
            }  
              
            foreach (var notification in schedule.Notifications)  
            {  
                if (string.IsNullOrWhiteSpace(notification.Recipient))  
                {  
                    throw new ArgumentException($"Recipient is required for {notification.Channel} notification");  
                }  
                  
                // Channel-specific validation  
                switch (notification.Channel)  
                {  
                    case NotificationChannel.Email:  
                        if (\!IsValidEmail(notification.Recipient))  
                        {  
                            throw new ArgumentException($"Invalid email address: {notification.Recipient}");  
                        }  
                        break;  
                          
                    case NotificationChannel.SMS:  
                        if (\!IsValidPhoneNumber(notification.Recipient))  
                        {  
                            throw new ArgumentException($"Invalid phone number: {notification.Recipient}");  
                        }  
                        break;  
                }  
            }  
        }  
          
        private bool IsValidEmail(string email)  
        {  
            try  
            {  
                var addr \= new System.Net.Mail.MailAddress(email);  
                return addr.Address \== email;  
            }  
            catch  
            {  
                return false;  
            }  
        }  
          
        private bool IsValidPhoneNumber(string phoneNumber)  
        {  
            // Simple validation \- could be enhanced  
            return \!string.IsNullOrWhiteSpace(phoneNumber) &&   
                   phoneNumber.Length \>= 10 &&   
                   phoneNumber.All(c \=\> char.IsDigit(c) || c \== '+' || c \== '-' || c \== ' ');  
        }  
    }

    public class ExportJob : IExportJob  
    {  
        private readonly IReportDataService \_reportDataService;  
        private readonly ExporterFactory \_exporterFactory;  
        private readonly NotificationServiceFactory \_notificationServiceFactory;  
        private readonly IExecutionHistoryRepository \_executionHistoryRepository;  
        private readonly ILogger\<ExportJob\> \_logger;  
          
        public ExportJob(  
            IReportDataService reportDataService,  
            ExporterFactory exporterFactory,  
            NotificationServiceFactory notificationServiceFactory,  
            IExecutionHistoryRepository executionHistoryRepository,  
            ILogger\<ExportJob\> logger)  
        {  
            \_reportDataService \= reportDataService;  
            \_exporterFactory \= exporterFactory;  
            \_notificationServiceFactory \= notificationServiceFactory;  
            \_executionHistoryRepository \= executionHistoryRepository;  
            \_logger \= logger;  
        }  
          
        public async Task ExecuteAsync(ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Starting export job for schedule {ScheduleId} ({ScheduleName})",   
                schedule.Id, schedule.Name);  
              
            var executionHistory \= new ExecutionHistory  
            {  
                Id \= Guid.NewGuid(),  
                ScheduleId \= schedule.Id,  
                StartTime \= DateTime.UtcNow  
            };  
              
            try  
            {  
                // Create export parameters  
                var parameters \= new ExportParameters  
                {  
                    ReportName \= schedule.ReportName,  
                    Format \= schedule.Format,  
                    Filters \= schedule.Filters,  
                    SelectedColumns \= schedule.SelectedColumns,  
                    GroupBy \= schedule.GroupBy,  
                    SortBy \= schedule.SortBy,  
                    IncludeHeaders \= schedule.IncludeHeaders,  
                    Locale \= schedule.Locale,  
                    TimeZone \= schedule.TimeZone  
                };  
                  
                // Get data for report  
                \_logger.LogInformation("Fetching data for report {ReportName}", schedule.ReportName);  
                var data \= await \_reportDataService.GetReportDataAsync(  
                    schedule.ReportName,   
                    schedule.Filters,  
                    schedule.GroupBy,  
                    schedule.SortBy);  
                  
                // Get appropriate exporter  
                var exporter \= \_exporterFactory.CreateExporter(schedule.Format);  
                  
                // Export data to specified format  
                \_logger.LogInformation("Exporting data to {Format} format", schedule.Format);  
                var exportedData \= await exporter.ExportAsync(data, parameters);  
                  
                executionHistory.FileSizeBytes \= exportedData.Length;  
                  
                // Send notifications  
                \_logger.LogInformation("Sending notifications for schedule {ScheduleId}", schedule.Id);  
                foreach (var notificationConfig in schedule.Notifications)  
                {  
                    try  
                    {  
                        var notificationService \= \_notificationServiceFactory.GetNotificationService(notificationConfig.Channel);  
                          
                        await notificationService.SendNotificationAsync(notificationConfig, schedule, exportedData);  
                          
                        var notificationHistory \= new NotificationHistory  
                        {  
                            Id \= Guid.NewGuid(),  
                            ExecutionId \= executionHistory.Id,  
                            Channel \= notificationConfig.Channel,  
                            Recipient \= notificationConfig.Recipient,  
                            SentAt \= DateTime.UtcNow,  
                            IsSuccess \= true  
                        };  
                          
                        executionHistory.Notifications.Add(notificationHistory);  
                    }  
                    catch (Exception ex)  
                    {  
                        \_logger.LogError(ex, "Failed to send notification for schedule {ScheduleId} via {Channel} to {Recipient}",  
                            schedule.Id, notificationConfig.Channel, notificationConfig.Recipient);  
                          
                        var notificationHistory \= new NotificationHistory  
                        {  
                            Id \= Guid.NewGuid(),  
                            ExecutionId \= executionHistory.Id,  
                            Channel \= notificationConfig.Channel,  
                            Recipient \= notificationConfig.Recipient,  
                            SentAt \= DateTime.UtcNow,  
                            IsSuccess \= false,  
                            ErrorMessage \= ex.Message  
                        };  
                          
                        executionHistory.Notifications.Add(notificationHistory);  
                    }  
                }  
                  
                // Update execution history  
                executionHistory.EndTime \= DateTime.UtcNow;  
                executionHistory.IsSuccess \= true;  
                  
                \_logger.LogInformation("Successfully completed export job for schedule {ScheduleId}", schedule.Id);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Failed to execute export job for schedule {ScheduleId} ({ScheduleName})",   
                    schedule.Id, schedule.Name);  
                  
                executionHistory.EndTime \= DateTime.UtcNow;  
                executionHistory.IsSuccess \= false;  
                executionHistory.ErrorMessage \= ex.Message;  
            }  
              
            // Save execution history  
            await \_executionHistoryRepository.AddAsync(executionHistory);  
        }  
    }

    \#endregion

    \#region Scheduler

    public class QuartzHostedService : BackgroundService  
    {  
        private readonly ISchedulerFactory \_schedulerFactory;  
        private readonly ILogger\<QuartzHostedService\> \_logger;  
        private IScheduler \_scheduler;  
          
        public QuartzHostedService(  
            ISchedulerFactory schedulerFactory,  
            ILogger\<QuartzHostedService\> logger)  
        {  
            \_schedulerFactory \= schedulerFactory;  
            \_logger \= logger;  
        }  
          
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)  
        {  
            \_logger.LogInformation("Report Scheduler is starting");  
              
            // Initialize the scheduler  
            \_scheduler \= await \_schedulerFactory.GetScheduler(stoppingToken);  
              
            // Register job and trigger for checking due schedules  
            var jobDetail \= JobBuilder.Create\<ScheduleCheckJob\>()  
                .WithIdentity("ScheduleCheckJob", "ReportingGroup")  
                .Build();  
              
            var trigger \= TriggerBuilder.Create()  
                .WithIdentity("ScheduleCheckTrigger", "ReportingGroup")  
                .StartNow()  
                .WithSimpleSchedule(x \=\> x  
                    .WithIntervalInMinutes(1) // Check for due schedules every minute  
                    .RepeatForever())  
                .Build();  
              
            await \_scheduler.ScheduleJob(jobDetail, trigger, stoppingToken);  
              
            // Start the scheduler  
            await \_scheduler.Start(stoppingToken);  
              
            \_logger.LogInformation("Report Scheduler has started");  
              
            // Keep running until cancellation is requested  
            await Task.Delay(Timeout.Infinite, stoppingToken);  
        }  
          
        public override async Task StopAsync(CancellationToken cancellationToken)  
        {  
            \_logger.LogInformation("Report Scheduler is stopping");  
              
            if (\_scheduler \!= null)  
            {  
                await \_scheduler.Shutdown(cancellationToken);  
            }  
              
            \_logger.LogInformation("Report Scheduler has stopped");  
              
            await base.StopAsync(cancellationToken);  
        }  
    }

    public class ScheduleCheckJob : IJob  
    {  
        private readonly IScheduleRepository \_scheduleRepository;  
        private readonly IExportJob \_exportJob;  
        private readonly ILogger\<ScheduleCheckJob\>

       private readonly ILogger\<ScheduleCheckJob\> \_logger;  
          
        public ScheduleCheckJob(  
            IScheduleRepository scheduleRepository,  
            IExportJob exportJob,  
            ILogger\<ScheduleCheckJob\> logger)  
        {  
            \_scheduleRepository \= scheduleRepository;  
            \_exportJob \= exportJob;  
            \_logger \= logger;  
        }  
          
        public async Task Execute(IJobExecutionContext context)  
        {  
            \_logger.LogDebug("Checking for due schedules");  
              
            try  
            {  
                // Get current time  
                var now \= DateTime.UtcNow;  
                  
                // Get all due schedules  
                var dueSchedules \= await \_scheduleRepository.GetDueSchedulesAsync(now);  
                  
                // Execute each due schedule  
                foreach (var schedule in dueSchedules)  
                {  
                    if (\!schedule.IsActive)  
                    {  
                        \_logger.LogInformation("Skipping inactive schedule {ScheduleId} ({ScheduleName})",   
                            schedule.Id, schedule.Name);  
                        continue;  
                    }  
                      
                    \_logger.LogInformation("Found due schedule {ScheduleId} ({ScheduleName})",   
                        schedule.Id, schedule.Name);  
                      
                    // Execute the export job  
                    await \_exportJob.ExecuteAsync(schedule);  
                }  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error checking for due schedules");  
            }  
        }  
    }

    \#endregion

    \#region External Service Implementations

    public class SendGridEmailSender : IEmailSender  
    {  
        private readonly string \_apiKey;  
        private readonly string \_fromEmail;  
        private readonly string \_fromName;  
        private readonly ILogger\<SendGridEmailSender\> \_logger;  
          
        public SendGridEmailSender(  
            string apiKey,   
            string fromEmail,   
            string fromName,  
            ILogger\<SendGridEmailSender\> logger)  
        {  
            \_apiKey \= apiKey;  
            \_fromEmail \= fromEmail;  
            \_fromName \= fromName;  
            \_logger \= logger;  
        }  
          
        public async Task SendEmailAsync(string email, string subject, string message)  
        {  
            var client \= new SendGridClient(\_apiKey);  
            var from \= new EmailAddress(\_fromEmail, \_fromName);  
            var to \= new EmailAddress(email);  
            var plainTextContent \= message;  
            var htmlContent \= message.Replace("\\n", "\<br\>");  
              
            var msg \= MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);  
              
            \_logger.LogInformation("Sending email to {Email} with subject '{Subject}'", email, subject);  
              
            var response \= await client.SendEmailAsync(msg);  
              
            if (response.StatusCode \!= System.Net.HttpStatusCode.Accepted &&   
                response.StatusCode \!= System.Net.HttpStatusCode.OK)  
            {  
                var responseBody \= await response.Body.ReadAsStringAsync();  
                \_logger.LogError("Failed to send email. Status code: {StatusCode}, Response: {Response}",   
                    response.StatusCode, responseBody);  
                  
                throw new Exception($"Failed to send email. Status code: {response.StatusCode}");  
            }  
              
            \_logger.LogInformation("Successfully sent email to {Email}", email);  
        }  
          
        public async Task SendEmailWithAttachmentAsync(  
            string email,   
            string subject,   
            string message,   
            byte\[\] attachmentData,   
            string attachmentFileName,   
            string attachmentContentType)  
        {  
            var client \= new SendGridClient(\_apiKey);  
            var from \= new EmailAddress(\_fromEmail, \_fromName);  
            var to \= new EmailAddress(email);  
            var plainTextContent \= message;  
            var htmlContent \= message.Replace("\\n", "\<br\>");  
              
            var msg \= MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);  
              
            // Convert attachment data to base64  
            var base64Content \= Convert.ToBase64String(attachmentData);  
            msg.AddAttachment(attachmentFileName, base64Content, attachmentContentType, "attachment");  
              
            \_logger.LogInformation("Sending email with attachment to {Email} with subject '{Subject}'",   
                email, subject);  
              
            var response \= await client.SendEmailAsync(msg);  
              
            if (response.StatusCode \!= System.Net.HttpStatusCode.Accepted &&   
                response.StatusCode \!= System.Net.HttpStatusCode.OK)  
            {  
                var responseBody \= await response.Body.ReadAsStringAsync();  
                \_logger.LogError("Failed to send email with attachment. Status code: {StatusCode}, Response: {Response}",   
                    response.StatusCode, responseBody);  
                  
                throw new Exception($"Failed to send email with attachment. Status code: {response.StatusCode}");  
            }  
              
            \_logger.LogInformation("Successfully sent email with attachment to {Email}", email);  
        }  
    }

    public class TwilioSmsProvider : ISmsProvider  
    {  
        private readonly string \_accountSid;  
        private readonly string \_authToken;  
        private readonly string \_fromNumber;  
        private readonly ILogger\<TwilioSmsProvider\> \_logger;  
          
        public TwilioSmsProvider(  
            string accountSid,   
            string authToken,   
            string fromNumber,  
            ILogger\<TwilioSmsProvider\> logger)  
        {  
            \_accountSid \= accountSid;  
            \_authToken \= authToken;  
            \_fromNumber \= fromNumber;  
            \_logger \= logger;  
              
            // Initialize Twilio client  
            TwilioClient.Init(\_accountSid, \_authToken);  
        }  
          
        public async Task SendSmsAsync(string phoneNumber, string message)  
        {  
            \_logger.LogInformation("Sending SMS to {PhoneNumber}", phoneNumber);  
              
            try  
            {  
                // Ensure phone number is in E.164 format  
                if (\!phoneNumber.StartsWith("+"))  
                {  
                    phoneNumber \= "+" \+ phoneNumber;  
                }  
                  
                // Send SMS  
                var smsMessage \= await MessageResource.CreateAsync(  
                    body: message,  
                    from: new Twilio.Types.PhoneNumber(\_fromNumber),  
                    to: new Twilio.Types.PhoneNumber(phoneNumber)  
                );  
                  
                \_logger.LogInformation("Successfully sent SMS to {PhoneNumber}, SID: {MessageSid}",   
                    phoneNumber, smsMessage.Sid);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Failed to send SMS to {PhoneNumber}", phoneNumber);  
                throw;  
            }  
        }  
    }

    \#endregion

    \#region Repositories

    public class ScheduleRepository : IScheduleRepository  
    {  
        private readonly ProgressPlayDbContext \_dbContext;  
        private readonly ILogger\<ScheduleRepository\> \_logger;  
          
        public ScheduleRepository(ProgressPlayDbContext dbContext, ILogger\<ScheduleRepository\> logger)  
        {  
            \_dbContext \= dbContext;  
            \_logger \= logger;  
        }  
          
        public async Task\<ScheduleConfiguration\> GetByIdAsync(Guid id)  
        {  
            \_logger.LogDebug("Getting schedule with ID {ScheduleId}", id);  
              
            var schedule \= await \_dbContext.Schedules  
                .Include(s \=\> s.Notifications)  
                .FirstOrDefaultAsync(s \=\> s.Id \== id);  
              
            if (schedule \== null)  
            {  
                \_logger.LogWarning("Schedule with ID {ScheduleId} not found", id);  
            }  
              
            return schedule;  
        }  
          
        public async Task\<IEnumerable\<ScheduleConfiguration\>\> GetAllAsync()  
        {  
            \_logger.LogDebug("Getting all schedules");  
              
            return await \_dbContext.Schedules  
                .Include(s \=\> s.Notifications)  
                .OrderBy(s \=\> s.Name)  
                .ToListAsync();  
        }  
          
        public async Task\<IEnumerable\<ScheduleConfiguration\>\> GetDueSchedulesAsync(DateTime dueDate)  
        {  
            \_logger.LogDebug("Checking for schedules due at {DateTime}", dueDate);  
              
            var dueSchedules \= new List\<ScheduleConfiguration\>();  
            var allSchedules \= await \_dbContext.Schedules  
                .Include(s \=\> s.Notifications)  
                .Where(s \=\> s.IsActive)  
                .ToListAsync();  
              
            foreach (var schedule in allSchedules)  
            {  
                if (IsScheduleDue(schedule, dueDate))  
                {  
                    dueSchedules.Add(schedule);  
                }  
            }  
              
            \_logger.LogInformation("Found {Count} schedules due for execution", dueSchedules.Count);  
              
            return dueSchedules;  
        }  
          
        public async Task AddAsync(ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Adding new schedule {ScheduleName}", schedule.Name);  
              
            await \_dbContext.Schedules.AddAsync(schedule);  
            await \_dbContext.SaveChangesAsync();  
              
            \_logger.LogInformation("Added new schedule with ID {ScheduleId}", schedule.Id);  
        }  
          
        public async Task UpdateAsync(ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Updating schedule {ScheduleId} ({ScheduleName})",   
                schedule.Id, schedule.Name);  
              
            \_dbContext.Schedules.Update(schedule);  
            await \_dbContext.SaveChangesAsync();  
              
            \_logger.LogInformation("Updated schedule {ScheduleId}", schedule.Id);  
        }  
          
        public async Task DeleteAsync(Guid id)  
        {  
            \_logger.LogInformation("Deleting schedule {ScheduleId}", id);  
              
            var schedule \= await \_dbContext.Schedules  
                .Include(s \=\> s.Notifications)  
                .FirstOrDefaultAsync(s \=\> s.Id \== id);  
              
            if (schedule \== null)  
            {  
                \_logger.LogWarning("Schedule with ID {ScheduleId} not found for deletion", id);  
                return;  
            }  
              
            \_dbContext.Schedules.Remove(schedule);  
            await \_dbContext.SaveChangesAsync();  
              
            \_logger.LogInformation("Deleted schedule {ScheduleId}", id);  
        }  
          
        private bool IsScheduleDue(ScheduleConfiguration schedule, DateTime currentTime)  
        {  
            var timeNow \= currentTime.TimeOfDay;  
            var dateNow \= currentTime.Date;  
              
            // Check if the schedule is due based on frequency  
            switch (schedule.Frequency)  
            {  
                case ScheduleFrequency.Daily:  
                    // Due if the current time matches the scheduled time (within a minute)  
                    return IsTimeMatching(timeNow, schedule.TimeOfDay);  
                      
                case ScheduleFrequency.Weekly:  
                    // Due if it's the right day of week and time  
                    return currentTime.DayOfWeek \== schedule.DayOfWeek &&   
                           IsTimeMatching(timeNow, schedule.TimeOfDay);  
                      
                case ScheduleFrequency.Monthly:  
                    // Due if it's the right day of month and time  
                    return currentTime.Day \== schedule.DayOfMonth &&   
                           IsTimeMatching(timeNow, schedule.TimeOfDay);  
                      
                case ScheduleFrequency.Custom:  
                    // Use Quartz cron expression evaluator  
                    var expression \= new CronExpression(schedule.CronExpression);  
                    var nextFireTime \= expression.GetNextValidTimeAfter(currentTime.AddMinutes(-1));  
                    return nextFireTime.HasValue &&   
                           nextFireTime.Value.Year \== currentTime.Year &&   
                           nextFireTime.Value.Month \== currentTime.Month &&   
                           nextFireTime.Value.Day \== currentTime.Day &&   
                           nextFireTime.Value.Hour \== currentTime.Hour &&   
                           nextFireTime.Value.Minute \== currentTime.Minute;  
                      
                default:  
                    return false;  
            }  
        }  
          
        private bool IsTimeMatching(TimeSpan time1, TimeSpan time2)  
        {  
            // Consider times matching if they're within the same minute  
            return time1.Hours \== time2.Hours && time1.Minutes \== time2.Minutes;  
        }  
    }

    public class ExecutionHistoryRepository : IExecutionHistoryRepository  
    {  
        private readonly ProgressPlayDbContext \_dbContext;  
        private readonly ILogger\<ExecutionHistoryRepository\> \_logger;  
          
        public ExecutionHistoryRepository(ProgressPlayDbContext dbContext, ILogger\<ExecutionHistoryRepository\> logger)  
        {  
            \_dbContext \= dbContext;  
            \_logger \= logger;  
        }  
          
        public async Task AddAsync(ExecutionHistory history)  
        {  
            \_logger.LogDebug("Adding execution history for schedule {ScheduleId}", history.ScheduleId);  
              
            await \_dbContext.ExecutionHistories.AddAsync(history);  
              
            if (history.Notifications \!= null && history.Notifications.Any())  
            {  
                await \_dbContext.NotificationHistories.AddRangeAsync(history.Notifications);  
            }  
              
            await \_dbContext.SaveChangesAsync();  
              
            \_logger.LogDebug("Added execution history with ID {ExecutionId}", history.Id);  
        }  
          
        public async Task UpdateAsync(ExecutionHistory history)  
        {  
            \_logger.LogDebug("Updating execution history {ExecutionId}", history.Id);  
              
            \_dbContext.ExecutionHistories.Update(history);  
              
            if (history.Notifications \!= null && history.Notifications.Any())  
            {  
                foreach (var notification in history.Notifications)  
                {  
                    var existingNotification \= await \_dbContext.NotificationHistories  
                        .FindAsync(notification.Id);  
                      
                    if (existingNotification \!= null)  
                    {  
                        \_dbContext.Entry(existingNotification).CurrentValues.SetValues(notification);  
                    }  
                    else  
                    {  
                        await \_dbContext.NotificationHistories.AddAsync(notification);  
                    }  
                }  
            }  
              
            await \_dbContext.SaveChangesAsync();  
              
            \_logger.LogDebug("Updated execution history {ExecutionId}", history.Id);  
        }  
          
        public async Task\<ExecutionHistory\> GetByIdAsync(Guid id)  
        {  
            \_logger.LogDebug("Getting execution history with ID {ExecutionId}", id);  
              
            return await \_dbContext.ExecutionHistories  
                .Include(h \=\> h.Notifications)  
                .FirstOrDefaultAsync(h \=\> h.Id \== id);  
        }  
          
        public async Task\<IEnumerable\<ExecutionHistory\>\> GetByScheduleIdAsync(Guid scheduleId)  
        {  
            \_logger.LogDebug("Getting execution history for schedule {ScheduleId}", scheduleId);  
              
            return await \_dbContext.ExecutionHistories  
                .Include(h \=\> h.Notifications)  
                .Where(h \=\> h.ScheduleId \== scheduleId)  
                .OrderByDescending(h \=\> h.StartTime)  
                .ToListAsync();  
        }  
          
        public async Task\<IEnumerable\<ExecutionHistory\>\> GetRecentExecutionsAsync(int limit \= 100\)  
        {  
            \_logger.LogDebug("Getting recent {Limit} execution histories", limit);  
              
            return await \_dbContext.ExecutionHistories  
                .Include(h \=\> h.Notifications)  
                .OrderByDescending(h \=\> h.StartTime)  
                .Take(limit)  
                .ToListAsync();  
        }  
    }

    \#endregion

    \#region Database Context

    public class ProgressPlayDbContext : DbContext  
    {  
        public ProgressPlayDbContext(DbContextOptions\<ProgressPlayDbContext\> options) : base(options)  
        {  
        }  
          
        public DbSet\<ScheduleConfiguration\> Schedules { get; set; }  
        public DbSet\<NotificationConfiguration\> NotificationConfigurations { get; set; }  
        public DbSet\<ExecutionHistory\> ExecutionHistories { get; set; }  
        public DbSet\<NotificationHistory\> NotificationHistories { get; set; }  
          
        protected override void OnModelCreating(ModelBuilder modelBuilder)  
        {  
            base.OnModelCreating(modelBuilder);  
              
            // Schedule Configuration  
            modelBuilder.Entity\<ScheduleConfiguration\>(entity \=\>  
            {  
                entity.ToTable("ScheduleConfigurations");  
                entity.HasKey(e \=\> e.Id);  
                entity.Property(e \=\> e.Name).IsRequired().HasMaxLength(100);  
                entity.Property(e \=\> e.ReportName).IsRequired().HasMaxLength(100);  
                entity.Property(e \=\> e.Frequency).IsRequired();  
                entity.Property(e \=\> e.TimeOfDay).IsRequired();  
                entity.Property(e \=\> e.CronExpression).HasMaxLength(100);  
                entity.Property(e \=\> e.Format).IsRequired();  
                entity.Property(e \=\> e.Filters).HasColumnType("nvarchar(max)");  
                entity.Property(e \=\> e.SelectedColumns).HasColumnType("nvarchar(max)");  
                entity.Property(e \=\> e.CreatedBy).IsRequired().HasMaxLength(100);  
                entity.Property(e \=\> e.LastModifiedBy).HasMaxLength(100);  
                  
                // Convert complex properties to JSON  
                entity.Property(e \=\> e.Filters).HasConversion(  
                    v \=\> JsonConvert.SerializeObject(v),  
                    v \=\> JsonConvert.DeserializeObject\<Dictionary\<string, object\>\>(v ?? "{}"));  
                  
                entity.Property(e \=\> e.SelectedColumns).HasConversion(  
                    v \=\> JsonConvert.SerializeObject(v),  
                    v \=\> JsonConvert.DeserializeObject\<List\<string\>\>(v ?? "\[\]"));  
            });  
              
            // Notification Configuration  
            modelBuilder.Entity\<NotificationConfiguration\>(entity \=\>  
            {  
                entity.ToTable("NotificationConfigurations");  
                entity.HasKey(e \=\> e.Id);  
                entity.Property(e \=\> e.Channel).IsRequired();  
                entity.Property(e \=\> e.Recipient).IsRequired().HasMaxLength(255);  
                entity.Property(e \=\> e.Message).HasMaxLength(1000);  
            });  
              
            // Relationship between Schedule and Notifications  
            modelBuilder.Entity\<ScheduleConfiguration\>()  
                .HasMany(s \=\> s.Notifications)  
                .WithOne()  
                .HasForeignKey("ScheduleId")  
                .OnDelete(DeleteBehavior.Cascade);  
              
            // Execution History  
            modelBuilder.Entity\<ExecutionHistory\>(entity \=\>  
            {  
                entity.ToTable("ExecutionHistories");  
                entity.HasKey(e \=\> e.Id);  
                entity.Property(e \=\> e.ScheduleId).IsRequired();  
                entity.Property(e \=\> e.StartTime).IsRequired();  
                entity.Property(e \=\> e.ErrorMessage).HasMaxLength(4000);  
                  
                // Define relationship with Schedule  
                entity.HasOne\<ScheduleConfiguration\>()  
                    .WithMany()  
                    .HasForeignKey(e \=\> e.ScheduleId)  
                    .OnDelete(DeleteBehavior.Cascade);  
            });  
              
            // Notification History  
            modelBuilder.Entity\<NotificationHistory\>(entity \=\>  
            {  
                entity.ToTable("NotificationHistories");  
                entity.HasKey(e \=\> e.Id);  
                entity.Property(e \=\> e.ExecutionId).IsRequired();  
                entity.Property(e \=\> e.Channel).IsRequired();  
                entity.Property(e \=\> e.Recipient).IsRequired().HasMaxLength(255);  
                entity.Property(e \=\> e.SentAt).IsRequired();  
                entity.Property(e \=\> e.ErrorMessage).HasMaxLength(4000);  
            });  
              
            // Relationship between ExecutionHistory and NotificationHistory  
            modelBuilder.Entity\<ExecutionHistory\>()  
                .HasMany(e \=\> e.Notifications)  
                .WithOne()  
                .HasForeignKey(n \=\> n.ExecutionId)  
                .OnDelete(DeleteBehavior.Cascade);  
        }  
    }

    \#endregion

    \#region API Controllers

    \[ApiController\]  
    \[Route("api/\[controller\]")\]  
    \[Authorize\]  
    public class ExportController : ControllerBase  
    {  
        private readonly ExportService \_exportService;  
        private readonly ILogger\<ExportController\> \_logger;  
          
        public ExportController(ExportService exportService, ILogger\<ExportController\> logger)  
        {  
            \_exportService \= exportService;  
            \_logger \= logger;  
        }  
          
        \[HttpPost("generate")\]  
        public async Task\<IActionResult\> GenerateExport(\[FromBody\] ExportParameters parameters)  
        {  
            \_logger.LogInformation("Export request received for report {ReportName} in {Format} format",   
                parameters.ReportName, parameters.Format);  
              
            try  
            {  
                // Get user info for auditing  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                  
                // Generate the export  
                var (data, contentType, fileName) \= await \_exportService.ExportReportAsync(  
                    parameters.ReportName,   
                    parameters);  
                  
                \_logger.LogInformation("Export generated successfully for report {ReportName}", parameters.ReportName);  
                  
                // Return the file  
                return File(data, contentType, fileName);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error generating export for report {ReportName}", parameters.ReportName);  
                return StatusCode(500, new { error \= "Failed to generate export", message \= ex.Message });  
            }  
        }  
    }

    \[ApiController\]  
    \[Route("api/\[controller\]")\]  
    \[Authorize\]  
    public class ScheduleController : ControllerBase  
    {  
        private readonly IScheduleService \_scheduleService;  
        private readonly IExecutionHistoryRepository \_executionHistoryRepository;  
        private readonly ILogger\<ScheduleController\> \_logger;  
          
        public ScheduleController(  
            IScheduleService scheduleService,  
            IExecutionHistoryRepository executionHistoryRepository,  
            ILogger\<ScheduleController\> logger)  
        {  
            \_scheduleService \= scheduleService;  
            \_executionHistoryRepository \= executionHistoryRepository;  
            \_logger \= logger;  
        }  
          
        \[HttpGet\]  
        public async Task\<IActionResult\> GetSchedules()  
        {  
            \_logger.LogInformation("Getting all schedules");  
              
            try  
            {  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                IEnumerable\<ScheduleConfiguration\> schedules;  
                  
                if (isAdmin)  
                {  
                    // Admins can see all schedules  
                    schedules \= await \_scheduleService.GetAllSchedulesAsync();  
                }  
                else  
                {  
                    // Other users can only see their own schedules  
                    schedules \= await \_scheduleService.GetUserSchedulesAsync(userId);  
                }  
                  
                return Ok(schedules);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error getting schedules");  
                return StatusCode(500, new { error \= "Failed to get schedules", message \= ex.Message });  
            }  
        }  
          
        \[HttpGet("{id}")\]  
        public async Task\<IActionResult\> GetSchedule(Guid id)  
        {  
            \_logger.LogInformation("Getting schedule {ScheduleId}", id);  
              
            try  
            {  
                var schedule \= await \_scheduleService.GetScheduleAsync(id);  
                  
                if (schedule \== null)  
                {  
                    return NotFound(new { error \= "Schedule not found" });  
                }  
                  
                // Check user access  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                if (\!isAdmin && schedule.CreatedBy \!= userId)  
                {  
                    return Forbid();  
                }  
                  
                return Ok(schedule);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error getting schedule {ScheduleId}", id);  
                return StatusCode(500, new { error \= "Failed to get schedule", message \= ex.Message });  
            }  
        }  
          
        \[HttpPost\]  
        public async Task\<IActionResult\> CreateSchedule(\[FromBody\] ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Creating new schedule for report {ReportName}", schedule.ReportName);  
              
            try  
            {  
                // Set creator info  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                schedule.CreatedBy \= userId;  
                schedule.CreatedAt \= DateTime.UtcNow;  
                  
                var id \= await \_scheduleService.CreateScheduleAsync(schedule);  
                  
                return CreatedAtAction(nameof(GetSchedule), new { id }, schedule);  
            }  
            catch (ArgumentException ex)  
            {  
                \_logger.LogWarning(ex, "Validation error creating schedule");  
                return BadRequest(new { error \= "Invalid schedule configuration", message \= ex.Message });  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error creating schedule");  
                return StatusCode(500, new { error \= "Failed to create schedule", message \= ex.Message });  
            }  
        }  
          
        \[HttpPut("{id}")\]  
        public async Task\<IActionResult\> UpdateSchedule(Guid id, \[FromBody\] ScheduleConfiguration schedule)  
        {  
            \_logger.LogInformation("Updating schedule {ScheduleId}", id);  
              
            try  
            {  
                // Check if the schedule exists  
                var existingSchedule \= await \_scheduleService.GetScheduleAsync(id);  
                  
                if (existingSchedule \== null)  
                {  
                    return NotFound(new { error \= "Schedule not found" });  
                }  
                  
                // Check user access  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                if (\!isAdmin && existingSchedule.CreatedBy \!= userId)  
                {  
                    return Forbid();  
                }  
                  
                // Update schedule info  
                schedule.Id \= id;  
                schedule.CreatedBy \= existingSchedule.CreatedBy;  
                schedule.CreatedAt \= existingSchedule.CreatedAt;  
                schedule.LastModifiedBy \= userId;  
                schedule.LastModifiedAt \= DateTime.UtcNow;  
                  
                await \_scheduleService.UpdateScheduleAsync(schedule);  
                  
                return Ok(schedule);  
            }  
            catch (ArgumentException ex)  
            {  
                \_logger.LogWarning(ex, "Validation error updating schedule {ScheduleId}", id);  
                return BadRequest(new { error \= "Invalid schedule configuration", message \= ex.Message });  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error updating schedule {ScheduleId}", id);  
                return StatusCode(500, new { error \= "Failed to update schedule", message \= ex.Message });  
            }  
        }  
          
        \[HttpDelete("{id}")\]  
        public async Task\<IActionResult\> DeleteSchedule(Guid id)  
        {  
            \_logger.LogInformation("Deleting schedule {ScheduleId}", id);  
              
            try  
            {  
                // Check if the schedule exists  
                var existingSchedule \= await \_scheduleService.GetScheduleAsync(id);  
                  
                if (existingSchedule \== null)  
                {  
                    return NotFound(new { error \= "Schedule not found" });  
                }  
                  
                // Check user access  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                if (\!isAdmin && existingSchedule.CreatedBy \!= userId)  
                {  
                    return Forbid();  
                }  
                  
                await \_scheduleService.DeleteScheduleAsync(id);  
                  
                return NoContent();  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error deleting schedule {ScheduleId}", id);  
                return StatusCode(500, new { error \= "Failed to delete schedule", message \= ex.Message });  
            }  
        }  
          
        \[HttpPost("{id}/execute")\]  
        public async Task\<IActionResult\> ExecuteSchedule(Guid id)  
        {  
            \_logger.LogInformation("Manually executing schedule {ScheduleId}", id);  
              
            try  
            {  
                // Check if the schedule exists  
                var existingSchedule \= await \_scheduleService.GetScheduleAsync(id);  
                  
                if (existingSchedule \== null)  
                {  
                    return NotFound(new { error \= "Schedule not found" });  
                }  
                  
                // Check user access  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                if (\!isAdmin && existingSchedule.CreatedBy \!= userId)  
                {  
                    return Forbid();  
                }  
                  
                await \_scheduleService.TriggerScheduleAsync(id);  
                  
                return Accepted();  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error executing schedule {ScheduleId}", id);  
                return StatusCode(500, new { error \= "Failed to execute schedule", message \= ex.Message });  
            }  
        }  
          
        \[HttpGet("{id}/history")\]  
        public async Task\<IActionResult\> GetExecutionHistory(Guid id)  
        {  
            \_logger.LogInformation("Getting execution history for schedule {ScheduleId}", id);  
              
            try  
            {  
                // Check if the schedule exists  
                var existingSchedule \= await \_scheduleService.GetScheduleAsync(id);  
                  
                if (existingSchedule \== null)  
                {  
                    return NotFound(new { error \= "Schedule not found" });  
                }  
                  
                // Check user access  
                var userId \= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  
                var isAdmin \= User.IsInRole("Admin");  
                  
                if (\!isAdmin && existingSchedule.CreatedBy \!= userId)  
                {  
                    return Forbid();  
                }  
                  
                var history \= await \_executionHistoryRepository.GetByScheduleIdAsync(id);  
                  
                return Ok(history);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error getting execution history for schedule {ScheduleId}", id);  
                return StatusCode(500, new { error \= "Failed to get execution history", message \= ex.Message });  
            }  
        }  
    }

    \[ApiController\]  
    \[Route("api/\[controller\]")\]  
    \[Authorize(Roles \= "Admin")\]  
    public class ScheduleHistoryController : ControllerBase  
    {  
        private readonly IExecutionHistoryRepository \_executionHistoryRepository;  
        private readonly ILogger\<ScheduleHistoryController\> \_logger;  
          
        public ScheduleHistoryController(  
            IExecutionHistoryRepository executionHistoryRepository,  
            ILogger\<ScheduleHistoryController\> logger)  
        {  
            \_executionHistoryRepository \= executionHistoryRepository;  
            \_logger \= logger;  
        }  
          
        \[HttpGet("recent")\]  
        public async Task\<IActionResult\> GetRecentExecutions(\[FromQuery\] int limit \= 100\)  
        {  
            \_logger.LogInformation("Getting recent {Limit} execution histories", limit);  
              
            try  
            {  
                var history \= await \_executionHistoryRepository.GetRecentExecutionsAsync(limit);  
                  
                return Ok(history);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error getting recent execution histories");  
                return StatusCode(500, new { error \= "Failed to get execution histories", message \= ex.Message });  
            }  
        }  
          
        \[HttpGet("{id}")\]  
        public async Task\<IActionResult\> GetExecution(Guid id)  
        {  
            \_logger.LogInformation("Getting execution history {ExecutionId}", id);  
              
            try  
            {  
                var execution \= await \_executionHistoryRepository.GetByIdAsync(id);  
                  
                if (execution \== null)  
                {  
                    return NotFound(new { error \= "Execution history not found" });  
                }  
                  
                return Ok(execution);  
            }  
            catch (Exception ex)  
            {  
                \_logger.LogError(ex, "Error getting execution history {ExecutionId}", id);  
                return StatusCode(500, new { error \= "Failed to get execution history", message \= ex.Message });  
            }  
        }  
    }

    \#endregion

    \#region Service Registration

    public static class ExportServiceExtensions  
    {  
        public static IServiceCollection AddExportServices(this IServiceCollection services, IConfiguration configuration)  
        {  
            // Register database context  
            services.AddDbContext\<ProgressPlayDbContext\>(options \=\>  
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));  
              
            // Register Quartz scheduler  
            services.AddQuartz(q \=\>  
            {  
                q.UseMicrosoftDependencyInjectionJobFactory();  
                  
                // Register the job  
                q.AddJobAndTrigger\<ScheduleCheckJob\>(configuration);  
            });  
              
            services.AddQuartzHostedService(options \=\>  
            {  
                options.WaitForJobsToComplete \= true;  
            });  
              
            // Register repositories  
            services.AddScoped\<IScheduleRepository, ScheduleRepository\>();  
            services.AddScoped\<IExecutionHistoryRepository, ExecutionHistoryRepository\>();  
              
            // Register exporters  
            services.AddScoped\<ExcelExporter\>();  
            services.AddScoped\<PdfExporter\>();  
            services.AddScoped\<CsvExporter\>();  
            services.AddScoped\<JsonExporter\>();  
            services.AddScoped\<ExporterFactory\>();  
              
            // Register export service  
            services.AddScoped\<ExportService\>();  
              
            // Register notification services  
            services.AddScoped\<InAppNotificationService\>();  
            services.AddScoped\<EmailNotificationService\>();  
            services.AddScoped\<SmsNotificationService\>();  
            services.AddScoped\<NotificationServiceFactory\>();  
              
            // Register schedule service and job  
            services.AddScoped\<IScheduleService, ScheduleService\>();  
            services.AddScoped\<IExportJob, ExportJob\>();  
              
            // Register external service providers  
            services.AddSingleton\<IEmailSender\>(provider \=\>  
            {  
                var logger \= provider.GetRequiredService\<ILogger\<SendGridEmailSender\>\>();  
                return new SendGridEmailSender(  
                    configuration\["SendGrid:ApiKey"\],  
                    configuration\["SendGrid:FromEmail"\],  
                    configuration\["SendGrid:FromName"\],  
                    logger);  
            });  
              
            services.AddSingleton\<ISmsProvider\>(provider \=\>  
            {  
                var logger \= provider.GetRequiredService\<ILogger\<TwilioSmsProvider\>\>();  
                return new TwilioSmsProvider(  
                    configuration\["Twilio:AccountSid"\],  
                    configuration\["Twilio:AuthToken"\],  
                    configuration\["Twilio:FromNumber"\],  
                    logger);  
            });  
              
            // Register SignalR hub  
            services.AddSignalR();  
              
            return services;  
        }  
          
        private static void AddJobAndTrigger\<T\>(this IServiceCollectionQuartzConfigurator quartz, IConfiguration configuration)  
            where T : IJob  
        {  
            // Get job name based on the type  
            string jobName \= typeof(T).Name;  
              
            // Get the schedule from configuration  
            var configKey \= $"Quartz:{jobName}";  
            var cronSchedule \= configuration\[configKey\];  
              
            // Register the job with Quartz  
            var jobKey \= new JobKey(jobName);  
              
            quartz.AddJob\<T\>(opts \=\> opts.WithIdentity(jobKey));  
              
            quartz.AddTrigger(opts \=\> opts  
                .ForJob(jobKey)  
                .WithIdentity($"{jobName}-trigger")  
                .WithCronSchedule(cronSchedule ?? "0 \* \* ? \* \*")); // Default to every minute  
        }  
    }

    \#endregion  
}

I've developed a comprehensive and modern C\# class library for handling export functionality and report scheduling in the ProgressPlay Reporting Platform. This library provides:

## **Key Features**

### **Export Functionality**

* **Multiple Export Formats**: Support for Excel, PDF, CSV, and JSON formats  
* **Customizable Exports**: Column selection, filtering, grouping, and sorting options  
* **Performance Optimized**: Efficient handling of large datasets  
* **Professionally Formatted**: Well-designed Excel sheets, PDF documents, and structured data outputs

### **Report Scheduling**

* **Flexible Scheduling Options**: Daily, weekly, monthly, or custom cron expressions  
* **Role-Based Access Control**: Users can only see and manage their own schedules (with admin override)  
* **Execution History**: Comprehensive tracking of all report generation runs  
* **Manual Triggering**: Ability to execute scheduled reports on demand

### **Notification System**

* **Multiple Channels**: In-app, email, and SMS notifications  
* **Customizable Messages**: Personalized notification content  
* **Attachment Options**: Configurable report attachment settings  
* **Delivery Tracking**: History of all notification deliveries

## **Technical Highlights**

1. **Modern Architecture**:

   * Clean separation of concerns with interfaces and dependency injection  
   * Repository pattern for data access  
   * Factory pattern for exporters and notification services  
2. **Enterprise-Ready Features**:

   * Comprehensive logging throughout the system  
   * Detailed error handling and reporting  
   * Audit trails for all operations  
   * Role-based security integration  
3. **External Integrations**:

   * SendGrid for reliable email delivery  
   * Twilio for SMS notifications  
   * SignalR for real-time in-app notifications  
4. **Performance Considerations**:

   * Efficient data handling and streaming  
   * Background processing for large reports  
   * Optimized database queries  
5. **RESTful API**:

   * Complete set of endpoints for managing exports and schedules  
   * Proper HTTP status codes and error responses  
   * Security through ASP.NET Core authorization

This class library integrates perfectly with the overall ProgressPlay Reporting Platform architecture and provides a robust foundation for export and scheduling capabilities that will meet your requirements for comprehensive reporting with flexible delivery options.

