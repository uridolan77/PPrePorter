using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a player transaction in the system
    /// </summary>
    public class Transaction
    {
        public int Id { get; set; }
        public string TransactionId => Id.ToString();
        public int TransactionID => Id;
        public DateTime TransactionDate { get; set; }
        public string PlayerId { get; set; } = string.Empty;
        public int PlayerID => int.Parse(PlayerId);
        public string WhitelabelId { get; set; } = string.Empty;
        public string? GameId { get; set; }
        public string? GameName { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal TransactionAmount => Amount;
        public decimal? OriginalAmount { get; set; }
        public string? Details { get; set; }
        public string? Platform { get; set; }
        public string? Status { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string CurrencyCode => Currency;
        public DateTime? LastUpdated { get; set; }
        public int? OriginalTransactionId { get; set; }
        public string? SubDetails { get; set; }
        public string TransactionSubDetails => SubDetails ?? string.Empty;
        public string? Comments { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentProvider { get; set; }
        public int? TransactionInfoId { get; set; }

        // Navigation property
        public virtual Player Player { get; set; }
    }
}
