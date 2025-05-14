using System;

namespace PPrePorter.Infrastructure.Entities
{
    /// <summary>
    /// Represents a transaction in the PPRePorter database
    /// </summary>
    public class Transaction
    {
        public Transaction()
        {
            // Default constructor
        }

        // Constructor to ensure PlayerID is set correctly when creating a new Transaction
        public Transaction(string playerId)
        {
            PlayerId = playerId; // This will also set PlayerID through the property setter
        }
        public int Id { get; set; }
        public string TransactionId => Id.ToString();
        public DateTime TransactionDate { get; set; }
        private string _playerId = string.Empty;
        public string PlayerId
        {
            get => _playerId;
            set
            {
                _playerId = value;
                // Update PlayerID when PlayerId is set
                if (int.TryParse(value, out int id))
                {
                    PlayerID = id;
                }
            }
        }
        public int PlayerID { get; set; } // Added for compatibility with DashboardService
        public decimal TransactionAmount { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string TransactionSubDetails { get; set; } = string.Empty; // Added for compatibility with DashboardService
        public string CurrencyCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Device { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public string Referrer { get; set; } = string.Empty;
        public string AffiliateId { get; set; } = string.Empty;
        public string CampaignId { get; set; } = string.Empty;
        public string BonusId { get; set; } = string.Empty;
        public string BonusName { get; set; } = string.Empty;
        public string BonusType { get; set; } = string.Empty;
        public decimal? BonusAmount { get; set; }
        public string BonusCurrency { get; set; } = string.Empty;
        public string BonusStatus { get; set; } = string.Empty;
        public DateTime? BonusExpiryDate { get; set; }
        public string WhiteLabelId { get; set; } = string.Empty;
        public string WhiteLabelName { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;

        // Navigation properties
        public virtual Player Player { get; set; }
    }
}
