using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a player
    /// </summary>
    [Table("tbl_Daily_actions_players")]
    public class Player
    {
        [Key]
        public long PlayerID { get; set; }

        [StringLength(50)]
        public string? CasinoName { get; set; }

        [StringLength(500)]
        public string? Alias { get; set; }

        public DateTime? RegisteredDate { get; set; }

        public DateTime? FirstDepositDate { get; set; }

        [Column(TypeName = "date")]
        public DateTime? DateOfBirth { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }

        [StringLength(50)]
        public string? Country { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; }

        [Column(TypeName = "money")]
        public decimal? Balance { get; set; }

        [Column(TypeName = "money")]
        public decimal? OriginalBalance { get; set; }

        [StringLength(10)]
        public string? AffiliateID { get; set; }

        [StringLength(10)]
        public string? Language { get; set; }

        [StringLength(10)]
        public string? RegisteredPlatform { get; set; }

        [StringLength(256)]
        public string? Email { get; set; }

        public bool? IsOptIn { get; set; }

        public bool? IsBlocked { get; set; }

        public bool? IsTest { get; set; }

        public DateTime? LastLoginDate { get; set; }

        [StringLength(10)]
        public string? VIPLevel { get; set; }

        public DateTime? LastUpdated { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalDeposits { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalWithdrawals { get; set; }

        [StringLength(64)]
        public string? FirstName { get; set; }

        [StringLength(64)]
        public string? LastName { get; set; }

        [StringLength(500)]
        public string? DynamicParameter { get; set; }

        [StringLength(500)]
        public string? ClickId { get; set; }

        [StringLength(5)]
        public string? CountryCode { get; set; }

        [StringLength(64)]
        public string? PhoneNumber { get; set; }

        [StringLength(64)]
        public string? MobileNumber { get; set; }

        [StringLength(64)]
        public string? City { get; set; }

        [StringLength(256)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string? ZipCode { get; set; }

        [StringLength(50)]
        public string? DocumentsStatus { get; set; }

        [StringLength(100)]
        public string? PlatformString { get; set; }

        public bool? SMSEnabled { get; set; }

        public bool? MailEnabled { get; set; }

        public bool? PromotionsEnabled { get; set; }

        public bool? BonusesEnabled { get; set; }

        [StringLength(50)]
        public string? IP { get; set; }

        [StringLength(100)]
        public string? PromotionCode { get; set; }

        public bool? LoggedIn { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        public DateTime? BlockDate { get; set; }

        [StringLength(1000)]
        public string? BlockReason { get; set; }

        public DateTime? BlockReleaseDate { get; set; }

        [StringLength(50)]
        public string? BOAgent { get; set; }

        public DateTime? LastDepositDate { get; set; }

        public int? DepositsCount { get; set; }

        [StringLength(500)]
        public string? WelcomeBonus { get; set; }

        [StringLength(50)]
        public string? BlockType { get; set; }

        [Column(TypeName = "money")]
        public decimal? AccountBalance { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CustomerClubPoints { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalChargeBacks { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalChargebackReverses { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalVoids { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalBonuses { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalCustomerClubPoints { get; set; }

        [Column(TypeName = "money")]
        public decimal? MaxBalance { get; set; }

        public short? Ranking { get; set; }

        [Column(TypeName = "money")]
        public decimal? Wagered { get; set; }

        public int? CasinoID { get; set; }

        [StringLength(5)]
        public string? CurrencySymbol { get; set; }

        [Column(TypeName = "money")]
        public decimal? RevenueEUR { get; set; }

        [StringLength(500)]
        public string? LastLoginPlatform { get; set; }

        public bool? PromotionsMailEnabled { get; set; }

        public bool? PromotionsSMSEnabled { get; set; }

        public bool? PromotionsPhoneEnabled { get; set; }

        public bool? PromotionsPostEnabled { get; set; }

        public bool? PromotionsPartnerEnabled { get; set; }

        [StringLength(500)]
        public string? WelcomeBonusCode { get; set; }

        [StringLength(500)]
        public string? WelcomeBonusDesc { get; set; }

        [StringLength(500)]
        public string? WelcomeBonusSport { get; set; }

        [StringLength(500)]
        public string? WelcomeBonusSportCode { get; set; }

        [StringLength(500)]
        public string? WelcomeBonusSportDesc { get; set; }

        [StringLength(10)]
        public string? RegistrationPlayMode { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalBetsCasino { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalBetsSport { get; set; }

        public int? DepositsCountCasino { get; set; }

        public int? DepositsCountSport { get; set; }

        [StringLength(50)]
        public string? FirstDepositMethod { get; set; }

        [StringLength(50)]
        public string? LastDepositMethod { get; set; }

        public int? FirstBonusID { get; set; }

        public int? LastBonusID { get; set; }

        [Column(TypeName = "money")]
        public decimal? BonusBalanceSport { get; set; }

        public bool? PushEnabled { get; set; }

        public bool? PromotionsPushEnabled { get; set; }

        public DateTime? LastUpdate { get; set; }

        [StringLength(64)]
        public string? FullMobileNumber { get; set; }

        public int? CountryID { get; set; }

        public int? JurisdictionID { get; set; }

        [StringLength(10)]
        public string? Locale { get; set; }

        public bool? IsActivated { get; set; }

        [StringLength(50)]
        public string? AffordabilityAttempts { get; set; }

        [Column(TypeName = "money")]
        public decimal? AffordabilityTreshold { get; set; }

        [Column(TypeName = "money")]
        public decimal? AffordabilityBalance { get; set; }

        [StringLength(50)]
        public string? AffordabilityStatus { get; set; }

        [Column(TypeName = "money")]
        public decimal? AffordabilityIncomeRangeChoice { get; set; }

        public DateTime? AffordabilityLastUpdate { get; set; }

        [Column(TypeName = "money")]
        public decimal? WinningsRestriction { get; set; }

        [Column(TypeName = "money")]
        public decimal? CurrentWinnings { get; set; }

        public DateTime? WinningsRestrictionFailedDate { get; set; }

        [Column(TypeName = "money")]
        public decimal? PendingWithdrawals { get; set; }

        [StringLength(100)]
        public string? Occupation { get; set; }

        [Column(TypeName = "money")]
        public decimal? FTDAmount { get; set; }

        public int? FTDSettlementCompanyID { get; set; }

        public int? Age { get; set; }

        public int? OccupationID { get; set; }

        [Column(TypeName = "money")]
        public decimal? OccupationYearlyIncome { get; set; }

        public int? DepositsCountLive { get; set; }

        public int? DepositsCountBingo { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalBetsLive { get; set; }

        [Column(TypeName = "money")]
        public decimal? TotalBetsBingo { get; set; }

        public bool? PromotionalCasinoEmailEnabled { get; set; }

        public bool? PromotionalCasinoSMSEnabled { get; set; }

        public bool? PromotionalBingoEmailEnabled { get; set; }

        public bool? PromotionalBingoSMSEnabled { get; set; }

        public bool? PromotionalSportsEmailEnabled { get; set; }

        public bool? PromotionalSportsSMSEnabled { get; set; }

        public bool? PromotionalPushEnabled { get; set; }

        public bool? PromotionalPhoneEnabled { get; set; }

        public bool? PromotionalPostEnabled { get; set; }

        public bool? PromotionalPartnerEnabled { get; set; }
    }
}
