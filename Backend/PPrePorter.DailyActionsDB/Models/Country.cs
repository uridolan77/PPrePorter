using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a country
    /// </summary>
    [Table("tbl_Countries", Schema = "common")]
    public class Country
    {
        [Key]
        [Column("CountryID")]
        public int CountryID { get; set; }

        [Required]
        [StringLength(50)]
        [Column("CountryName")]
        public string CountryName { get; set; }

        public bool? IsActive { get; set; }

        [StringLength(2)]
        public string? CountryIntlCode { get; set; }

        [StringLength(50)]
        public string? PhoneCode { get; set; }

        [StringLength(3)]
        public string? IsoCode { get; set; }

        [StringLength(15)]
        public string? JurisdictionCode { get; set; }

        public int? DefaultLanguage { get; set; }

        public byte? DefaultCurrency { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }

        public int? JurisdictionID { get; set; }

        [StringLength(50)]
        public string? Locales { get; set; }
    }
}
