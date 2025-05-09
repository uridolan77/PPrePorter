using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a withdrawal request
    /// </summary>
    [Table("tbl_Withdrawal_requests")]
    public class WithdrawalRequest
    {
        [Key]
        public long RequestID { get; set; }

        [Required]
        public long PlayerID { get; set; }

        public DateTime? RequestDate { get; set; }

        [Column(TypeName = "money")]
        public decimal? Amount { get; set; }

        [StringLength(50)]
        public string? SCName { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(50)]
        public string? HandlingType { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
