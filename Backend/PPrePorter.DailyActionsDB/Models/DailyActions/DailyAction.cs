using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.DailyActions
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
        public short? WhiteLabelID { get; set; } // This is the correct column name in the database

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

        [Column("Chargebacks", TypeName = "money")]
        public decimal? Chargebacks { get; set; }

        [Column("Voids", TypeName = "money")]
        public decimal? Voids { get; set; }

        [Column("ReverseChargebacks", TypeName = "money")]
        public decimal? ReverseChargebacks { get; set; }

        [Column("Bonuses", TypeName = "money")]
        public decimal? Bonuses { get; set; }

        [Column("CollectedBonuses", TypeName = "money")]
        public decimal? CollectedBonuses { get; set; }

        [Column("ExpiredBonuses", TypeName = "money")]
        public decimal? ExpiredBonuses { get; set; }

        [Column("ClubPointsConversion", TypeName = "money")]
        public decimal? ClubPointsConversion { get; set; }

        [Column("BankRoll", TypeName = "money")]
        public decimal? BankRoll { get; set; }

        [Column("SideGamesBets", TypeName = "money")]
        public decimal? SideGamesBets { get; set; }

        [Column("SideGamesRefunds", TypeName = "money")]
        public decimal? SideGamesRefunds { get; set; }

        [Column("SideGamesWins", TypeName = "money")]
        public decimal? SideGamesWins { get; set; }

        [Column("SideGamesTableGamesBets", TypeName = "money")]
        public decimal? SideGamesTableGamesBets { get; set; }

        [Column("SideGamesTableGamesWins", TypeName = "money")]
        public decimal? SideGamesTableGamesWins { get; set; }

        [Column("SideGamesCasualGamesBets", TypeName = "money")]
        public decimal? SideGamesCasualGamesBets { get; set; }

        [Column("SideGamesCasualGamesWins", TypeName = "money")]
        public decimal? SideGamesCasualGamesWins { get; set; }

        [Column("SideGamesSlotsBets", TypeName = "money")]
        public decimal? SideGamesSlotsBets { get; set; }

        [Column("SideGamesSlotsWins", TypeName = "money")]
        public decimal? SideGamesSlotsWins { get; set; }

        [Column("SideGamesJackpotsBets", TypeName = "money")]
        public decimal? SideGamesJackpotsBets { get; set; }

        [Column("SideGamesJackpotsWins", TypeName = "money")]
        public decimal? SideGamesJackpotsWins { get; set; }

        [Column("SideGamesFeaturedBets", TypeName = "money")]
        public decimal? SideGamesFeaturedBets { get; set; }

        [Column("SideGamesFeaturedWins", TypeName = "money")]
        public decimal? SideGamesFeaturedWins { get; set; }

        [Column("JackpotContribution", TypeName = "money")]
        public decimal? JackpotContribution { get; set; }

        [Column("LottoBets", TypeName = "money")]
        public decimal? LottoBets { get; set; }

        [Column("LottoAdvancedBets", TypeName = "money")]
        public decimal? LottoAdvancedBets { get; set; }

        [Column("LottoWins", TypeName = "money")]
        public decimal? LottoWins { get; set; }

        [Column("LottoAdvancedWins", TypeName = "money")]
        public decimal? LottoAdvancedWins { get; set; }

        [Column("InsuranceContribution", TypeName = "money")]
        public decimal? InsuranceContribution { get; set; }

        [Column("Adjustments", TypeName = "money")]
        public decimal? Adjustments { get; set; }

        [Column("AdjustmentsAdd", TypeName = "money")]
        public decimal? AdjustmentsAdd { get; set; }

        [Column("ClearedBalance", TypeName = "money")]
        public decimal? ClearedBalance { get; set; }

        [Column("RevenueAdjustments", TypeName = "money")]
        public decimal? RevenueAdjustments { get; set; }

        [Column("RevenueAdjustmentsAdd", TypeName = "money")]
        public decimal? RevenueAdjustmentsAdd { get; set; }

        [Column("UpdatedDate")]
        public DateTime? UpdatedDate { get; set; }

        [Column("AdministrativeFee", TypeName = "money")]
        public decimal? AdministrativeFee { get; set; }

        [Column("AdministrativeFeeReturn", TypeName = "money")]
        public decimal? AdministrativeFeeReturn { get; set; }

        [Column("BetsReal", TypeName = "money")]
        public decimal? BetsReal { get; set; }

        [Column("BetsBonus", TypeName = "money")]
        public decimal? BetsBonus { get; set; }

        [Column("RefundsReal", TypeName = "money")]
        public decimal? RefundsReal { get; set; }

        [Column("RefundsBonus", TypeName = "money")]
        public decimal? RefundsBonus { get; set; }

        [Column("WinsReal", TypeName = "money")]
        public decimal? WinsReal { get; set; }

        [Column("WinsBonus", TypeName = "money")]
        public decimal? WinsBonus { get; set; }

        [Column("BonusConverted", TypeName = "money")]
        public decimal? BonusConverted { get; set; }

        [Column("DepositsFee", TypeName = "money")]
        public decimal? DepositsFee { get; set; }

        [Column("DepositsSport", TypeName = "money")]
        public decimal? DepositsSport { get; set; }

        [Column("BetsSport", TypeName = "money")]
        public decimal? BetsSport { get; set; }

        [Column("RefundsSport", TypeName = "money")]
        public decimal? RefundsSport { get; set; }

        [Column("WinsSport", TypeName = "money")]
        public decimal? WinsSport { get; set; }

        [Column("BetsSportReal", TypeName = "money")]
        public decimal? BetsSportReal { get; set; }

        [Column("RefundsSportReal", TypeName = "money")]
        public decimal? RefundsSportReal { get; set; }

        [Column("WinsSportReal", TypeName = "money")]
        public decimal? WinsSportReal { get; set; }

        [Column("BetsSportBonus", TypeName = "money")]
        public decimal? BetsSportBonus { get; set; }

        [Column("RefundsSportBonus", TypeName = "money")]
        public decimal? RefundsSportBonus { get; set; }

        [Column("WinsSportBonus", TypeName = "money")]
        public decimal? WinsSportBonus { get; set; }

        [Column("BonusesSport", TypeName = "money")]
        public decimal? BonusesSport { get; set; }

        [Column("BetsCasino", TypeName = "money")]
        public decimal? BetsCasino { get; set; }

        [Column("RefundsCasino", TypeName = "money")]
        public decimal? RefundsCasino { get; set; }

        [Column("WinsCasino", TypeName = "money")]
        public decimal? WinsCasino { get; set; }

        [Column("BetsCasinoReal", TypeName = "money")]
        public decimal? BetsCasinoReal { get; set; }

        [Column("RefundsCasinoReal", TypeName = "money")]
        public decimal? RefundsCasinoReal { get; set; }

        [Column("WinsCasinoReal", TypeName = "money")]
        public decimal? WinsCasinoReal { get; set; }

        [Column("BetsCasinoBonus", TypeName = "money")]
        public decimal? BetsCasinoBonus { get; set; }

        [Column("RefundsCasinoBonus", TypeName = "money")]
        public decimal? RefundsCasinoBonus { get; set; }

        [Column("WinsCasinoBonus", TypeName = "money")]
        public decimal? WinsCasinoBonus { get; set; }

        [Column("EUR2GBP", TypeName = "decimal(18,6)")]
        public decimal? EUR2GBP { get; set; }

        [Column("AppBets", TypeName = "money")]
        public decimal? AppBets { get; set; }

        [Column("AppRefunds", TypeName = "money")]
        public decimal? AppRefunds { get; set; }

        [Column("AppWins", TypeName = "money")]
        public decimal? AppWins { get; set; }

        [Column("AppBetsCasino", TypeName = "money")]
        public decimal? AppBetsCasino { get; set; }

        [Column("AppRefundsCasino", TypeName = "money")]
        public decimal? AppRefundsCasino { get; set; }

        [Column("AppWinsCasino", TypeName = "money")]
        public decimal? AppWinsCasino { get; set; }

        [Column("AppBetsSport", TypeName = "money")]
        public decimal? AppBetsSport { get; set; }

        [Column("AppRefundsSport", TypeName = "money")]
        public decimal? AppRefundsSport { get; set; }

        [Column("AppWinsSport", TypeName = "money")]
        public decimal? AppWinsSport { get; set; }

        [Column("DepositsLive", TypeName = "money")]
        public decimal? DepositsLive { get; set; }

        [Column("BonusesLive", TypeName = "money")]
        public decimal? BonusesLive { get; set; }

        [Column("BetsLive", TypeName = "money")]
        public decimal? BetsLive { get; set; }

        [Column("RefundsLive", TypeName = "money")]
        public decimal? RefundsLive { get; set; }

        [Column("WinsLive", TypeName = "money")]
        public decimal? WinsLive { get; set; }

        [Column("BetsLiveReal", TypeName = "money")]
        public decimal? BetsLiveReal { get; set; }

        [Column("RefundsLiveReal", TypeName = "money")]
        public decimal? RefundsLiveReal { get; set; }

        [Column("WinsLiveReal", TypeName = "money")]
        public decimal? WinsLiveReal { get; set; }

        [Column("BetsLiveBonus", TypeName = "money")]
        public decimal? BetsLiveBonus { get; set; }

        [Column("RefundsLiveBonus", TypeName = "money")]
        public decimal? RefundsLiveBonus { get; set; }

        [Column("WinsLiveBonus", TypeName = "money")]
        public decimal? WinsLiveBonus { get; set; }

        [Column("DepositsBingo", TypeName = "money")]
        public decimal? DepositsBingo { get; set; }

        [Column("BonusesBingo", TypeName = "money")]
        public decimal? BonusesBingo { get; set; }

        [Column("BetsBingo", TypeName = "money")]
        public decimal? BetsBingo { get; set; }

        [Column("RefundsBingo", TypeName = "money")]
        public decimal? RefundsBingo { get; set; }

        [Column("WinsBingo", TypeName = "money")]
        public decimal? WinsBingo { get; set; }

        [Column("BetsBingoReal", TypeName = "money")]
        public decimal? BetsBingoReal { get; set; }

        [Column("RefundsBingoReal", TypeName = "money")]
        public decimal? RefundsBingoReal { get; set; }

        [Column("WinsBingoReal", TypeName = "money")]
        public decimal? WinsBingoReal { get; set; }

        [Column("BetsBingoBonus", TypeName = "money")]
        public decimal? BetsBingoBonus { get; set; }

        [Column("RefundsBingoBonus", TypeName = "money")]
        public decimal? RefundsBingoBonus { get; set; }

        [Column("WinsBingoBonus", TypeName = "money")]
        public decimal? WinsBingoBonus { get; set; }

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
