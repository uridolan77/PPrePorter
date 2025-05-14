using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a summary of dashboard data
    /// </summary>
    public class DashboardSummary
    {
        /// <summary>
        /// Total revenue for the period
        /// </summary>
        public decimal TotalRevenue { get; set; }

        /// <summary>
        /// Revenue change percentage compared to previous period
        /// </summary>
        public decimal RevenueChangePercentage { get; set; }

        /// <summary>
        /// Revenue change compared to previous period
        /// </summary>
        public decimal RevenueChange { get; set; }

        /// <summary>
        /// Total number of players for the period
        /// </summary>
        public int TotalPlayers { get; set; }

        /// <summary>
        /// Player count change percentage compared to previous period
        /// </summary>
        public decimal PlayerChangePercentage { get; set; }

        /// <summary>
        /// Total number of new registrations for the period
        /// </summary>
        public int TotalRegistrations { get; set; }

        /// <summary>
        /// Registration count change percentage compared to previous period
        /// </summary>
        public decimal RegistrationChangePercentage { get; set; }

        /// <summary>
        /// Registrations change compared to previous period
        /// </summary>
        public decimal RegistrationsChange { get; set; }

        /// <summary>
        /// Total number of transactions for the period
        /// </summary>
        public int TotalTransactions { get; set; }

        /// <summary>
        /// Transaction count change percentage compared to previous period
        /// </summary>
        public decimal TransactionChangePercentage { get; set; }

        /// <summary>
        /// Total deposits for the period
        /// </summary>
        public decimal TotalDeposits { get; set; }

        /// <summary>
        /// Deposit amount change percentage compared to previous period
        /// </summary>
        public decimal DepositChangePercentage { get; set; }

        /// <summary>
        /// Total withdrawals for the period
        /// </summary>
        public decimal TotalWithdrawals { get; set; }

        /// <summary>
        /// Withdrawal amount change percentage compared to previous period
        /// </summary>
        public decimal WithdrawalChangePercentage { get; set; }

        /// <summary>
        /// Average revenue per player
        /// </summary>
        public decimal AverageRevenuePerPlayer { get; set; }

        /// <summary>
        /// Average revenue per player change percentage compared to previous period
        /// </summary>
        public decimal AverageRevenuePerPlayerChangePercentage { get; set; }

        /// <summary>
        /// Average deposit amount
        /// </summary>
        public decimal AverageDepositAmount { get; set; }

        /// <summary>
        /// Average withdrawal amount
        /// </summary>
        public decimal AverageWithdrawalAmount { get; set; }

        /// <summary>
        /// Number of active players
        /// </summary>
        public int ActivePlayers { get; set; }

        /// <summary>
        /// Conversion rate (registrations to FTD)
        /// </summary>
        public decimal ConversionRate { get; set; }

        /// <summary>
        /// Total first-time deposits
        /// </summary>
        public int FTD { get; set; }

        /// <summary>
        /// First-time deposits change compared to previous period
        /// </summary>
        public decimal FTDChange { get; set; }

        /// <summary>
        /// Revenue (alias for TotalRevenue)
        /// </summary>
        public decimal Revenue { get; set; }

        /// <summary>
        /// Registrations (alias for TotalRegistrations)
        /// </summary>
        public int Registrations { get; set; }

        /// <summary>
        /// Top performing games by revenue
        /// </summary>
        public List<TopGameItem> TopGames { get; set; } = new List<TopGameItem>();

        /// <summary>
        /// Top countries by player count
        /// </summary>
        public List<TopCountryItem> TopCountries { get; set; } = new List<TopCountryItem>();

        /// <summary>
        /// Start date of the period
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the period
        /// </summary>
        public DateTime EndDate { get; set; }
    }
}
