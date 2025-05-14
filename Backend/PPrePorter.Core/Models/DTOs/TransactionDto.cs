using System;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for transaction data
    /// </summary>
    public class TransactionDto
    {
        /// <summary>
        /// The transaction ID (database ID)
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The transaction ID (business ID)
        /// </summary>
        public string TransactionId { get; set; }

        /// <summary>
        /// The transaction info ID
        /// </summary>
        public string TransactionInfoId { get; set; }

        /// <summary>
        /// The player ID
        /// </summary>
        public string PlayerId { get; set; }

        /// <summary>
        /// The player name
        /// </summary>
        public string PlayerName { get; set; }

        /// <summary>
        /// The white label ID
        /// </summary>
        public string WhiteLabelId { get; set; }

        /// <summary>
        /// The white label name
        /// </summary>
        public string WhiteLabelName { get; set; }

        /// <summary>
        /// The transaction date
        /// </summary>
        public DateTime TransactionDate { get; set; }

        /// <summary>
        /// The transaction type
        /// </summary>
        public string TransactionType { get; set; }

        /// <summary>
        /// The transaction amount
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// The transaction currency
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// The transaction status
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// The payment method
        /// </summary>
        public string PaymentMethod { get; set; }

        /// <summary>
        /// The transaction description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The transaction platform
        /// </summary>
        public string Platform { get; set; }

        /// <summary>
        /// The transaction IP address
        /// </summary>
        public string IpAddress { get; set; }

        /// <summary>
        /// The transaction country
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// The transaction device
        /// </summary>
        public string Device { get; set; }

        /// <summary>
        /// The transaction browser
        /// </summary>
        public string Browser { get; set; }

        /// <summary>
        /// The transaction operating system
        /// </summary>
        public string OperatingSystem { get; set; }

        /// <summary>
        /// The transaction referrer
        /// </summary>
        public string Referrer { get; set; }

        /// <summary>
        /// The transaction affiliate ID
        /// </summary>
        public string AffiliateId { get; set; }

        /// <summary>
        /// The transaction campaign ID
        /// </summary>
        public string CampaignId { get; set; }

        /// <summary>
        /// The transaction bonus ID
        /// </summary>
        public string BonusId { get; set; }

        /// <summary>
        /// The transaction bonus name
        /// </summary>
        public string BonusName { get; set; }

        /// <summary>
        /// The transaction bonus type
        /// </summary>
        public string BonusType { get; set; }

        /// <summary>
        /// The transaction bonus amount
        /// </summary>
        public decimal? BonusAmount { get; set; }

        /// <summary>
        /// The transaction bonus currency
        /// </summary>
        public string BonusCurrency { get; set; }

        /// <summary>
        /// The transaction bonus status
        /// </summary>
        public string BonusStatus { get; set; }

        /// <summary>
        /// The transaction bonus expiry date
        /// </summary>
        public DateTime? BonusExpiryDate { get; set; }
    }
}
