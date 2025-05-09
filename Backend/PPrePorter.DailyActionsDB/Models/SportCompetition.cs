using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport competition
    /// </summary>
    [Table("SportCompetitions")]
    public class SportCompetition
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int CompetitionID { get; set; }

        [Required]
        [StringLength(255)]
        public string CompetitionName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
