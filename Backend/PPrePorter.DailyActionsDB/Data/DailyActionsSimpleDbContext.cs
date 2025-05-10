using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Simplified database context for daily actions data
    /// </summary>
    public class DailyActionsSimpleDbContext : DbContext
    {
        private readonly ILogger<DailyActionsSimpleDbContext>? _logger;

        public DailyActionsSimpleDbContext(DbContextOptions<DailyActionsSimpleDbContext> options)
            : base(options)
        {
            // Try to get logger from service provider if available
            try
            {
                var serviceProvider = options.FindExtension<CoreOptionsExtension>()?.ApplicationServiceProvider;
                if (serviceProvider != null)
                {
                    _logger = serviceProvider.GetRequiredService<ILoggerFactory>()
                        .CreateLogger<DailyActionsSimpleDbContext>();
                }
            }
            catch
            {
                // Ignore errors when trying to get the logger
            }
        }

        // Main entities
        public DbSet<DailyActionSimple> DailyActions { get; set; }
        public DbSet<DailyActionGame> DailyActionGames { get; set; }
        public DbSet<WhiteLabel> WhiteLabels { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }

        // Override SaveChanges to add logging
        public override int SaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in SaveChanges");
                throw;
            }
        }

        // Override SaveChangesAsync to add logging
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in SaveChangesAsync");
                throw;
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure DailyActionSimple entity
            modelBuilder.Entity<DailyActionSimple>(entity =>
            {
                entity.ToTable("tbl_Daily_actions", schema: "common");
                entity.HasKey(e => e.Id);

                // Create index on Date and WhiteLabelID for faster queries
                entity.HasIndex(e => new { e.Date, e.WhiteLabelID });
            });
        }
    }
}
