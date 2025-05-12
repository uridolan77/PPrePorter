using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Transactions
{
    /// <summary>
    /// Represents a player transaction in the system
    /// </summary>
    [Table("tbl_Daily_actions_transactions", Schema = "common")]
    public class Transaction
    {
        [Key]
        [Column("TransactionID")]
        public int Id { get; set; }

        // This property is needed for backward compatibility with existing code
        // It's the same as Id but as a string
        [NotMapped]
        public string TransactionId => Id.ToString();

        [Required]
        [Column("TransactionDate")]
        public DateTime TransactionDate { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("PlayerID")]
        public string PlayerId { get; set; } = string.Empty;

        // This property is needed for backward compatibility with existing code
        [NotMapped]
        public string WhitelabelId { get; set; } = string.Empty;

        // This property is needed for backward compatibility with existing code
        [NotMapped]
        public string? GameId { get; set; }

        // This property is needed for backward compatibility with existing code
        [NotMapped]
        public string? GameName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("TransactionType")]
        public string TransactionType { get; set; } = string.Empty;

        [Required]
        [Column("TransactionAmount", TypeName = "money")]
        public decimal Amount { get; set; }

        [Column("TransactionOriginalAmount", TypeName = "money")]
        public decimal? OriginalAmount { get; set; }

        [MaxLength(1000)]
        [Column("TransactionDetails")]
        public string? Details { get; set; }

        [MaxLength(50)]
        [Column("Platform")]
        public string? Platform { get; set; }

        [MaxLength(25)]
        [Column("Status")]
        public string? Status { get; set; }

        [MaxLength(3)]
        [Column("CurrencyCode")]
        public string Currency { get; set; } = string.Empty;

        [Column("LastUpdated")]
        public DateTime? LastUpdated { get; set; }

        [Column("OriginalTransactionID")]
        public int? OriginalTransactionId { get; set; }

        [MaxLength(500)]
        [Column("TransactionSubDetails")]
        public string? SubDetails { get; set; }

        [MaxLength(500)]
        [Column("TransactionComments")]
        public string? Comments { get; set; }

        [MaxLength(500)]
        [Column("PaymentMethod")]
        public string? PaymentMethod { get; set; }

        [MaxLength(500)]
        [Column("PaymentProvider")]
        public string? PaymentProvider { get; set; }

        [Column("TransactionInfoID")]
        public int? TransactionInfoId { get; set; }
    }
}
