using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a daily action game record
    /// </summary>
    [Table("tbl_Daily_actions_games")]
    public class DailyActionGame
    {
        [Key]
        public long ID { get; set; }

        public DateTime? GameDate { get; set; }

        public long? PlayerID { get; set; }

        public long? GameID { get; set; }

        [StringLength(50)]
        public string? Platform { get; set; }

        [Column(TypeName = "money")]
        public decimal? RealBetAmount { get; set; }

        [Column(TypeName = "money")]
        public decimal? RealWinAmount { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusBetAmount { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusWinAmount { get; set; }

        [Column(TypeName = "money")]
        public decimal? NetGamingRevenue { get; set; }

        [Column(TypeName = "money")]
        public decimal? NumberofRealBets { get; set; }

        [Column(TypeName = "money")]
        public decimal? NumberofBonusBets { get; set; }

        [Column(TypeName = "money")]
        public decimal? NumberofSessions { get; set; }

        [Column(TypeName = "money")]
        public decimal? NumberofRealWins { get; set; }

        [Column(TypeName = "money")]
        public decimal? NumberofBonusWins { get; set; }

        [Column(TypeName = "money")]
        public decimal? RealBetAmountOriginal { get; set; }

        [Column(TypeName = "money")]
        public decimal? RealWinAmountOriginal { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusBetAmountOriginal { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusWinAmountOriginal { get; set; }

        [Column(TypeName = "money")]
        public decimal? NetGamingRevenueOriginal { get; set; }

        public DateTime? UpdateDate { get; set; }
    }
}
