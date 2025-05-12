using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Top game item
    /// </summary>
    public class TopGameItem
    {
        /// <summary>
        /// Game ID
        /// </summary>
        public int GameID { get; set; }

        /// <summary>
        /// Game name
        /// </summary>
        public string GameName { get; set; }

        /// <summary>
        /// Provider
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// Game type
        /// </summary>
        public string GameType { get; set; }

        /// <summary>
        /// Bets
        /// </summary>
        public decimal Bets { get; set; }

        /// <summary>
        /// Wins
        /// </summary>
        public decimal Wins { get; set; }

        /// <summary>
        /// Revenue
        /// </summary>
        public decimal Revenue { get; set; }

        /// <summary>
        /// Number of players
        /// </summary>
        public int Players { get; set; }
    }
}