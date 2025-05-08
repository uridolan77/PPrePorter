using PPrePorter.SemanticLayer.Models.Database;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Gaming
{
    /// <summary>
    /// Provides the default data model for gaming analytics in ProgressPlay
    /// </summary>
    public static class GamingDataModel
    {
        /// <summary>
        /// Gets the default data model for ProgressPlay gaming analytics
        /// </summary>
        public static DataModel GetDefaultModel()
        {
            var model = new DataModel();
            
            // Add fact tables
            AddFactTables(model);
            
            // Add dimension tables
            AddDimensionTables(model);
            
            // Add relationships
            AddRelationships(model);
            
            // Add views
            AddViews(model);
            
            return model;
        }
        
        private static void AddFactTables(DataModel model)
        {
            // Game activity fact table - contains all gaming activities
            var gameActivity = new Table
            {
                Name = "GameActivity",
                Description = "Contains all gaming activity data",
                TableType = "Fact",
                Columns = new List<Column>
                {
                    new Column { Name = "ActivityID", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the activity" },
                    new Column { Name = "PlayerID", DataType = "int", IsForeignKey = true, ForeignKeyReference = "Player", Description = "Player who performed the activity" },
                    new Column { Name = "GameID", DataType = "int", IsForeignKey = true, ForeignKeyReference = "Game", Description = "Game that was played" },
                    new Column { Name = "EventDate", DataType = "datetime", Description = "Date and time of the activity" },
                    new Column { Name = "StakeAmount", DataType = "decimal", Description = "Amount staked by the player" },
                    new Column { Name = "WinAmount", DataType = "decimal", Description = "Amount won by the player" },
                    new Column { Name = "BonusAmount", DataType = "decimal", Description = "Bonus amount used in the activity" },
                    new Column { Name = "GGR", DataType = "decimal", Description = "Gross Gaming Revenue from the activity" },
                    new Column { Name = "NGR", DataType = "decimal", Description = "Net Gaming Revenue from the activity" },
                    new Column { Name = "DeviceType", DataType = "nvarchar", Description = "Type of device used" },
                    new Column { Name = "IsActive", DataType = "bit", Description = "Whether the player was active in this period" },
                    new Column { Name = "RoundID", DataType = "nvarchar", Description = "Identifier for the game round" }
                },
                PrimaryKeys = new List<string> { "ActivityID" }
            };
            model.Tables.Add(gameActivity);
            model.AddFactTable("GameActivity");
            
            // Transaction fact table - contains all financial transactions
            var transactions = new Table
            {
                Name = "Transactions",
                Description = "Contains all financial transaction data",
                TableType = "Fact",
                Columns = new List<Column>
                {
                    new Column { Name = "TransactionID", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the transaction" },
                    new Column { Name = "PlayerID", DataType = "int", IsForeignKey = true, ForeignKeyReference = "Player", Description = "Player who performed the transaction" },
                    new Column { Name = "TransactionDate", DataType = "datetime", Description = "Date and time of the transaction" },
                    new Column { Name = "TransactionType", DataType = "nvarchar", Description = "Type of transaction (deposit, withdrawal, etc.)" },
                    new Column { Name = "Amount", DataType = "decimal", Description = "Amount of the transaction" },
                    new Column { Name = "PaymentMethod", DataType = "nvarchar", Description = "Method of payment" },
                    new Column { Name = "Status", DataType = "nvarchar", Description = "Status of the transaction" },
                    new Column { Name = "IsFirstDeposit", DataType = "bit", Description = "Whether this is the player's first deposit" }
                },
                PrimaryKeys = new List<string> { "TransactionID" }
            };
            model.Tables.Add(transactions);
            model.AddFactTable("Transactions");
            
            // Bonus fact table - contains all bonus-related activities
            var bonuses = new Table
            {
                Name = "Bonuses",
                Description = "Contains all bonus-related data",
                TableType = "Fact",
                Columns = new List<Column>
                {
                    new Column { Name = "BonusID", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the bonus" },
                    new Column { Name = "PlayerID", DataType = "int", IsForeignKey = true, ForeignKeyReference = "Player", Description = "Player who received the bonus" },
                    new Column { Name = "BonusDate", DataType = "datetime", Description = "Date and time when the bonus was given" },
                    new Column { Name = "BonusType", DataType = "nvarchar", Description = "Type of bonus" },
                    new Column { Name = "BonusAmount", DataType = "decimal", Description = "Amount of the bonus" },
                    new Column { Name = "WageringRequirement", DataType = "decimal", Description = "Wagering requirement for the bonus" },
                    new Column { Name = "ExpiryDate", DataType = "datetime", Description = "Date when the bonus expires" },
                    new Column { Name = "CampaignName", DataType = "nvarchar", Description = "Name of the campaign that issued the bonus" }
                },
                PrimaryKeys = new List<string> { "BonusID" }
            };
            model.Tables.Add(bonuses);
            model.AddFactTable("Bonuses");
        }
        
        private static void AddDimensionTables(DataModel model)
        {
            // Player dimension table
            var player = new Table
            {
                Name = "Player",
                Description = "Contains player information",
                TableType = "Dimension",
                Columns = new List<Column>
                {
                    new Column { Name = "PlayerID", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the player" },
                    new Column { Name = "Username", DataType = "nvarchar", Description = "Player's username" },
                    new Column { Name = "RegistrationDate", DataType = "datetime", Description = "Date when the player registered" },
                    new Column { Name = "Country", DataType = "nvarchar", Description = "Player's country" },
                    new Column { Name = "Gender", DataType = "nvarchar", Description = "Player's gender" },
                    new Column { Name = "AgeGroup", DataType = "nvarchar", Description = "Player's age group" },
                    new Column { Name = "PlayerSegment", DataType = "nvarchar", Description = "Player's segment (VIP, Regular, etc.)" },
                    new Column { Name = "IsNewPlayer", DataType = "bit", Description = "Whether the player is new in the reporting period" }
                },
                PrimaryKeys = new List<string> { "PlayerID" }
            };
            model.Tables.Add(player);
            model.AddDimensionTable("Player");
            
            // Game dimension table
            var game = new Table
            {
                Name = "Game",
                Description = "Contains game information",
                TableType = "Dimension",
                Columns = new List<Column>
                {
                    new Column { Name = "GameID", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the game" },
                    new Column { Name = "GameName", DataType = "nvarchar", Description = "Name of the game" },
                    new Column { Name = "GameType", DataType = "nvarchar", Description = "Type of game (Slots, Table Games, etc.)" },
                    new Column { Name = "Provider", DataType = "nvarchar", Description = "Provider of the game" },
                    new Column { Name = "ReleaseDate", DataType = "datetime", Description = "Date when the game was released" },
                    new Column { Name = "TheoreticalRTP", DataType = "decimal", Description = "Theoretical return to player percentage" }
                },
                PrimaryKeys = new List<string> { "GameID" }
            };
            model.Tables.Add(game);
            model.AddDimensionTable("Game");
            
            // Date dimension table
            var date = new Table
            {
                Name = "Date",
                Description = "Date dimension for time-based analysis",
                TableType = "Dimension",
                Columns = new List<Column>
                {
                    new Column { Name = "DateKey", DataType = "int", IsPrimaryKey = true, Description = "Unique identifier for the date (YYYYMMDD format)" },
                    new Column { Name = "Date", DataType = "datetime", Description = "Calendar date" },
                    new Column { Name = "Day", DataType = "int", Description = "Day of the month" },
                    new Column { Name = "Month", DataType = "int", Description = "Month of the year" },
                    new Column { Name = "Year", DataType = "int", Description = "Calendar year" },
                    new Column { Name = "Quarter", DataType = "int", Description = "Calendar quarter" },
                    new Column { Name = "DayOfWeek", DataType = "int", Description = "Day of the week" },
                    new Column { Name = "IsWeekend", DataType = "bit", Description = "Whether the day is a weekend" },
                    new Column { Name = "IsHoliday", DataType = "bit", Description = "Whether the day is a holiday" }
                },
                PrimaryKeys = new List<string> { "DateKey" }
            };
            model.Tables.Add(date);
            model.AddDimensionTable("Date");
        }
        
        private static void AddRelationships(DataModel model)
        {
            // GameActivity relationships
            model.Relationships.Add(new Relationship
            {
                Name = "FK_GameActivity_Player",
                FromTable = "GameActivity",
                FromColumn = "PlayerID",
                ToTable = "Player",
                ToColumn = "PlayerID",
                RelationshipType = "ManyToOne"
            });
            
            model.Relationships.Add(new Relationship
            {
                Name = "FK_GameActivity_Game",
                FromTable = "GameActivity",
                FromColumn = "GameID",
                ToTable = "Game",
                ToColumn = "GameID",
                RelationshipType = "ManyToOne"
            });
            
            model.Relationships.Add(new Relationship
            {
                Name = "FK_GameActivity_Date",
                FromTable = "GameActivity",
                FromColumn = "EventDate",
                ToTable = "Date",
                ToColumn = "Date",
                RelationshipType = "ManyToOne"
            });
            
            // Transactions relationships
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Transactions_Player",
                FromTable = "Transactions",
                FromColumn = "PlayerID",
                ToTable = "Player",
                ToColumn = "PlayerID",
                RelationshipType = "ManyToOne"
            });
            
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Transactions_Date",
                FromTable = "Transactions",
                FromColumn = "TransactionDate",
                ToTable = "Date",
                ToColumn = "Date",
                RelationshipType = "ManyToOne"
            });
            
            // Bonuses relationships
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Bonuses_Player",
                FromTable = "Bonuses",
                FromColumn = "PlayerID",
                ToTable = "Player",
                ToColumn = "PlayerID",
                RelationshipType = "ManyToOne"
            });
            
            model.Relationships.Add(new Relationship
            {
                Name = "FK_Bonuses_Date",
                FromTable = "Bonuses",
                FromColumn = "BonusDate",
                ToTable = "Date",
                ToColumn = "Date",
                RelationshipType = "ManyToOne"
            });
        }
        
        private static void AddViews(DataModel model)
        {
            // Daily performance view
            var dailyPerformanceView = new View
            {
                Name = "DailyPerformance",
                Description = "Daily aggregated performance metrics",
                IsMaterialized = true,
                SourceTables = new List<string> { "GameActivity", "Transactions", "Player", "Date" },
                Columns = new List<Column>
                {
                    new Column { Name = "Date", DataType = "datetime", Description = "Calendar date" },
                    new Column { Name = "TotalStakes", DataType = "decimal", Description = "Total amount staked" },
                    new Column { Name = "TotalWins", DataType = "decimal", Description = "Total amount won by players" },
                    new Column { Name = "TotalBonuses", DataType = "decimal", Description = "Total bonuses given" },
                    new Column { Name = "GGR", DataType = "decimal", Description = "Gross Gaming Revenue" },
                    new Column { Name = "NGR", DataType = "decimal", Description = "Net Gaming Revenue" },
                    new Column { Name = "ActivePlayers", DataType = "int", Description = "Number of active players" },
                    new Column { Name = "NewPlayers", DataType = "int", Description = "Number of new players" },
                    new Column { Name = "TotalDeposits", DataType = "decimal", Description = "Total deposits" },
                    new Column { Name = "TotalWithdrawals", DataType = "decimal", Description = "Total withdrawals" },
                    new Column { Name = "RoundCount", DataType = "int", Description = "Number of game rounds" }
                },
                SqlDefinition = "SELECT " +
                                "CAST(ga.EventDate AS DATE) AS Date, " +
                                "SUM(ga.StakeAmount) AS TotalStakes, " +
                                "SUM(ga.WinAmount) AS TotalWins, " +
                                "SUM(ga.BonusAmount) AS TotalBonuses, " +
                                "SUM(ga.GGR) AS GGR, " +
                                "SUM(ga.NGR) AS NGR, " +
                                "COUNT(DISTINCT CASE WHEN ga.IsActive = 1 THEN ga.PlayerID END) AS ActivePlayers, " +
                                "COUNT(DISTINCT CASE WHEN p.IsNewPlayer = 1 THEN p.PlayerID END) AS NewPlayers, " +
                                "SUM(CASE WHEN t.TransactionType = 'Deposit' THEN t.Amount ELSE 0 END) AS TotalDeposits, " +
                                "SUM(CASE WHEN t.TransactionType = 'Withdrawal' THEN t.Amount ELSE 0 END) AS TotalWithdrawals, " +
                                "COUNT(DISTINCT ga.RoundID) AS RoundCount " +
                                "FROM GameActivity ga " +
                                "JOIN Player p ON ga.PlayerID = p.PlayerID " +
                                "LEFT JOIN Transactions t ON ga.PlayerID = t.PlayerID AND CAST(ga.EventDate AS DATE) = CAST(t.TransactionDate AS DATE) " +
                                "GROUP BY CAST(ga.EventDate AS DATE)",
                RefreshSchedule = "DAILY"
            };
            model.Views.Add(dailyPerformanceView);
            
            // Game performance view
            var gamePerformanceView = new View
            {
                Name = "GamePerformance",
                Description = "Performance metrics by game",
                IsMaterialized = true,
                SourceTables = new List<string> { "GameActivity", "Game" },
                Columns = new List<Column>
                {
                    new Column { Name = "GameID", DataType = "int", Description = "Game identifier" },
                    new Column { Name = "GameName", DataType = "nvarchar", Description = "Game name" },
                    new Column { Name = "GameType", DataType = "nvarchar", Description = "Game type" },
                    new Column { Name = "Provider", DataType = "nvarchar", Description = "Game provider" },
                    new Column { Name = "TotalStakes", DataType = "decimal", Description = "Total amount staked" },
                    new Column { Name = "TotalWins", DataType = "decimal", Description = "Total amount won by players" },
                    new Column { Name = "GGR", DataType = "decimal", Description = "Gross Gaming Revenue" },
                    new Column { Name = "RoundCount", DataType = "int", Description = "Number of game rounds" },
                    new Column { Name = "UniquePlayersCount", DataType = "int", Description = "Number of unique players" },
                    new Column { Name = "AverageStake", DataType = "decimal", Description = "Average stake per round" },
                    new Column { Name = "HoldPercentage", DataType = "decimal", Description = "Hold percentage" }
                },
                SqlDefinition = "SELECT " +
                                "ga.GameID, " +
                                "g.GameName, " +
                                "g.GameType, " +
                                "g.Provider, " +
                                "SUM(ga.StakeAmount) AS TotalStakes, " +
                                "SUM(ga.WinAmount) AS TotalWins, " +
                                "SUM(ga.GGR) AS GGR, " +
                                "COUNT(DISTINCT ga.RoundID) AS RoundCount, " +
                                "COUNT(DISTINCT ga.PlayerID) AS UniquePlayersCount, " +
                                "CASE WHEN COUNT(DISTINCT ga.RoundID) > 0 THEN SUM(ga.StakeAmount) / COUNT(DISTINCT ga.RoundID) ELSE 0 END AS AverageStake, " +
                                "CASE WHEN SUM(ga.StakeAmount) > 0 THEN (SUM(ga.StakeAmount) - SUM(ga.WinAmount)) / SUM(ga.StakeAmount) * 100 ELSE 0 END AS HoldPercentage " +
                                "FROM GameActivity ga " +
                                "JOIN Game g ON ga.GameID = g.GameID " +
                                "GROUP BY ga.GameID, g.GameName, g.GameType, g.Provider",
                RefreshSchedule = "DAILY"
            };
            model.Views.Add(gamePerformanceView);
            
            // Player performance view
            var playerPerformanceView = new View
            {
                Name = "PlayerPerformance",
                Description = "Performance metrics by player",
                IsMaterialized = true,
                SourceTables = new List<string> { "GameActivity", "Transactions", "Player" },
                Columns = new List<Column>
                {
                    new Column { Name = "PlayerID", DataType = "int", Description = "Player identifier" },
                    new Column { Name = "PlayerSegment", DataType = "nvarchar", Description = "Player segment" },
                    new Column { Name = "Country", DataType = "nvarchar", Description = "Player's country" },
                    new Column { Name = "TotalStakes", DataType = "decimal", Description = "Total amount staked" },
                    new Column { Name = "TotalWins", DataType = "decimal", Description = "Total amount won" },
                    new Column { Name = "TotalBonuses", DataType = "decimal", Description = "Total bonuses received" },
                    new Column { Name = "GGR", DataType = "decimal", Description = "Gross Gaming Revenue" },
                    new Column { Name = "TotalDeposits", DataType = "decimal", Description = "Total deposits" },
                    new Column { Name = "TotalWithdrawals", DataType = "decimal", Description = "Total withdrawals" },
                    new Column { Name = "RoundCount", DataType = "int", Description = "Number of game rounds" },
                    new Column { Name = "LastActivityDate", DataType = "datetime", Description = "Date of last activity" }
                },
                SqlDefinition = "SELECT " +
                                "p.PlayerID, " +
                                "p.PlayerSegment, " +
                                "p.Country, " +
                                "SUM(ga.StakeAmount) AS TotalStakes, " +
                                "SUM(ga.WinAmount) AS TotalWins, " +
                                "SUM(ga.BonusAmount) AS TotalBonuses, " +
                                "SUM(ga.GGR) AS GGR, " +
                                "SUM(CASE WHEN t.TransactionType = 'Deposit' THEN t.Amount ELSE 0 END) AS TotalDeposits, " +
                                "SUM(CASE WHEN t.TransactionType = 'Withdrawal' THEN t.Amount ELSE 0 END) AS TotalWithdrawals, " +
                                "COUNT(DISTINCT ga.RoundID) AS RoundCount, " +
                                "MAX(ga.EventDate) AS LastActivityDate " +
                                "FROM Player p " +
                                "LEFT JOIN GameActivity ga ON p.PlayerID = ga.PlayerID " +
                                "LEFT JOIN Transactions t ON p.PlayerID = t.PlayerID " +
                                "GROUP BY p.PlayerID, p.PlayerSegment, p.Country",
                RefreshSchedule = "DAILY"
            };
            model.Views.Add(playerPerformanceView);
        }
    }
}