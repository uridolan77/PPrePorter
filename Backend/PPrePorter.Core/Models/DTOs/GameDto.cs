using System;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for game data
    /// </summary>
    public class GameDto
    {
        /// <summary>
        /// The game ID
        /// </summary>
        public long GameID { get; set; }

        /// <summary>
        /// The game name
        /// </summary>
        public string GameName { get; set; } = string.Empty;

        /// <summary>
        /// The game provider
        /// </summary>
        public string Provider { get; set; } = string.Empty;

        /// <summary>
        /// The sub-provider
        /// </summary>
        public string? SubProvider { get; set; }

        /// <summary>
        /// The game type
        /// </summary>
        public string GameType { get; set; } = string.Empty;

        /// <summary>
        /// The game filters
        /// </summary>
        public string? GameFilters { get; set; }

        /// <summary>
        /// The game order
        /// </summary>
        public int GameOrder { get; set; }

        /// <summary>
        /// Whether the game is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Whether demo mode is enabled
        /// </summary>
        public bool? DemoEnabled { get; set; }

        /// <summary>
        /// The wager percentage
        /// </summary>
        public double? WagerPercent { get; set; }

        /// <summary>
        /// The jackpot contribution
        /// </summary>
        public double? JackpotContribution { get; set; }

        /// <summary>
        /// The low payout
        /// </summary>
        public double? PayoutLow { get; set; }

        /// <summary>
        /// The high payout
        /// </summary>
        public double? PayoutHigh { get; set; }

        /// <summary>
        /// The volatility
        /// </summary>
        public string? Volatility { get; set; }

        /// <summary>
        /// Whether the game is UK compliant
        /// </summary>
        public bool? UKCompliant { get; set; }

        /// <summary>
        /// Whether the game is available on desktop
        /// </summary>
        public bool? IsDesktop { get; set; }

        /// <summary>
        /// The server game ID
        /// </summary>
        public string? ServerGameID { get; set; }

        /// <summary>
        /// The provider title
        /// </summary>
        public string? ProviderTitle { get; set; }

        /// <summary>
        /// Whether the game is available on mobile
        /// </summary>
        public bool? IsMobile { get; set; }

        /// <summary>
        /// The mobile server game ID
        /// </summary>
        public string? MobileServerGameID { get; set; }

        /// <summary>
        /// The mobile provider title
        /// </summary>
        public string? MobileProviderTitle { get; set; }

        /// <summary>
        /// The date the game was created
        /// </summary>
        public DateTime? CreatedDate { get; set; }

        /// <summary>
        /// The date the game was released
        /// </summary>
        public DateTime? ReleaseDate { get; set; }

        /// <summary>
        /// The date the game was last updated
        /// </summary>
        public DateTime? UpdatedDate { get; set; }

        /// <summary>
        /// Whether the game is hidden in the lobby
        /// </summary>
        public bool? HideInLobby { get; set; }

        /// <summary>
        /// The excluded countries
        /// </summary>
        public string? ExcludedCountries { get; set; }
    }
}
