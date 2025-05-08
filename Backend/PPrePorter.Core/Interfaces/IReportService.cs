using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Core.Models.Reports;

namespace PPrePorter.Core.Interfaces
{
    public interface IReportService
    {
        // Report Templates
        Task<List<ReportTemplate>> GetReportTemplatesAsync(string userId, bool includeSystem = true);
        Task<ReportTemplate> GetReportTemplateByIdAsync(string templateId, string userId);
        Task<ReportTemplate> CreateReportTemplateAsync(ReportTemplate template, string userId);
        Task<ReportTemplate> UpdateReportTemplateAsync(string templateId, ReportTemplate template, string userId);
        Task<bool> DeleteReportTemplateAsync(string templateId, string userId);
        
        // Report Generation
        Task<GeneratedReport> GenerateReportAsync(string templateId, Dictionary<string, object> parameters, string userId);
        Task<GeneratedReport> GetGeneratedReportByIdAsync(string reportId, string userId);
        Task<List<GeneratedReport>> GetUserReportsAsync(string userId, int limit = 20, int offset = 0);
        Task<bool> DeleteGeneratedReportAsync(string reportId, string userId);
        
        // Report Exports
        Task<ReportExport> ExportReportAsync(string reportId, string format, string userId);
        Task<ReportExport> GetReportExportByIdAsync(string exportId, string userId);
        Task<List<ReportExport>> GetReportExportsAsync(string reportId, string userId);
        Task<bool> DeleteReportExportAsync(string exportId, string userId);
        
        // Scheduled Reports
        Task<ScheduledReport> ScheduleReportAsync(ScheduledReport scheduledReport);
        Task<ScheduledReport> GetScheduledReportByIdAsync(string scheduledReportId, string userId);
        Task<List<ScheduledReport>> GetUserScheduledReportsAsync(string userId);
        Task<ScheduledReport> UpdateScheduledReportAsync(string scheduledReportId, ScheduledReport scheduledReport, string userId);
        Task<bool> DeleteScheduledReportAsync(string scheduledReportId, string userId);
        Task<bool> ToggleScheduledReportStatusAsync(string scheduledReportId, bool isActive, string userId);
        
        // Categories
        Task<List<ReportTemplateCategory>> GetReportCategoriesAsync();
    }
}