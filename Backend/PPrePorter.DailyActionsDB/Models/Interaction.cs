using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents an interaction check
    /// </summary>
    [Table("tbl_Interactions_checks", Schema = "common")]
    public class Interaction
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public long PlayerID { get; set; }

        public int? RuleID { get; set; }

        [StringLength(50)]
        public string? RuleCode { get; set; }

        public int? ValueID { get; set; }

        [StringLength(50)]
        public string? ValueCode { get; set; }

        public string? PlayerValue { get; set; }

        public int? Score { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public DateTime? ExpiredAt { get; set; }
    }
}
