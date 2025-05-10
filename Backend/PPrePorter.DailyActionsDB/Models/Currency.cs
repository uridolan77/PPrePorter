using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a currency
    /// </summary>
    [Table("tbl_Currencies", Schema = "common")]
    public class Currency
    {
        [Key]
        [Column("CurrencyID")]
        public byte CurrencyID { get; set; }

        [Required]
        [StringLength(30)]
        [Column("CurrencyName")]
        public string CurrencyName { get; set; }

        [StringLength(5)]
        [Column("CurrencySymbol")]
        public string? CurrencySymbol { get; set; }

        [Required]
        [StringLength(3)]
        [Column("CurrencyCode")]
        public string CurrencyCode { get; set; }

        [Column("RateInEUR", TypeName = "money")]
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
