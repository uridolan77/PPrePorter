using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Games
{
    /// <summary>
    /// Represents a game excluded for a specific label
    /// </summary>
    [Table("GamesExcludedByLabel", Schema = "dbo")]
    public class GameExcludedByLabel
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int GameID { get; set; }

        [Required]
        public int LabelID { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }
    }
}
