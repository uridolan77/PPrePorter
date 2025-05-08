using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class DailyAction : BaseEntity
    {
        public int WhiteLabelID { get; set; }
        public DateTime Date { get; set; }
        public int Registration { get; set; }
        public int FTD { get; set; }
        public decimal? Deposits { get; set; }
        public decimal? PaidCashouts { get; set; }
        public decimal? BetsCasino { get; set; }
        public decimal? WinsCasino { get; set; }
        public decimal? BetsSport { get; set; }
        public decimal? WinsSport { get; set; }
        public decimal? BetsLive { get; set; }
        public decimal? WinsLive { get; set; }
        public decimal? BetsBingo { get; set; }
        public decimal? WinsBingo { get; set; }

        // Navigation property
        public virtual WhiteLabel WhiteLabel { get; set; }
    }
}
