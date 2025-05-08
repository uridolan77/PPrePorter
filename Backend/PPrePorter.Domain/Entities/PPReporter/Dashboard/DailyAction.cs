using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class DailyAction
    {
        public int ID { get; set; }
        public DateTime Date { get; set; }
        public int WhiteLabelID { get; set; }
        public int Registration { get; set; }
        public int FTD { get; set; }
        public decimal? Deposits { get; set; }
        public decimal? PaidCashouts { get; set; }
        
        // Casino-related properties
        public decimal? CasinoBet { get; set; }
        public decimal? CasinoWin { get; set; }
        public decimal? BetsCasino { get; set; }
        public decimal? WinsCasino { get; set; }
        
        // Sport-related properties
        public decimal? SportBet { get; set; }
        public decimal? SportWin { get; set; }
        public decimal? BetsSport { get; set; }
        public decimal? WinsSport { get; set; }
        
        // Live-related properties
        public decimal? LiveBet { get; set; }
        public decimal? LiveWin { get; set; }
        public decimal? BetsLive { get; set; }
        public decimal? WinsLive { get; set; }
        
        // Bingo-related properties
        public decimal? BingoBet { get; set; }
        public decimal? BingoWin { get; set; }
        public decimal? BetsBingo { get; set; }
        public decimal? WinsBingo { get; set; }
    }
}
