using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Games
{
    /// <summary>
    /// Represents a game in the system
    /// </summary>
    [Table("Games", Schema = "dbo")]
    public class Game
    {
        [Key]
        public int GameID { get; set; }

        [Required]
        [StringLength(50)]
        public string GameName { get; set; }

        [Required]
        [StringLength(50)]
        public string Provider { get; set; }

        [StringLength(50)]
        public string? SubProvider { get; set; }

        [Required]
        [StringLength(50)]
        public string GameType { get; set; }

        [StringLength(250)]
        public string? GameFilters { get; set; }

        [Required]
        public int GameOrder { get; set; }

        [Required]
        public bool IsActive { get; set; }

        public bool? DemoEnabled { get; set; }

        public double? WagerPercent { get; set; }

        public double? JackpotContribution { get; set; }

        public double? PayoutLow { get; set; }

        public double? PayoutHigh { get; set; }

        [StringLength(50)]
        public string? Volatility { get; set; }

        public bool? UKCompliant { get; set; }

        public bool? IsDesktop { get; set; }

        [StringLength(50)]
        public string? ServerGameID { get; set; }

        [StringLength(100)]
        public string? ProviderTitle { get; set; }

        public bool? IsMobile { get; set; }

        [StringLength(50)]
        public string? MobileServerGameID { get; set; }

        [StringLength(100)]
        public string? MobileProviderTitle { get; set; }

        public DateTime? CreatedDate { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool? HideInLobby { get; set; }

        [StringLength(1000)]
        public string? ExcludedCountries { get; set; }

        [StringLength(1000)]
        public string? ExcludedJurisdictions { get; set; }
    }
}
