using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a summary of dashboard data
    /// </summary>
    public class DashboardSummary
    {
        /// <summary>
        /// Date of the summary
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Total revenue
        /// </summary>
        public decimal TotalRevenue { get; set; }

        /// <summary>
        /// Total registrations
        /// </summary>
        public int TotalRegistrations { get; set; }

        /// <summary>
        /// Total deposits
        /// </summary>
        public int TotalDeposits { get; set; }

        /// <summary>
        /// Total withdrawals
        /// </summary>
        public int TotalWithdrawals { get; set; }

        /// <summary>
        /// Withdrawals change percentage
        /// </summary>
        public decimal WithdrawalsChange { get; set; }

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
        /// Conversion rate
        /// </summary>
        public decimal ConversionRate { get; set; }

        /// <summary>
        /// Registrations
        /// </summary>
        public int Registrations { get; set; }

        /// <summary>
        /// Registrations change percentage
        /// </summary>
        public decimal RegistrationsChange { get; set; }

        /// <summary>
        /// First time depositors
        /// </summary>
        public int FTD { get; set; }

        /// <summary>
        /// First time depositors change percentage
        /// </summary>
        public decimal FTDChange { get; set; }

        /// <summary>
        /// Deposits
        /// </summary>
        public decimal Deposits { get; set; }

        /// <summary>
        /// Deposits change percentage
        /// </summary>
        public decimal DepositsChange { get; set; }

        /// <summary>
        /// Cashouts
        /// </summary>
        public decimal Cashouts { get; set; }

        /// <summary>
        /// Cashouts change percentage
        /// </summary>
        public decimal CashoutsChange { get; set; }

        /// <summary>
        /// Bets
        /// </summary>
        public decimal Bets { get; set; }

        /// <summary>
        /// Bets change percentage
        /// </summary>
        public decimal BetsChange { get; set; }

        /// <summary>
        /// Wins
        /// </summary>
        public decimal Wins { get; set; }

        /// <summary>
        /// Wins change percentage
        /// </summary>
        public decimal WinsChange { get; set; }

        /// <summary>
        /// Revenue
        /// </summary>
        public decimal Revenue { get; set; }

        /// <summary>
        /// Revenue change percentage
        /// </summary>
        public decimal RevenueChange { get; set; }
    }
}