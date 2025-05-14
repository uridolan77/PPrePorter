using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents daily aggregated player actions and metrics
    /// </summary>
    public class DailyAction
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }
        public short? WhiteLabelID { get; set; }
        public long? PlayerID { get; set; }
        public int? Registration { get; set; }
        public int? FTD { get; set; }
        public int? FTDA { get; set; }
        public decimal? Deposits { get; set; }
        public decimal? DepositsCreditCard { get; set; }
        public decimal? DepositsNeteller { get; set; }
        public decimal? DepositsMoneyBookers { get; set; }
        public decimal? DepositsOther { get; set; }
        public decimal? DepositsFee { get; set; }
        public decimal? DepositsSport { get; set; }
        public decimal? DepositsLive { get; set; }
        public decimal? DepositsBingo { get; set; }
        public decimal? CashoutRequests { get; set; }
        public decimal? PaidCashouts { get; set; }
        public decimal? Chargebacks { get; set; }
        public decimal? Voids { get; set; }
        public decimal? ReverseChargebacks { get; set; }
        public decimal? Bonuses { get; set; }
        public decimal? CollectedBonuses { get; set; }
        public decimal? ExpiredBonuses { get; set; }
        public decimal? ClubPointsConversion { get; set; }
        public decimal? BankRoll { get; set; }
        public decimal? SideGamesBets { get; set; }
        public decimal? SideGamesRefunds { get; set; }
        public decimal? SideGamesWins { get; set; }
        public decimal? BetsCasino { get; set; }
        public decimal? BetsCasinoReal { get; set; }
        public decimal? BetsCasinoBonus { get; set; }
        public decimal? RefundsCasino { get; set; }
        public decimal? RefundsCasinoReal { get; set; }
        public decimal? RefundsCasinoBonus { get; set; }
        public decimal? WinsCasino { get; set; }
        public decimal? WinsCasinoReal { get; set; }
        public decimal? WinsCasinoBonus { get; set; }
        public decimal? BetsSport { get; set; }
        public decimal? BetsSportReal { get; set; }
        public decimal? BetsSportBonus { get; set; }
        public decimal? RefundsSport { get; set; }
        public decimal? RefundsSportReal { get; set; }
        public decimal? RefundsSportBonus { get; set; }
        public decimal? WinsSport { get; set; }
        public decimal? WinsSportReal { get; set; }
        public decimal? WinsSportBonus { get; set; }
        public decimal? BetsLive { get; set; }
        public decimal? BetsLiveReal { get; set; }
        public decimal? BetsLiveBonus { get; set; }
        public decimal? RefundsLive { get; set; }
        public decimal? RefundsLiveReal { get; set; }
        public decimal? RefundsLiveBonus { get; set; }
        public decimal? WinsLive { get; set; }
        public decimal? WinsLiveReal { get; set; }
        public decimal? WinsLiveBonus { get; set; }
        public decimal? BetsBingo { get; set; }
        public decimal? BetsBingoReal { get; set; }
        public decimal? BetsBingoBonus { get; set; }
        public decimal? RefundsBingo { get; set; }
        public decimal? RefundsBingoReal { get; set; }
        public decimal? RefundsBingoBonus { get; set; }
        public decimal? WinsBingo { get; set; }
        public decimal? WinsBingoReal { get; set; }
        public decimal? WinsBingoBonus { get; set; }
        public decimal? BonusesSport { get; set; }
        public decimal? BonusesLive { get; set; }
        public decimal? BonusesBingo { get; set; }
        public decimal? BonusConverted { get; set; }
        public decimal? BetsReal { get; set; }
        public decimal? BetsBonus { get; set; }
        public decimal? RefundsReal { get; set; }
        public decimal? RefundsBonus { get; set; }
        public decimal? WinsReal { get; set; }
        public decimal? WinsBonus { get; set; }
        public decimal? EUR2GBP { get; set; }

        // Calculated properties (not stored in database)
        public decimal GGRCasino => (BetsCasino ?? 0) - (WinsCasino ?? 0);
        public decimal GGRSport => (BetsSport ?? 0) - (WinsSport ?? 0);
        public decimal GGRLive => (BetsLive ?? 0) - (WinsLive ?? 0);
        public decimal GGRBingo => (BetsBingo ?? 0) - (WinsBingo ?? 0);
        public decimal TotalGGR => GGRCasino + GGRSport + GGRLive + GGRBingo;
    }
}
