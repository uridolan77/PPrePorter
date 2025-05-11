using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Sports
{
    /// <summary>
    /// Represents a sport region
    /// </summary>
    [Table("SportRegions", Schema = "dbo")]
    public class SportRegion
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int RegionID { get; set; }

        [Required]
        [StringLength(255)]
        public string RegionName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
