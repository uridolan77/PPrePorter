using System;
using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Comprehensive filter DTO for DailyActions report
    /// </summary>
    public class DailyActionFilterDto
    {
        // Basic date range filters
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // White Label filters
        public List<int>? WhiteLabelIds { get; set; }

        // Organization options
        public GroupByOption GroupBy { get; set; } = GroupByOption.Day;

        // Tracking filters
        public List<string>? Trackers { get; set; }
        public string? PromotionCode { get; set; }

        // Registration and play mode filters
        public List<string>? RegistrationPlayModes { get; set; }

        // Language and country filters
        public List<string>? Languages { get; set; }
        public List<string>? Countries { get; set; }

        // Currency filter
        public List<string>? Currencies { get; set; }

        // Gender filter
        public List<string>? Genders { get; set; }

        // Status filter
        public List<string>? Statuses { get; set; }

        // Platform filter
        public List<string>? Platforms { get; set; }

        // Player type filter
        public List<string>? PlayerTypes { get; set; }

        // Communication preferences filters
        public bool? SmsEnabled { get; set; }
        public bool? MailEnabled { get; set; }
        public bool? PhoneEnabled { get; set; }
        public bool? PostEnabled { get; set; }
        public bool? BonusEnabled { get; set; }

        // Player-specific filters
        public List<long>? PlayerIds { get; set; }

        // Registration date range
        public DateTime? RegistrationStartDate { get; set; }
        public DateTime? RegistrationEndDate { get; set; }

        // First time deposit date range
        public DateTime? FirstTimeDepositStartDate { get; set; }
        public DateTime? FirstTimeDepositEndDate { get; set; }

        // Last deposit date range
        public DateTime? LastDepositStartDate { get; set; }
        public DateTime? LastDepositEndDate { get; set; }

        // Last login date range
        public DateTime? LastLoginStartDate { get; set; }
        public DateTime? LastLoginEndDate { get; set; }

        // Block date range
        public DateTime? BlockStartDate { get; set; }
        public DateTime? BlockEndDate { get; set; }

        // Unblock date range
        public DateTime? UnblockStartDate { get; set; }
        public DateTime? UnblockEndDate { get; set; }

        // Last updated date range
        public DateTime? LastUpdatedStartDate { get; set; }
        public DateTime? LastUpdatedEndDate { get; set; }

        // Pagination
        public int PageSize { get; set; } = 50;
        public int PageNumber { get; set; } = 1;
    }

    /// <summary>
    /// Group by options for DailyActions report
    /// </summary>
    public enum GroupByOption
    {
        /// <summary>Group by day</summary>
        Day,

        /// <summary>Group by month</summary>
        Month,

        /// <summary>Group by year</summary>
        Year,

        /// <summary>Group by white label</summary>
        Label,

        /// <summary>Group by country</summary>
        Country,

        /// <summary>Group by tracker</summary>
        Tracker,

        /// <summary>Group by currency</summary>
        Currency,

        /// <summary>Group by gender</summary>
        Gender,

        /// <summary>Group by platform</summary>
        Platform,

        /// <summary>Group by ranking</summary>
        Ranking
    }
}
