using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a free spins offer for a game
    /// </summary>
    [Table("GamesFreeSpinsOffers", Schema = "dbo")]
    public class GameFreeSpinsOffer
    {
        [Key]
        public int OfferID { get; set; }

        [Required]
        [StringLength(50)]
        public string OfferCode { get; set; }

        public int? SpinsNumber { get; set; }

        public int? GameID { get; set; }

        public bool? IsActive { get; set; }

        [StringLength(500)]
        public string? OfferDescription { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool? IsSportBet { get; set; }
    }
}
