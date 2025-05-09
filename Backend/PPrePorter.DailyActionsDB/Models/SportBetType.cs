using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport bet type
    /// </summary>
    [Table("SportBetTypes")]
    public class SportBetType
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int BetTypeID { get; set; }

        [Required]
        [StringLength(255)]
        public string BetTypeName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
