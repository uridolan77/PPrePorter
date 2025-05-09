using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport match
    /// </summary>
    [Table("SportMatches")]
    public class SportMatch
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int MatchID { get; set; }

        [Required]
        [StringLength(500)]
        public string MatchName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
