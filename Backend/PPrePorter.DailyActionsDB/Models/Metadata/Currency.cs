using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Metadata
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

        [Column("RateInUSD", TypeName = "money")]
        public decimal? RateInUSD { get; set; }

        [Column("RateInGBP", TypeName = "money")]
        public decimal? RateInGBP { get; set; }

        [Column("OrderBy")]
        public byte? OrderBy { get; set; }

        [Column("Multiplier")]
        public int? Multiplier { get; set; }

        [Column("ForLanguagesID")]
        public int? ForLanguagesID { get; set; }

        [StringLength(50)]
        [Column("ForLanguages")]
        public string? ForLanguages { get; set; }

        [Required]
        [Column("UpdatedDate")]
        public DateTime UpdatedDate { get; set; }
    }
}
