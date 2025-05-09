using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport
    /// </summary>
    [Table("SportSports")]
    public class SportSport
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int SportID { get; set; }

        [Required]
        [StringLength(255)]
        public string SportName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
