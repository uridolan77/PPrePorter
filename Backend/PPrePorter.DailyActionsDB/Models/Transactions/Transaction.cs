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
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string TransactionId { get; set; } = string.Empty;

        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string PlayerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string WhitelabelId { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? GameId { get; set; }

        [MaxLength(100)]
        public string? GameName { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string TransactionType { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = string.Empty;
    }
}
