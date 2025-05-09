using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a game excluded in a specific jurisdiction
    /// </summary>
    [Table("GamesExcludedByJurisdiction")]
    public class GameExcludedByJurisdiction
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int GameID { get; set; }

        [Required]
        public int JurisdictionID { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }
    }
}
