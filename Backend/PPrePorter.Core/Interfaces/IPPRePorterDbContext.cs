using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Core.Models.Reports;

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

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}