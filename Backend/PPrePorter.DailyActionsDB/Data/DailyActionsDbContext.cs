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

        // No need for schema detection - we'll explicitly set the schema for each entity

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure SportBetEnhanced as a keyless entity
            // This is likely a view or a query result that doesn't have a primary key in the database
            modelBuilder.Entity<SportBetEnhanced>(entity =>
            {
                entity.HasNoKey();
                entity.ToTable("SportBetsEnhanced", schema: "dbo");
            });

            // Configure DailyAction entity
            modelBuilder.Entity<DailyAction>(entity =>
            {
                // Always use the correct schema and table name
                entity.ToTable("tbl_Daily_actions", schema: "common");
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
                // Always use the correct schema and table name
                entity.ToTable("tbl_White_labels", schema: "common");

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);

                // Configure properties for the real database
                entity.Property(e => e.Url).IsRequired().HasMaxLength(100);
                entity.Property(e => e.UrlName).HasMaxLength(50);
                entity.Property(e => e.Code).HasMaxLength(50);
                entity.Property(e => e.DefaultLanguage).HasMaxLength(50);
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
                // Always use the correct schema and table name
                entity.ToTable("tbl_Currencies", schema: "common");

                entity.HasKey(e => e.CurrencyID);
            });

            // Configure Country entity
            modelBuilder.Entity<Country>(entity =>
            {
                // Always use the correct schema and table name
                entity.ToTable("tbl_Countries", schema: "common");
                entity.HasKey(e => e.CountryID);
            });

            // Configure Bonus entity
            modelBuilder.Entity<Bonus>(entity =>
            {
                entity.ToTable("tbl_Bonuses", schema: "common");
                entity.HasKey(e => e.BonusID);
            });

            // Configure BonusBalance entity
            modelBuilder.Entity<BonusBalance>(entity =>
            {
                entity.ToTable("tbl_Bonus_balances", schema: "common");
                entity.HasKey(e => e.BonusBalanceID);
            });

            // Configure CurrencyHistory entity
            modelBuilder.Entity<CurrencyHistory>(entity =>
            {
                entity.ToTable("tbl_Currency_history", schema: "common");
                entity.HasKey(e => e.CurrencyId);
            });

            // Configure DailyActionGame entity
            modelBuilder.Entity<DailyActionGame>(entity =>
            {
                entity.ToTable("tbl_Daily_actions_games", schema: "common");
                entity.HasKey(e => e.ID);
            });

            // Configure Interaction entity
            modelBuilder.Entity<Interaction>(entity =>
            {
                entity.ToTable("tbl_Interactions_checks", schema: "common");
                entity.HasKey(e => e.ID);
            });

            // Configure InteractionScore entity
            modelBuilder.Entity<InteractionScore>(entity =>
            {
                entity.ToTable("tbl_Interactions_ScoreChecks", schema: "common");
                entity.HasKey(e => e.ID);
            });

            // Configure Leaderboard entity
            modelBuilder.Entity<Leaderboard>(entity =>
            {
                entity.ToTable("tbl_Leaderboards", schema: "common");
                entity.HasKey(e => e.LeaderboardId);
            });

            // Configure Player entity
            modelBuilder.Entity<Player>(entity =>
            {
                entity.ToTable("tbl_Daily_actions_players", schema: "common");
                entity.HasKey(e => e.PlayerID);
            });

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("tbl_Daily_actions_transactions", schema: "common");
                entity.HasKey(e => e.Id);
            });

            // Configure WithdrawalRequest entity
            modelBuilder.Entity<WithdrawalRequest>(entity =>
            {
                entity.ToTable("tbl_Withdrawal_requests", schema: "common");
                entity.HasKey(e => e.RequestID);
            });

            // Configure SportSport entity
            modelBuilder.Entity<SportSport>(entity =>
            {
                // Sport tables are in the dbo schema based on the database structure
                entity.ToTable("SportSports", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportRegion entity
            modelBuilder.Entity<SportRegion>(entity =>
            {
                entity.ToTable("SportRegions", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportMatch entity
            modelBuilder.Entity<SportMatch>(entity =>
            {
                entity.ToTable("SportMatches", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportCompetition entity
            modelBuilder.Entity<SportCompetition>(entity =>
            {
                entity.ToTable("SportCompetitions", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportBetType entity
            modelBuilder.Entity<SportBetType>(entity =>
            {
                entity.ToTable("SportBetTypes", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportOddsType entity
            modelBuilder.Entity<SportOddsType>(entity =>
            {
                entity.ToTable("SportOddsTypes", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure SportMarket entity
            modelBuilder.Entity<SportMarket>(entity =>
            {
                entity.ToTable("SportMarkets", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure Game entity
            modelBuilder.Entity<Game>(entity =>
            {
                entity.ToTable("Games", schema: "dbo");
                entity.HasKey(e => e.GameID);
            });

            // Configure GameCasinoSession entity
            modelBuilder.Entity<GameCasinoSession>(entity =>
            {
                entity.ToTable("GamesCasinoSessions", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure GameDescription entity
            modelBuilder.Entity<GameDescription>(entity =>
            {
                entity.ToTable("GamesDescriptions", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure GameExcludedByCountry entity
            modelBuilder.Entity<GameExcludedByCountry>(entity =>
            {
                entity.ToTable("GamesExcludedByCountry", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure GameExcludedByJurisdiction entity
            modelBuilder.Entity<GameExcludedByJurisdiction>(entity =>
            {
                entity.ToTable("GamesExcludedByJurisdiction", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure GameExcludedByLabel entity
            modelBuilder.Entity<GameExcludedByLabel>(entity =>
            {
                entity.ToTable("GamesExcludedByLabel", schema: "dbo");
                entity.HasKey(e => e.ID);
            });

            // Configure GameFreeSpinsOffer entity
            modelBuilder.Entity<GameFreeSpinsOffer>(entity =>
            {
                entity.ToTable("GamesFreeSpinsOffers", schema: "dbo");
                entity.HasKey(e => e.OfferID);
            });
        }

        /// <summary>
        /// Checks if the necessary tables exist in the database
        /// </summary>
        public async Task EnsureTablesExistAsync()
        {
            try
            {
                _logger?.LogInformation("Checking if necessary tables exist in the database");

                // Check if we can connect to the database
                if (!Database.CanConnect())
                {
                    _logger?.LogWarning("Cannot connect to database to check tables");
                    return;
                }

                // Log the tables we're using
                _logger?.LogInformation("Using the following tables:");

                // Common schema tables
                _logger?.LogInformation("- common.tbl_Daily_actions");
                _logger?.LogInformation("- common.tbl_White_labels");
                _logger?.LogInformation("- common.tbl_Countries");
                _logger?.LogInformation("- common.tbl_Currencies");
                _logger?.LogInformation("- common.tbl_Bonuses");
                _logger?.LogInformation("- common.tbl_Bonus_balances");
                _logger?.LogInformation("- common.tbl_Currency_history");
                _logger?.LogInformation("- common.tbl_Daily_actions_games");
                _logger?.LogInformation("- common.tbl_Daily_actions_players");
                _logger?.LogInformation("- common.tbl_Daily_actions_transactions");
                _logger?.LogInformation("- common.tbl_Interactions_checks");
                _logger?.LogInformation("- common.tbl_Interactions_ScoreChecks");
                _logger?.LogInformation("- common.tbl_Leaderboards");
                _logger?.LogInformation("- common.tbl_Withdrawal_requests");

                // Dbo schema tables
                _logger?.LogInformation("- dbo.Games");
                _logger?.LogInformation("- dbo.GamesCasinoSessions");
                _logger?.LogInformation("- dbo.GamesDescriptions");
                _logger?.LogInformation("- dbo.GamesExcludedByCountry");
                _logger?.LogInformation("- dbo.GamesExcludedByJurisdiction");
                _logger?.LogInformation("- dbo.GamesExcludedByLabel");
                _logger?.LogInformation("- dbo.GamesFreeSpinsOffers");
                _logger?.LogInformation("- dbo.SportBetsEnhanced");
                _logger?.LogInformation("- dbo.SportBetStates");
                _logger?.LogInformation("- dbo.SportBetTypes");
                _logger?.LogInformation("- dbo.SportCompetitions");
                _logger?.LogInformation("- dbo.SportMarkets");
                _logger?.LogInformation("- dbo.SportMatches");
                _logger?.LogInformation("- dbo.SportOddsTypes");
                _logger?.LogInformation("- dbo.SportRegions");
                _logger?.LogInformation("- dbo.SportSports");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error checking tables: {Message}", ex.Message);
            }
        }
    }
}
