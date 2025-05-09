using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a casino game session
    /// </summary>
    [Table("GamesCasinoSessions")]
    public class GameCasinoSession
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public long GameID { get; set; }

        [Required]
        public long PlayerID { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalBet { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalBetAccount { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalBetBonus { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalWin { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalWinAccount { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal TotalWinBonus { get; set; }

        [Required]
        public long RoundID { get; set; }

        [Required]
        public int GameStatus { get; set; }

        [Required]
        public int CurrencyID { get; set; }

        [Required]
        public DateTime CreationDate { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal AccountBalance { get; set; }

        [Required]
        [Column(TypeName = "money")]
        public decimal BonusBalance { get; set; }
    }
}
