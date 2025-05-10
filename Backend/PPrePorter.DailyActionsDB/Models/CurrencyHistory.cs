using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a currency history record
    /// </summary>
    [Table("tbl_Currency_history", Schema = "common")]
    public class CurrencyHistory
    {
        [Key]
        [Column("currency_id")]
        public byte CurrencyId { get; set; }

        [Column("rate_in_EUR", TypeName = "money")]
        public decimal? RateInEUR { get; set; }

        [Required]
        [Column("updated_dt")]
        public DateTime UpdatedDate { get; set; }
    }
}
