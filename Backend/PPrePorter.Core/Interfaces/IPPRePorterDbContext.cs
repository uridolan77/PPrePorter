using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Core.Models.Reports;
using Dashboard = PPrePorter.Domain.Entities.PPReporter.Dashboard;

namespace PPrePorter.Core.Interfaces
{
    public interface IPPRePorterDbContext
    {
        DbSet<DailyAction> DailyActions { get; set; }
        DbSet<User> Users { get; set; }
        DbSet<Role> Roles { get; set; }
        DbSet<RolePermission> RolePermissions { get; set; }
        DbSet<UserPreference> UserPreferences { get; set; }
        DbSet<WhiteLabel> WhiteLabels { get; set; }
        DbSet<UserWhiteLabel> UserWhiteLabels { get; set; }
        DbSet<Game> Games { get; set; }
        DbSet<DailyActionGame> DailyActionsGames { get; set; }
        DbSet<Player> Players { get; set; }
        DbSet<Transaction> Transactions { get; set; }
        DbSet<ReportTemplate> ReportTemplates { get; set; }
        DbSet<GeneratedReport> GeneratedReports { get; set; }
        DbSet<ReportExport> ReportExports { get; set; }
        DbSet<object> Metadata { get; set; }
        DbSet<DataAnnotation> Annotations { get; set; }
        DbSet<SharedAnnotation> AnnotationShares { get; set; }
        DbSet<Dashboard.UserInteraction> UserInteractions { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}