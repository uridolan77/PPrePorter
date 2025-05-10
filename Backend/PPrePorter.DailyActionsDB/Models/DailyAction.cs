using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents daily aggregated player actions and metrics
    /// </summary>
    [Table("tbl_Daily_actions", Schema = "common")]
    public class DailyAction
    {
        [Key]
        [Column("ID")]
        public long Id { get; set; }

        [Column("Date")]
        public DateTime Date { get; set; }

        [Column("WhiteLabelID")]
        public short? WhiteLabelID { get; set; }

        [Column("WhiteLabelId")]
        public short? WhiteLabelId { get; set; } // Some queries use WhiteLabelId instead of WhiteLabelID

        [Column("PlayerID")]
        public long? PlayerID { get; set; }

        [Column("Registration")]
        public byte? Registration { get; set; }

        [Column("FTD")]
        public byte? FTD { get; set; }

        [Column("FTDA")]
        public byte? FTDA { get; set; }

        [Column("Deposits", TypeName = "money")]
        public decimal? Deposits { get; set; }

        [Column("DepositsCreditCard", TypeName = "money")]
        public decimal? DepositsCreditCard { get; set; }

        [Column("DepositsNeteller", TypeName = "money")]
        public decimal? DepositsNeteller { get; set; }

        [Column("DepositsMoneyBookers", TypeName = "money")]
        public decimal? DepositsMoneyBookers { get; set; }

        [Column("DepositsOther", TypeName = "money")]
        public decimal? DepositsOther { get; set; }

        [Column("CashoutRequests", TypeName = "money")]
        public decimal? CashoutRequests { get; set; }

        [Column("PaidCashouts", TypeName = "money")]
        public decimal? PaidCashouts { get; set; }

        [Column("BetsCasino", TypeName = "money")]
        public decimal? BetsCasino { get; set; }

        [Column("WinsCasino", TypeName = "money")]
        public decimal? WinsCasino { get; set; }

        [Column("BetsSport", TypeName = "money")]
        public decimal? BetsSport { get; set; }

        [Column("WinsSport", TypeName = "money")]
        public decimal? WinsSport { get; set; }

        [Column("BetsLive", TypeName = "money")]
        public decimal? BetsLive { get; set; }

        [Column("WinsLive", TypeName = "money")]
        public decimal? WinsLive { get; set; }

        [Column("BetsBingo", TypeName = "money")]
        public decimal? BetsBingo { get; set; }

        [Column("WinsBingo", TypeName = "money")]
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
