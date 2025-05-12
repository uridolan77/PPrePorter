using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Recent transaction item
    /// </summary>
    public class RecentTransactionItem
    {
        /// <summary>
        /// Transaction ID
        /// </summary>
        public long TransactionID { get; set; }

        /// <summary>
        /// Player ID
        /// </summary>
        public long PlayerID { get; set; }

        /// <summary>
        /// Player alias
        /// </summary>
        public string PlayerAlias { get; set; }

        /// <summary>
        /// White label
        /// </summary>
        public string WhiteLabel { get; set; }

        /// <summary>
        /// Transaction date
        /// </summary>
        public DateTime TransactionDate { get; set; }

        /// <summary>
        /// Date (alias for TransactionDate)
        /// </summary>
        public DateTime Date {
            get => TransactionDate;
            set => TransactionDate = value;
        }

        /// <summary>
        /// Transaction type
        /// </summary>
        public string TransactionType { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Currency code
        /// </summary>
        public string CurrencyCode { get; set; }

        /// <summary>
        /// Status
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Platform
        /// </summary>
        public string Platform { get; set; }

        /// <summary>
        /// Payment method
        /// </summary>
        public string PaymentMethod { get; set; }
    }
}