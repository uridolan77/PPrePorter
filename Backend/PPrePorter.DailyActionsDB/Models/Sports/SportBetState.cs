using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Sports
{
    /// <summary>
    /// Represents a sport bet state
    /// </summary>
    [Table("SportBetStates", Schema = "dbo")]
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
