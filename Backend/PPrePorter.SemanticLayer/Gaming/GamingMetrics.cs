using PPrePorter.SemanticLayer.Models.Entities;
using System.Collections.Generic;

namespace PPrePorter.SemanticLayer.Gaming
{
    /// <summary>
    /// Default gaming metrics for the semantic layer
    /// </summary>
    public static class GamingMetrics
    {
        /// <summary>
        /// Gets all gaming metrics
        /// </summary>
        public static List<MetricDefinition> GetAllMetrics()
        {
            return new List<MetricDefinition>
            {
                // Financial metrics
                new MetricDefinition
                {
                    Name = "Deposits",
                    Description = "Total amount deposited by users",
                    DatabaseField = "Transactions.Amount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "total deposits", "deposit amount", "money in" }
                },
                
                new MetricDefinition
                {
                    Name = "Withdrawals",
                    Description = "Total amount withdrawn by users",
                    DatabaseField = "Transactions.Amount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "total withdrawals", "withdrawal amount", "money out" }
                },
                
                new MetricDefinition
                {
                    Name = "Bets",
                    Description = "Total amount bet by users",
                    DatabaseField = "GamePlays.BetAmount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "total bets", "bet amount", "wagers", "stakes" }
                },
                
                new MetricDefinition
                {
                    Name = "Wins",
                    Description = "Total amount won by users",
                    DatabaseField = "GamePlays.WinAmount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "total wins", "win amount", "winnings" }
                },
                
                new MetricDefinition
                {
                    Name = "GGR",
                    Description = "Gross Gaming Revenue (Bets - Wins)",
                    DatabaseField = "GamePlays.BetAmount - GamePlays.WinAmount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "gross gaming revenue", "ggr", "gaming revenue", "house edge" }
                },
                
                new MetricDefinition
                {
                    Name = "Bonus Cost",
                    Description = "Total bonus amount given to users",
                    DatabaseField = "Bonuses.Amount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "bonus amount", "total bonuses", "promotions cost" }
                },
                
                new MetricDefinition
                {
                    Name = "NGR",
                    Description = "Net Gaming Revenue (GGR - Bonus Cost)",
                    DatabaseField = "(GamePlays.BetAmount - GamePlays.WinAmount) - Bonuses.Amount",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "net gaming revenue", "ngr", "net revenue" }
                },
                
                new MetricDefinition
                {
                    Name = "Average Bet",
                    Description = "Average bet amount per user",
                    DatabaseField = "GamePlays.BetAmount",
                    DefaultAggregation = "AVG",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Financial",
                    Synonyms = new[] { "avg bet", "mean bet", "average wager" }
                },
                
                // User metrics
                new MetricDefinition
                {
                    Name = "Active Users",
                    Description = "Number of active unique users",
                    DatabaseField = "Users.UserID",
                    DefaultAggregation = "COUNT_DISTINCT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "User",
                    Synonyms = new[] { "active players", "unique users", "distinct users" }
                },
                
                new MetricDefinition
                {
                    Name = "New Users",
                    Description = "Number of new user registrations",
                    DatabaseField = "Users.UserID",
                    DefaultAggregation = "COUNT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "User",
                    Synonyms = new[] { "new players", "new registrations", "signups" }
                },
                
                new MetricDefinition
                {
                    Name = "Returning Users",
                    Description = "Number of returning users",
                    DatabaseField = "Users.UserID",
                    DefaultAggregation = "COUNT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "User",
                    Synonyms = new[] { "returning players", "repeat users" }
                },
                
                new MetricDefinition
                {
                    Name = "User Balance",
                    Description = "Current user account balance",
                    DatabaseField = "Users.Balance",
                    DefaultAggregation = "SUM",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "User",
                    Synonyms = new[] { "account balance", "wallet balance", "player funds" }
                },
                
                // Engagement metrics
                new MetricDefinition
                {
                    Name = "Sessions",
                    Description = "Number of game sessions",
                    DatabaseField = "UserSessions.SessionID",
                    DefaultAggregation = "COUNT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "Engagement",
                    Synonyms = new[] { "game sessions", "visits", "logins" }
                },
                
                new MetricDefinition
                {
                    Name = "Session Duration",
                    Description = "Average session duration in minutes",
                    DatabaseField = "DATEDIFF(minute, UserSessions.StartTime, UserSessions.EndTime)",
                    DefaultAggregation = "AVG",
                    DataType = "time",
                    FormatString = "N2",
                    Category = "Engagement",
                    Synonyms = new[] { "avg session time", "play time", "engagement time" }
                },
                
                new MetricDefinition
                {
                    Name = "Game Rounds",
                    Description = "Number of game rounds played",
                    DatabaseField = "GamePlays.RoundID",
                    DefaultAggregation = "COUNT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "Engagement",
                    Synonyms = new[] { "rounds", "game plays", "spins", "hands" }
                },
                
                new MetricDefinition
                {
                    Name = "Average Rounds per Session",
                    Description = "Average number of game rounds per session",
                    DatabaseField = "GamePlays.RoundID",
                    DefaultAggregation = "AVG",
                    DataType = "decimal",
                    FormatString = "N2",
                    Category = "Engagement",
                    Synonyms = new[] { "avg rounds", "rounds per session", "session intensity" }
                },
                
                // Performance metrics
                new MetricDefinition
                {
                    Name = "RTP",
                    Description = "Return to Player percentage (Wins / Bets * 100)",
                    DatabaseField = "(GamePlays.WinAmount / GamePlays.BetAmount) * 100",
                    DefaultAggregation = "AVG",
                    DataType = "percentage",
                    FormatString = "P2",
                    Category = "Performance",
                    Synonyms = new[] { "return to player", "payout percentage", "win rate" }
                },
                
                new MetricDefinition
                {
                    Name = "House Edge",
                    Description = "House advantage percentage (100 - RTP)",
                    DatabaseField = "100 - ((GamePlays.WinAmount / GamePlays.BetAmount) * 100)",
                    DefaultAggregation = "AVG",
                    DataType = "percentage",
                    FormatString = "P2",
                    Category = "Performance",
                    Synonyms = new[] { "house advantage", "casino advantage", "edge" }
                },
                
                new MetricDefinition
                {
                    Name = "Hold Percentage",
                    Description = "GGR as a percentage of bets",
                    DatabaseField = "((GamePlays.BetAmount - GamePlays.WinAmount) / GamePlays.BetAmount) * 100",
                    DefaultAggregation = "AVG",
                    DataType = "percentage",
                    FormatString = "P2",
                    Category = "Performance",
                    Synonyms = new[] { "hold", "hold rate", "win percentage" }
                },
                
                // Conversion metrics
                new MetricDefinition
                {
                    Name = "Conversion Rate",
                    Description = "Percentage of users who made a deposit",
                    DatabaseField = "(COUNT(DISTINCT CASE WHEN Transactions.TransactionType = 'Deposit' THEN Users.UserID END) / COUNT(DISTINCT Users.UserID)) * 100",
                    DefaultAggregation = "AVG",
                    DataType = "percentage",
                    FormatString = "P2",
                    Category = "Conversion",
                    Synonyms = new[] { "deposit conversion", "deposit rate", "monetization rate" }
                },
                
                new MetricDefinition
                {
                    Name = "ARPU",
                    Description = "Average Revenue Per User",
                    DatabaseField = "(GamePlays.BetAmount - GamePlays.WinAmount)",
                    DefaultAggregation = "AVG",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Conversion",
                    Synonyms = new[] { "average revenue", "revenue per user", "user value" }
                },
                
                new MetricDefinition
                {
                    Name = "ARPPU",
                    Description = "Average Revenue Per Paying User",
                    DatabaseField = "(GamePlays.BetAmount - GamePlays.WinAmount)",
                    DefaultAggregation = "AVG",
                    DataType = "currency",
                    FormatString = "C2",
                    Category = "Conversion",
                    Synonyms = new[] { "paying user revenue", "revenue per paying user", "paying user value" }
                },
                
                // Bonus metrics
                new MetricDefinition
                {
                    Name = "Bonus Count",
                    Description = "Number of bonuses awarded",
                    DatabaseField = "Bonuses.BonusID",
                    DefaultAggregation = "COUNT",
                    DataType = "integer",
                    FormatString = "N0",
                    Category = "Bonus",
                    Synonyms = new[] { "number of bonuses", "bonus awards", "promotions count" }
                },
                
                new MetricDefinition
                {
                    Name = "Bonus Usage Rate",
                    Description = "Percentage of bonuses that were used",
                    DatabaseField = "(COUNT(CASE WHEN Bonuses.Status = 'Used' THEN Bonuses.BonusID END) / COUNT(Bonuses.BonusID)) * 100",
                    DefaultAggregation = "AVG",
                    DataType = "percentage",
                    FormatString = "P2",
                    Category = "Bonus",
                    Synonyms = new[] { "bonus usage", "promotion usage", "bonus consumption" }
                }
            };
        }
    }
}