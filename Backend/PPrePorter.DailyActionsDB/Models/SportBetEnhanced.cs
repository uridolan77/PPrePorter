using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents an enhanced sport bet
    /// </summary>
    [Table("SportBetsEnhanced")]
    public class SportBetEnhanced
    {
        // This is a view or a query result, so we'll mark it as keyless in the DbContext
        // If you need to define a key, uncomment the following:
        // [Key]
        // public long Id { get; set; }

        [Column(TypeName = "money")]
        public decimal? RelativeBet { get; set; }

        [Column(TypeName = "money")]
        public decimal? RelativeWin { get; set; }

        [Required]
        public long PlayerId { get; set; }

        [Required]
        public long BetId { get; set; }

        public int? BetType { get; set; }

        public int? OddTypeId { get; set; }

        [Required]
        public int RegionId { get; set; }

        [Required]
        public int SportId { get; set; }

        [Required]
        public int CompetitionId { get; set; }

        [Required]
        public int MatchId { get; set; }

        [Required]
        public int MarketId { get; set; }

        public bool? IsLive { get; set; }

        [Required]
        public int BetState { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime UpdatedDate { get; set; }

        [Required]
        public DateTime LastUpdate { get; set; }
    }
}
