using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a player registration data point for the dashboard
    /// </summary>
    public class PlayerRegistrationItem
    {
        /// <summary>
        /// Date of the registration data
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Number of new registrations on the date
        /// </summary>
        public int RegistrationCount { get; set; }

        /// <summary>
        /// Number of first-time depositors on the date
        /// </summary>
        public int FirstTimeDepositorCount { get; set; }

        /// <summary>
        /// Total deposit amount from first-time depositors on the date
        /// </summary>
        public decimal FirstTimeDepositAmount { get; set; }

        /// <summary>
        /// Average first deposit amount on the date
        /// </summary>
        public decimal AverageFirstDepositAmount { get; set; }

        /// <summary>
        /// Conversion rate from registration to first deposit on the date
        /// </summary>
        public decimal ConversionRate { get; set; }

        /// <summary>
        /// White label ID (if filtered by white label)
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// White label name (if filtered by white label)
        /// </summary>
        public string WhiteLabelName { get; set; }

        /// <summary>
        /// Country code (if filtered by country)
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Country name (if filtered by country)
        /// </summary>
        public string CountryName { get; set; }
    }
}
