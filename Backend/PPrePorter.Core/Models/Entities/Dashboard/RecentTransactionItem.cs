using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a recent transaction data point for the dashboard
    /// </summary>
    public class RecentTransactionItem
    {
        /// <summary>
        /// Transaction ID
        /// </summary>
        public int TransactionId { get; set; }

        /// <summary>
        /// Player ID
        /// </summary>
        public int PlayerId { get; set; }

        /// <summary>
        /// Player username
        /// </summary>
        public string PlayerUsername { get; set; }

        /// <summary>
        /// Transaction date and time
        /// </summary>
        public DateTime TransactionDate { get; set; }

        /// <summary>
        /// Transaction type (e.g., "deposit", "withdrawal", "bet", "win")
        /// </summary>
        public string TransactionType { get; set; }

        /// <summary>
        /// Transaction amount
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Transaction currency
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Transaction status
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Payment method (if applicable)
        /// </summary>
        public string PaymentMethod { get; set; }

        /// <summary>
        /// Payment provider (if applicable)
        /// </summary>
        public string PaymentProvider { get; set; }

        /// <summary>
        /// Game ID (if applicable)
        /// </summary>
        public int? GameId { get; set; }

        /// <summary>
        /// Game name (if applicable)
        /// </summary>
        public string GameName { get; set; }

        /// <summary>
        /// White label ID
        /// </summary>
        public int WhiteLabelId { get; set; }

        /// <summary>
        /// White label name
        /// </summary>
        public string WhiteLabelName { get; set; }

        /// <summary>
        /// Country code
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Country name
        /// </summary>
        public string CountryName { get; set; }
    }
}
