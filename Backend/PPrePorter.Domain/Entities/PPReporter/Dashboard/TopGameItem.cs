using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class TopGameItem
    {
        public int GameID { get; set; }
        public string GameName { get; set; }
        public string Provider { get; set; }
        public string GameType { get; set; }
        public decimal Bets { get; set; }
        public decimal Wins { get; set; }
        public decimal Revenue { get; set; }
    }
}