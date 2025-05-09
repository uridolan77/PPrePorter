using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a game excluded in a specific country
    /// </summary>
    [Table("GamesExcludedByCountry")]
    public class GameExcludedByCountry
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int GameID { get; set; }

        [Required]
        public int CountryID { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }
    }
}
