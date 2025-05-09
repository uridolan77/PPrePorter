using Microsoft.EntityFrameworkCore;
using PPrePorter.DailyActionsDB.Models;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Simplified database context for daily actions data
    /// </summary>
    public class DailyActionsSimpleDbContext : DbContext
    {
        public DailyActionsSimpleDbContext(DbContextOptions<DailyActionsSimpleDbContext> options)
            : base(options)
        {
        }

        // Main entities
        public DbSet<DailyActionSimple> DailyActions { get; set; }
        public DbSet<DailyActionGame> DailyActionGames { get; set; }
        public DbSet<WhiteLabel> WhiteLabels { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure DailyActionSimple entity
            modelBuilder.Entity<DailyActionSimple>(entity =>
            {
                entity.ToTable("DailyActions");
                entity.HasKey(e => e.Id);

                // Create index on Date and WhiteLabelID for faster queries
                entity.HasIndex(e => new { e.Date, e.WhiteLabelID });
            });
        }
    }
}
