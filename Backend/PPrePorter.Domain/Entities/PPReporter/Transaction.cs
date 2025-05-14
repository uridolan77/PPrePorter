using System;
using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    /// <summary>
    /// Represents a transaction in the system
    /// </summary>
    public class Transaction : BaseEntity
    {
        /// <summary>
        /// Player ID
        /// </summary>
        public string PlayerId { get; set; }

        /// <summary>
        /// Transaction type (e.g., deposit, withdrawal)
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Transaction type (alias for Type)
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
        /// Transaction date and time
        /// </summary>
        public DateTime TransactionDate { get; set; }

        /// <summary>
        /// Transaction platform
        /// </summary>
        public string Platform { get; set; }

        /// <summary>
        /// Transaction payment method
        /// </summary>
        public string PaymentMethod { get; set; }

        /// <summary>
        /// Transaction sub details
        /// </summary>
        public string SubDetails { get; set; }

        /// <summary>
        /// Navigation property for the player
        /// </summary>
        public virtual Player Player { get; set; }
    }
}
