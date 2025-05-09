using Microsoft.EntityFrameworkCore;
using PPrePorter.DailyActionsDB.Models;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Database context for daily actions data
    /// </summary>
    public class DailyActionsDbContext : DbContext
    {
        public DailyActionsDbContext(DbContextOptions<DailyActionsDbContext> options)
            : base(options)
        {
        }

        // Game-related entities
        public DbSet<Game> Games { get; set; }
        public DbSet<GameCasinoSession> GameCasinoSessions { get; set; }
        public DbSet<GameDescription> GameDescriptions { get; set; }
        public DbSet<GameExcludedByCountry> GameExcludedByCountries { get; set; }
        public DbSet<GameExcludedByJurisdiction> GameExcludedByJurisdictions { get; set; }
        public DbSet<GameExcludedByLabel> GameExcludedByLabels { get; set; }
        public DbSet<GameFreeSpinsOffer> GameFreeSpinsOffers { get; set; }

        // Sport-related entities
        public DbSet<SportBetEnhanced> SportBetsEnhanced { get; set; }
        public DbSet<SportBetState> SportBetStates { get; set; }
        public DbSet<SportBetType> SportBetTypes { get; set; }
        public DbSet<SportCompetition> SportCompetitions { get; set; }
        public DbSet<SportMarket> SportMarkets { get; set; }
        public DbSet<SportMatch> SportMatches { get; set; }
        public DbSet<SportOddsType> SportOddsTypes { get; set; }
        public DbSet<SportRegion> SportRegions { get; set; }
        public DbSet<SportSport> SportSports { get; set; }

        // Bonus-related entities
        public DbSet<Bonus> Bonuses { get; set; }
        public DbSet<BonusBalance> BonusBalances { get; set; }

        // Country and Currency entities
        public DbSet<Country> Countries { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<CurrencyHistory> CurrencyHistories { get; set; }

        // Daily Actions entities
        public DbSet<DailyAction> DailyActions { get; set; }
        public DbSet<DailyActionGame> DailyActionGames { get; set; }

        // Player-related entities
        public DbSet<Player> Players { get; set; }

        // Transaction-related entities
        public DbSet<Transaction> Transactions { get; set; }

        // Interaction-related entities
        public DbSet<Interaction> Interactions { get; set; }
        public DbSet<InteractionScore> InteractionScores { get; set; }

        // Other entities
        public DbSet<Leaderboard> Leaderboards { get; set; }
        public DbSet<WhiteLabel> WhiteLabels { get; set; }
        public DbSet<WithdrawalRequest> WithdrawalRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure DailyAction entity
            modelBuilder.Entity<DailyAction>(entity =>
            {
                entity.ToTable("DailyActions");
                entity.HasKey(e => e.Id);

                // Create index on Date and WhiteLabelID for faster queries
                entity.HasIndex(e => new { e.Date, e.WhiteLabelID });

                // Relationship configuration removed for now
                // entity.HasOne(d => d.WhiteLabel)
                //       .WithMany(w => w.DailyActions)
                //       .HasForeignKey(d => d.WhiteLabelID)
                //       .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure WhiteLabel entity - commented out for now
            /*
            modelBuilder.Entity<WhiteLabel>(entity =>
            {
                entity.ToTable("WhiteLabels");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(200);
            });
            */

            // Configure Transaction entity - commented out for now
            /*
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("DailyActionTransactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PlayerId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.WhitelabelId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.GameId).HasMaxLength(50);
                entity.Property(e => e.GameName).HasMaxLength(100);
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.TransactionType).HasMaxLength(50);
                entity.Property(e => e.Currency).HasMaxLength(10);

                // Create index on TransactionDate for faster queries
                entity.HasIndex(e => e.TransactionDate);
            });
            */
        }
    }
}
