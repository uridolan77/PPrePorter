using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a bonus
    /// </summary>
    [Table("tbl_Bonuses")]
    public class Bonus
    {
        [Key]
        public int BonusID { get; set; }

        [StringLength(100)]
        public string? BonusName { get; set; }

        [StringLength(50)]
        public string? InternalName { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Percentage { get; set; }

        [Column(TypeName = "money")]
        public decimal? PercentageUpToAmount { get; set; }

        public int? Divisions { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusAmount { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        [StringLength(100)]
        public string? CouponCode { get; set; }

        [StringLength(100)]
        public string? GivenUpon { get; set; }

        public DateTime? StartDate { get; set; }

        public short? StartTime { get; set; }

        public DateTime? EndDate { get; set; }

        public short? EndTime { get; set; }

        [StringLength(100)]
        public string? ConditionFilterPlayers { get; set; }

        [StringLength(100)]
        public string? ConditionTrigger { get; set; }

        [Column(TypeName = "money")]
        public decimal? WagerFactor { get; set; }

        [Column(TypeName = "money")]
        public decimal? MinDeposit { get; set; }

        public int? DepositNumber { get; set; }

        [StringLength(100)]
        public string? FreeGame { get; set; }

        [StringLength(100)]
        public string? ConditionRanking { get; set; }

        [Column(TypeName = "money")]
        public decimal? MaxBonusMoney { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [StringLength(10)]
        public string? ConditionRegistrationPlayMode { get; set; }

        [StringLength(10)]
        public string? ConditionEventPlatMode { get; set; }

        public bool? ConditionPlayedCasino { get; set; }

        public bool? ConditionPlayedSport { get; set; }

        public int? ConditionDepositsCountCasino { get; set; }

        public int? ConditionDepositsCountSport { get; set; }

        [StringLength(50)]
        public string? BonusType { get; set; }

        public bool? IsSportBonus { get; set; }
    }
}
