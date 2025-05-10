using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a sport odds type
    /// </summary>
    [Table("SportOddsTypes", Schema = "dbo")]
    public class SportOddsType
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int OddTypeID { get; set; }

        [Required]
        [StringLength(255)]
        public string OddTypeName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
