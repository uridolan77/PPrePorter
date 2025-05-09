using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a leaderboard entry
    /// </summary>
    [Table("tbl_Leaderboards")]
    public class Leaderboard
    {
        [Key]
        [Column("leaderboard_id")]
        public int LeaderboardId { get; set; }

        [Required]
        [Column("bonus_id")]
        public int BonusId { get; set; }

        [Required]
        [Column("player_id")]
        public long PlayerId { get; set; }

        [Required]
        [Column("creation_dt")]
        public DateTime CreationDate { get; set; }

        [Required]
        [Column("updated_dt")]
        public DateTime UpdatedDate { get; set; }

        [Column("result_total", TypeName = "money")]
        public decimal? ResultTotal { get; set; }

        [Column("result_rank")]
        public int? ResultRank { get; set; }

        [Column("bets", TypeName = "money")]
        public decimal? Bets { get; set; }

        [Column("wins", TypeName = "money")]
        public decimal? Wins { get; set; }

        [Column("bets_count")]
        public int? BetsCount { get; set; }

        [Column("status_id")]
        public int? StatusId { get; set; }

        [Column("deposits", TypeName = "money")]
        public decimal? Deposits { get; set; }
    }
}
