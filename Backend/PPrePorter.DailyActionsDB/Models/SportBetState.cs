using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport bet state
    /// </summary>
    [Table("SportBetStates")]
    public class SportBetState
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int BetStateID { get; set; }

        [Required]
        [StringLength(255)]
        public string BetStateName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
