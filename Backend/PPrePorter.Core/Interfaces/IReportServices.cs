using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Core.Models.Reports;
using PPrePorter.API.Features.Reports.Models;

namespace PPrePorter.Core.Interfaces
{
    public interface IReportService
    {
        Task<ReportResultDto> GenerateReportAsync(ReportRequestDto request, string userId);
        Task<ReportResultDto> GetReportAsync(string reportId, string userId);
        Task<ExportResultDto> ExportReportAsync(string reportId, string format, User user);
        Task<List<GeneratedReport>> GetRecentReportsAsync(string userId, int limit = 10);
    }

    public interface IReportConfigurationService
    {
        Task<List<ReportTemplate>> GetAvailableReportTemplatesAsync(User user);
        Task<List<ReportConfiguration>> GetSavedConfigurationsAsync(string userId);
        Task<ReportConfiguration> GetConfigurationByIdAsync(string configId);
        Task<ReportConfiguration> SaveConfigurationAsync(ReportConfiguration configuration);
        Task UpdateConfigurationAsync(ReportConfiguration configuration);
        Task DeleteConfigurationAsync(string configId, string userId);
        Task<List<ScheduledReport>> GetScheduledReportsAsync(string userId);
        Task<ScheduledReport> ScheduleReportAsync(ScheduledReport scheduledReport);
        Task UpdateScheduledReportAsync(ScheduledReport scheduledReport);
        Task DeleteScheduledReportAsync(string scheduleId, string userId);
        Task<List<ReportExecution>> GetReportExecutionsAsync(string scheduleId, int limit = 10);
    }
}