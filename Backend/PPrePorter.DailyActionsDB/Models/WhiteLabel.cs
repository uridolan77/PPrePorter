using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a white label (brand) in the system
    /// </summary>
    [Table("tbl_White_labels", Schema = "common")]
    public class WhiteLabel
    {
        [Key]
        [Column("LabelID")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("LabelName")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("LabelUrlName")]
        public string? UrlName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("LabelUrl")]
        public string Url { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("LabelNameShort")]
        public string? Code { get; set; } = string.Empty;

        [Column("IsActive")]
        public bool? IsActive { get; set; } = true;

        [Column("DefaultLanguage")]
        [MaxLength(50)]
        public string? DefaultLanguage { get; set; }

        [Column("DefaultCountry")]
        public int? DefaultCountryId { get; set; }

        [Column("DefaultCurrency")]
        public int? DefaultCurrencyId { get; set; }

        [Column("UpdatedDate")]
        public DateTime UpdatedDate { get; set; }

        // Navigation property
        public virtual ICollection<DailyAction> DailyActions { get; set; } = new List<DailyAction>();
    }
}
