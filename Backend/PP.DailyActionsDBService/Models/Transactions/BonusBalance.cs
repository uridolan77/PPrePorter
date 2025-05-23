using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Transactions
{
    /// <summary>
    /// Represents a bonus balance
    /// </summary>
    [Table("tbl_Bonus_balances", Schema = "common")]
    public class BonusBalance
    {
        [Key]
        public long BonusBalanceID { get; set; }

        [Required]
        public long PlayerID { get; set; }

        public byte? CurrencyID { get; set; }

        public int? BonusID { get; set; }

        [Column(TypeName = "money")]
        public decimal? Amount { get; set; }

        [Column(TypeName = "money")]
        public decimal? Balance { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [Column(TypeName = "money")]
        public decimal? WagerLeft { get; set; }

        [Column(TypeName = "money")]
        public decimal? OriginalDepositAmount { get; set; }

        [Column(TypeName = "money")]
        public decimal? MaxCashableWinnings { get; set; }

        [Column(TypeName = "money")]
        public decimal? AmountConverted { get; set; }

        public bool? IsSportBonus { get; set; }

        [StringLength(500)]
        public string? FreeSpinsOffer { get; set; }

        public int? FreeSpinsAmount { get; set; }

        public int? FreeSpinsLeft { get; set; }

        [StringLength(500)]
        public string? Comments { get; set; }

        [StringLength(500)]
        public string? DepositCode { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public DateTime? CreationDate { get; set; }

        public DateTime? LossConditionDate { get; set; }
    }
}
