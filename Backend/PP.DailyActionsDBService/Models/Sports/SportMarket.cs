using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Sports
{
    /// <summary>
    /// Represents a sport market
    /// </summary>
    [Table("SportMarkets", Schema = "dbo")]
    public class SportMarket
    {
        [Key]
        public long ID { get; set; }

        [Required]
        public int MarketTypeID { get; set; }

        [Required]
        [StringLength(255)]
        public string MarketName { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }
    }
}
