using System;
using System.Collections.Generic;

namespace PPrePorter.Infrastructure.Entities
{
    /// <summary>
    /// Represents a player in the PPRePorter database
    /// </summary>
    public class Player
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal? TotalDeposits { get; set; }
        public decimal? TotalWithdrawals { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string KycStatus { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public virtual ICollection<Domain.Entities.PPReporter.DailyActionGame> DailyActionGames { get; set; } = new List<Domain.Entities.PPReporter.DailyActionGame>();
    }
}
