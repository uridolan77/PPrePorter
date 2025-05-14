using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a game
    /// </summary>
    public class Game : BaseEntity
    {
        /// <summary>
        /// Game name
        /// </summary>
        public string GameName { get; set; }

        /// <summary>
        /// Game provider
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// Game type
        /// </summary>
        public string GameType { get; set; }

        /// <summary>
        /// Whether the game is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Game ID (alias for Id)
        /// </summary>
        public int GameId { get => Id; }

        /// <summary>
        /// Game ID (alias for Id)
        /// </summary>
        public int GameID { get => Id; }

        /// <summary>
        /// Daily actions for this game
        /// </summary>
        public virtual ICollection<DailyActionGame> DailyActions { get; set; }
    }
}
