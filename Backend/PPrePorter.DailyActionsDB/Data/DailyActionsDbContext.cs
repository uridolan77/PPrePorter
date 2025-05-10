using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Database context for daily actions data
    /// </summary>
    public class DailyActionsDbContext : DbContext
    {
        private readonly ILogger<DailyActionsDbContext>? _logger;

        public DailyActionsDbContext(DbContextOptions<DailyActionsDbContext> options)
            : base(options)
        {
            // The SQL Server configuration is now handled in the AddDbContext call
            // in DailyActionsServiceRegistration.cs
        }

        public DailyActionsDbContext(
            DbContextOptions<DailyActionsDbContext> options,
            ILogger<DailyActionsDbContext> logger)
            : base(options)
        {
            _logger = logger;
        }

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

            // Configure SportBetEnhanced as a keyless entity
            // This is likely a view or a query result that doesn't have a primary key in the database
            // See: https://docs.microsoft.com/en-us/ef/core/modeling/keyless-entity-types
            modelBuilder.Entity<SportBetEnhanced>().HasNoKey();

            // Determine whether to use the common schema based on the connection string
            bool useCommonSchema = false;

            try
            {
                // Check if we're using the real database or the local database
                var connectionString = Database.GetConnectionString();
                if (connectionString != null && connectionString.Contains("185.64.56.157"))
                {
                    useCommonSchema = true;
                    _logger?.LogInformation("Using common schema for DailyActionsDB tables (real database)");
                }
                else
                {
                    useCommonSchema = false;
                    _logger?.LogInformation("Using dbo schema for DailyActionsDB tables (local database)");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error determining schema, using dbo schema for local database");
                useCommonSchema = false;
            }

            // Configure DailyAction entity
            modelBuilder.Entity<DailyAction>(entity =>
            {
                if (useCommonSchema)
                {
                    entity.ToTable("tbl_Daily_actions", schema: "common");
                }
                else
                {
                    entity.ToTable("DailyActions");
                }

                entity.HasKey(e => e.Id);

                // Create index on Date and WhiteLabelID for faster queries
                entity.HasIndex(e => new { e.Date, e.WhiteLabelID });

                // Configure money columns to use the money SQL Server type
                entity.Property(e => e.Deposits).HasColumnType("money");
                entity.Property(e => e.PaidCashouts).HasColumnType("money");
                entity.Property(e => e.BetsCasino).HasColumnType("money");
                entity.Property(e => e.WinsCasino).HasColumnType("money");
                entity.Property(e => e.BetsSport).HasColumnType("money");
                entity.Property(e => e.WinsSport).HasColumnType("money");
                entity.Property(e => e.BetsLive).HasColumnType("money");
                entity.Property(e => e.WinsLive).HasColumnType("money");
                entity.Property(e => e.BetsBingo).HasColumnType("money");
                entity.Property(e => e.WinsBingo).HasColumnType("money");

                // Relationship configuration removed for now
                // entity.HasOne(d => d.WhiteLabel)
                //       .WithMany(w => w.DailyActions)
                //       .HasForeignKey(d => d.WhiteLabelID)
                //       .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure WhiteLabel entity
            modelBuilder.Entity<WhiteLabel>(entity =>
            {
                if (useCommonSchema)
                {
                    entity.ToTable("tbl_White_labels", schema: "common");
                }
                else
                {
                    entity.ToTable("WhiteLabels");
                }

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);

                if (useCommonSchema)
                {
                    entity.Property(e => e.Url).IsRequired().HasMaxLength(100);
                    entity.Property(e => e.UrlName).HasMaxLength(50);
                    entity.Property(e => e.Code).HasMaxLength(50);
                    entity.Property(e => e.DefaultLanguage).HasMaxLength(50);
                }
            });

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

            // Configure Currency entity
            modelBuilder.Entity<Currency>(entity =>
            {
                if (useCommonSchema)
                {
                    entity.ToTable("tbl_Currencies", schema: "common");
                }
                else
                {
                    entity.ToTable("Currencies");
                }
                entity.HasKey(e => e.CurrencyID);
            });

            // Configure Country entity
            modelBuilder.Entity<Country>(entity =>
            {
                if (useCommonSchema)
                {
                    entity.ToTable("tbl_Countries", schema: "common");
                }
                else
                {
                    entity.ToTable("Countries");
                }
                entity.HasKey(e => e.CountryID);
            });
        }
    }
}
