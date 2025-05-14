using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a player in the Core models
    /// </summary>
    public class Player
    {
        public int Id { get; set; }
        public string PlayerID => Id.ToString();
        public int PlayerID_Int => Id;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Alias => Username;
        public DateTime RegistrationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal? TotalDeposits { get; set; }
        public decimal? TotalWithdrawals { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string KycStatus { get; set; } = string.Empty;
        public int CasinoID { get; set; }

        // Navigation properties
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public virtual ICollection<PPrePorter.Domain.Entities.PPReporter.DailyActionGame> DailyActionGames { get; set; } = new List<PPrePorter.Domain.Entities.PPReporter.DailyActionGame>();
    }
}
