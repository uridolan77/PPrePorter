using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents daily aggregated player actions and metrics
    /// </summary>
    public class DailyAction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WhiteLabelID { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int Registration { get; set; }

        [Required]
        public int FTD { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? Deposits { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? PaidCashouts { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BetsCasino { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WinsCasino { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BetsSport { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WinsSport { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BetsLive { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WinsLive { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BetsBingo { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WinsBingo { get; set; }

        // Navigation property - commented out for now
        // public virtual WhiteLabel? WhiteLabel { get; set; }

        // Calculated properties (not stored in database)
        [NotMapped]
        public decimal GGRCasino => (BetsCasino ?? 0) - (WinsCasino ?? 0);

        [NotMapped]
        public decimal GGRSport => (BetsSport ?? 0) - (WinsSport ?? 0);

        [NotMapped]
        public decimal GGRLive => (BetsLive ?? 0) - (WinsLive ?? 0);

        [NotMapped]
        public decimal GGRBingo => (BetsBingo ?? 0) - (WinsBingo ?? 0);

        [NotMapped]
        public decimal TotalGGR => GGRCasino + GGRSport + GGRLive + GGRBingo;
    }
}
