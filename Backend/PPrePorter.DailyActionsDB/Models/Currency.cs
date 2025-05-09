using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a currency
    /// </summary>
    [Table("tbl_Currencies")]
    public class Currency
    {
        [Key]
        public byte CurrencyID { get; set; }

        [Required]
        [StringLength(30)]
        public string CurrencyName { get; set; }

        [StringLength(5)]
        public string? CurrencySymbol { get; set; }

        [Required]
        [StringLength(3)]
        public string CurrencyCode { get; set; }

        [Column(TypeName = "money")]
        public decimal? RateInEUR { get; set; }

        [Column(TypeName = "money")]
        public decimal? RateInUSD { get; set; }

        [Column(TypeName = "money")]
        public decimal? RateInGBP { get; set; }

        public byte? OrderBy { get; set; }

        public int? Multiplier { get; set; }

        public int? ForLanguagesID { get; set; }

        [StringLength(50)]
        public string? ForLanguages { get; set; }

        [Required]
        public DateTime UpdatedDate { get; set; }
    }
}
