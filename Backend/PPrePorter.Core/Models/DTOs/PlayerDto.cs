using System;

namespace PPrePorter.Core.Models.DTOs
{
    /// <summary>
    /// DTO for player data
    /// </summary>
    public class PlayerDto
    {
        /// <summary>
        /// The player ID
        /// </summary>
        public long PlayerID { get; set; }

        /// <summary>
        /// The casino name
        /// </summary>
        public string? CasinoName { get; set; }

        /// <summary>
        /// The player alias
        /// </summary>
        public string? Alias { get; set; }

        /// <summary>
        /// The registration date
        /// </summary>
        public DateTime? RegisteredDate { get; set; }

        /// <summary>
        /// The first deposit date
        /// </summary>
        public DateTime? FirstDepositDate { get; set; }

        /// <summary>
        /// The date of birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// The gender
        /// </summary>
        public string? Gender { get; set; }

        /// <summary>
        /// The country
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// The currency
        /// </summary>
        public string? Currency { get; set; }

        /// <summary>
        /// The balance
        /// </summary>
        public decimal? Balance { get; set; }

        /// <summary>
        /// The original balance
        /// </summary>
        public decimal? OriginalBalance { get; set; }

        /// <summary>
        /// The affiliate ID
        /// </summary>
        public string? AffiliateID { get; set; }

        /// <summary>
        /// The language
        /// </summary>
        public string? Language { get; set; }

        /// <summary>
        /// The registered platform
        /// </summary>
        public string? RegisteredPlatform { get; set; }

        /// <summary>
        /// The email
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Whether the player has opted in
        /// </summary>
        public bool? IsOptIn { get; set; }

        /// <summary>
        /// Whether the player is blocked
        /// </summary>
        public bool? IsBlocked { get; set; }

        /// <summary>
        /// Whether the player is a test account
        /// </summary>
        public bool? IsTest { get; set; }

        /// <summary>
        /// The last login date
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// The VIP level
        /// </summary>
        public string? VIPLevel { get; set; }

        /// <summary>
        /// The last updated date
        /// </summary>
        public DateTime? LastUpdated { get; set; }

        /// <summary>
        /// The total deposits
        /// </summary>
        public decimal? TotalDeposits { get; set; }

        /// <summary>
        /// The total withdrawals
        /// </summary>
        public decimal? TotalWithdrawals { get; set; }

        /// <summary>
        /// Whether mail is enabled
        /// </summary>
        public bool? MailEnabled { get; set; }

        /// <summary>
        /// Whether promotions are enabled
        /// </summary>
        public bool? PromotionsEnabled { get; set; }

        /// <summary>
        /// Whether bonuses are enabled
        /// </summary>
        public bool? BonusesEnabled { get; set; }

        /// <summary>
        /// The IP address
        /// </summary>
        public string? IP { get; set; }

        /// <summary>
        /// The promotion code
        /// </summary>
        public string? PromotionCode { get; set; }

        /// <summary>
        /// Whether the player is logged in
        /// </summary>
        public bool? LoggedIn { get; set; }

        /// <summary>
        /// The status
        /// </summary>
        public string? Status { get; set; }
    }
}
