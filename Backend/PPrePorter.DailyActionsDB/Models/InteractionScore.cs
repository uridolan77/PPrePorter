using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents an interaction score check
    /// </summary>
    [Table("tbl_Interactions_ScoreChecks")]
    public class InteractionScore
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public long PlayerID { get; set; }

        public int? ScoreSum { get; set; }

        public int? ValueID { get; set; }

        [StringLength(100)]
        public string? ValueCode { get; set; }

        [StringLength(500)]
        public string? ChecksIDs { get; set; }

        public string? ChecksDetails { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
