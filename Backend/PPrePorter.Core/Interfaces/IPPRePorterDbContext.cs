using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Models.Entities;
using PPrePorter.Core.Models.Metadata;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Core.Models.Reports;
using CoreEntities = PPrePorter.Core.Models.Entities;
using DomainEntities = PPrePorter.Domain.Entities.PPReporter;
using Dashboard = PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    public interface IPPRePorterDbContext
    {
        DbSet<CoreEntities.DailyAction> DailyActions { get; set; }
        DbSet<DomainEntities.User> Users { get; set; }
        DbSet<DomainEntities.Role> Roles { get; set; }
        DbSet<DomainEntities.RolePermission> RolePermissions { get; set; }
        DbSet<DomainEntities.UserPreference> UserPreferences { get; set; }
        DbSet<DomainEntities.WhiteLabel> WhiteLabels { get; set; }
        DbSet<DomainEntities.UserWhiteLabel> UserWhiteLabels { get; set; }
        DbSet<DomainEntities.Game> Games { get; set; }
        DbSet<DomainEntities.DailyActionGame> DailyActionsGames { get; set; }
        DbSet<CoreEntities.Player> Players { get; set; }
        DbSet<DomainEntities.Transaction> Transactions { get; set; }
        DbSet<ReportTemplate> ReportTemplates { get; set; }
        DbSet<GeneratedReport> GeneratedReports { get; set; }
        DbSet<ReportExport> ReportExports { get; set; }
        DbSet<object> Metadata { get; set; }
        DbSet<DailyActionsMetadataItem> DailyActionsMetadata { get; set; }
        DbSet<Dashboard.DataAnnotation> Annotations { get; set; }
        DbSet<Dashboard.SharedAnnotation> AnnotationShares { get; set; }
        DbSet<Dashboard.UserInteraction> UserInteractions { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}