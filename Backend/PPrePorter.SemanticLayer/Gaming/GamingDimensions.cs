using PPrePorter.SemanticLayer.Models.Entities;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Gaming
{
    /// <summary>
    /// Default gaming dimensions for the semantic layer
    /// </summary>
    public static class GamingDimensions
    {
        /// <summary>
        /// Gets all gaming dimensions
        /// </summary>
        public static List<DimensionDefinition> GetAllDimensions()
        {
            return new List<DimensionDefinition>
            {
                // Time dimensions
                new DimensionDefinition
                {
                    Name = "Date",
                    Description = "Calendar date",
                    DatabaseField = "UserSessions.SessionDate",
                    DataType = "date",
                    Category = "Time",
                    Synonyms = new[] { "day", "calendar date", "session date" }
                },
                
                new DimensionDefinition
                {
                    Name = "Time",
                    Description = "Time of day",
                    DatabaseField = "UserSessions.SessionTime",
                    DataType = "time",
                    Category = "Time",
                    Synonyms = new[] { "hour", "time of day", "session time" }
                },
                
                new DimensionDefinition
                {
                    Name = "Day of Week",
                    Description = "Day of the week (Monday, Tuesday, etc.)",
                    DatabaseField = "DATEPART(weekday, UserSessions.SessionDate)",
                    DataType = "string",
                    Category = "Time",
                    Synonyms = new[] { "weekday", "day name", "day" }
                },
                
                new DimensionDefinition
                {
                    Name = "Month",
                    Description = "Month of the year",
                    DatabaseField = "DATEPART(month, UserSessions.SessionDate)",
                    DataType = "string",
                    Category = "Time",
                    Synonyms = new[] { "month name", "month of year" }
                },
                
                new DimensionDefinition
                {
                    Name = "Quarter",
                    Description = "Quarter of the year (Q1, Q2, Q3, Q4)",
                    DatabaseField = "DATEPART(quarter, UserSessions.SessionDate)",
                    DataType = "string",
                    Category = "Time",
                    Synonyms = new[] { "q1", "q2", "q3", "q4", "quarter of year" }
                },
                
                new DimensionDefinition
                {
                    Name = "Year",
                    Description = "Calendar year",
                    DatabaseField = "DATEPART(year, UserSessions.SessionDate)",
                    DataType = "integer",
                    Category = "Time",
                    Synonyms = new[] { "calendar year", "fiscal year" }
                },
                
                // User dimensions
                new DimensionDefinition
                {
                    Name = "User",
                    Description = "User identifier",
                    DatabaseField = "Users.UserID",
                    DataType = "string",
                    Category = "User",
                    Synonyms = new[] { "player", "account", "user id", "player id" }
                },
                
                new DimensionDefinition
                {
                    Name = "User Type",
                    Description = "Type of user (New, Returning, VIP, etc.)",
                    DatabaseField = "Users.UserType",
                    DataType = "string",
                    Category = "User",
                    Synonyms = new[] { "player type", "account type", "user category" }
                },
                
                new DimensionDefinition
                {
                    Name = "Registration Date",
                    Description = "Date when the user registered",
                    DatabaseField = "Users.RegistrationDate",
                    DataType = "date",
                    Category = "User",
                    Synonyms = new[] { "signup date", "join date", "account creation date" }
                },
                
                new DimensionDefinition
                {
                    Name = "Age",
                    Description = "User's age in years",
                    DatabaseField = "DATEDIFF(year, Users.BirthDate, GETDATE())",
                    DataType = "integer",
                    Category = "User",
                    Synonyms = new[] { "user age", "player age", "age group" }
                },
                
                new DimensionDefinition
                {
                    Name = "Gender",
                    Description = "User's gender",
                    DatabaseField = "Users.Gender",
                    DataType = "string",
                    Category = "User",
                    Synonyms = new[] { "user gender", "player gender", "sex" }
                },
                
                new DimensionDefinition
                {
                    Name = "Country",
                    Description = "User's country",
                    DatabaseField = "Users.Country",
                    DataType = "string",
                    Category = "User",
                    Synonyms = new[] { "user country", "player country", "nation", "location" }
                },
                
                new DimensionDefinition
                {
                    Name = "Language",
                    Description = "User's preferred language",
                    DatabaseField = "Users.Language",
                    DataType = "string",
                    Category = "User",
                    Synonyms = new[] { "user language", "player language", "preferred language" }
                },
                
                // Game dimensions
                new DimensionDefinition
                {
                    Name = "Game",
                    Description = "Game identifier",
                    DatabaseField = "Games.GameID",
                    DataType = "string",
                    Category = "Game",
                    Synonyms = new[] { "game name", "game title", "title" }
                },
                
                new DimensionDefinition
                {
                    Name = "Game Type",
                    Description = "Type of game (Slots, Poker, Roulette, etc.)",
                    DatabaseField = "Games.GameType",
                    DataType = "string",
                    Category = "Game",
                    Synonyms = new[] { "game category", "game genre", "genre" }
                },
                
                new DimensionDefinition
                {
                    Name = "Game Provider",
                    Description = "Provider of the game",
                    DatabaseField = "Games.Provider",
                    DataType = "string",
                    Category = "Game",
                    Synonyms = new[] { "studio", "developer", "game developer", "provider" }
                },
                
                new DimensionDefinition
                {
                    Name = "Game Version",
                    Description = "Version of the game",
                    DatabaseField = "Games.Version",
                    DataType = "string",
                    Category = "Game",
                    Synonyms = new[] { "version", "game version", "release" }
                },
                
                new DimensionDefinition
                {
                    Name = "Release Date",
                    Description = "Date when the game was released",
                    DatabaseField = "Games.ReleaseDate",
                    DataType = "date",
                    Category = "Game",
                    Synonyms = new[] { "game release date", "launch date", "publication date" }
                },
                
                // Platform dimensions
                new DimensionDefinition
                {
                    Name = "Platform",
                    Description = "Platform used (Web, iOS, Android, etc.)",
                    DatabaseField = "UserSessions.Platform",
                    DataType = "string",
                    Category = "Platform",
                    Synonyms = new[] { "device platform", "os", "system" }
                },
                
                new DimensionDefinition
                {
                    Name = "Device",
                    Description = "Device used (Desktop, Mobile, Tablet, etc.)",
                    DatabaseField = "UserSessions.Device",
                    DataType = "string",
                    Category = "Platform",
                    Synonyms = new[] { "device type", "hardware", "equipment" }
                },
                
                new DimensionDefinition
                {
                    Name = "Browser",
                    Description = "Browser used (Chrome, Safari, Firefox, etc.)",
                    DatabaseField = "UserSessions.Browser",
                    DataType = "string",
                    Category = "Platform",
                    Synonyms = new[] { "web browser", "browser type", "user agent" }
                },
                
                // Marketing dimensions
                new DimensionDefinition
                {
                    Name = "Campaign",
                    Description = "Marketing campaign identifier",
                    DatabaseField = "MarketingCampaigns.CampaignID",
                    DataType = "string",
                    Category = "Marketing",
                    Synonyms = new[] { "marketing campaign", "promotion", "ad campaign" }
                },
                
                new DimensionDefinition
                {
                    Name = "Campaign Type",
                    Description = "Type of marketing campaign",
                    DatabaseField = "MarketingCampaigns.CampaignType",
                    DataType = "string",
                    Category = "Marketing",
                    Synonyms = new[] { "campaign category", "promotion type", "marketing type" }
                },
                
                new DimensionDefinition
                {
                    Name = "Source",
                    Description = "Traffic source",
                    DatabaseField = "Users.Source",
                    DataType = "string",
                    Category = "Marketing",
                    Synonyms = new[] { "traffic source", "acquisition source", "referrer" }
                },
                
                new DimensionDefinition
                {
                    Name = "Medium",
                    Description = "Marketing medium",
                    DatabaseField = "Users.Medium",
                    DataType = "string",
                    Category = "Marketing",
                    Synonyms = new[] { "traffic medium", "acquisition medium", "channel" }
                },
                
                // Payment dimensions
                new DimensionDefinition
                {
                    Name = "Payment Method",
                    Description = "Method of payment (Credit Card, PayPal, etc.)",
                    DatabaseField = "Transactions.PaymentMethod",
                    DataType = "string",
                    Category = "Payment",
                    Synonyms = new[] { "payment type", "transaction method", "deposit method" }
                },
                
                new DimensionDefinition
                {
                    Name = "Currency",
                    Description = "Currency used for transaction",
                    DatabaseField = "Transactions.Currency",
                    DataType = "string",
                    Category = "Payment",
                    Synonyms = new[] { "transaction currency", "money type", "monetary unit" }
                },
                
                new DimensionDefinition
                {
                    Name = "Transaction Type",
                    Description = "Type of transaction (Deposit, Withdrawal, Bet, Win, etc.)",
                    DatabaseField = "Transactions.TransactionType",
                    DataType = "string",
                    Category = "Payment",
                    Synonyms = new[] { "transaction category", "payment type", "financial operation" }
                },
                
                // Gameplay dimensions
                new DimensionDefinition
                {
                    Name = "Bet Level",
                    Description = "Level of bet (Low, Medium, High)",
                    DatabaseField = "GamePlays.BetLevel",
                    DataType = "string",
                    Category = "Gameplay",
                    Synonyms = new[] { "stake level", "wager level", "betting tier" }
                },
                
                new DimensionDefinition
                {
                    Name = "Game Result",
                    Description = "Result of game (Win, Loss, Draw)",
                    DatabaseField = "GamePlays.Result",
                    DataType = "string",
                    Category = "Gameplay",
                    Synonyms = new[] { "outcome", "game outcome", "result" }
                },
                
                // Bonus dimensions
                new DimensionDefinition
                {
                    Name = "Bonus Type",
                    Description = "Type of bonus (Welcome, Reload, Free Spins, etc.)",
                    DatabaseField = "Bonuses.BonusType",
                    DataType = "string",
                    Category = "Bonus",
                    Synonyms = new[] { "promotion type", "incentive type", "reward type" }
                },
                
                new DimensionDefinition
                {
                    Name = "Bonus Status",
                    Description = "Status of bonus (Active, Completed, Expired, etc.)",
                    DatabaseField = "Bonuses.Status",
                    DataType = "string",
                    Category = "Bonus",
                    Synonyms = new[] { "promotion status", "incentive status", "reward status" }
                }
            };
        }
    }
}