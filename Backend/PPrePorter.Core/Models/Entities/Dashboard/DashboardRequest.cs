using System;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a request for dashboard data
    /// </summary>
    public class DashboardRequest
    {
        /// <summary>
        /// Start date for the dashboard data
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date for the dashboard data
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// White label ID filter (optional)
        /// </summary>
        public int? WhiteLabelId { get; set; }

        /// <summary>
        /// Game ID filter (optional)
        /// </summary>
        public int? GameId { get; set; }

        /// <summary>
        /// Country code filter (optional)
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Player ID filter (optional)
        /// </summary>
        public int? PlayerId { get; set; }

        /// <summary>
        /// Time interval for grouping data (e.g., "day", "week", "month")
        /// </summary>
        public string Interval { get; set; } = "day";

        /// <summary>
        /// Maximum number of items to return
        /// </summary>
        public int Limit { get; set; } = 100;

        /// <summary>
        /// User ID making the request
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Whether to include comparison with previous period
        /// </summary>
        public bool IncludeComparison { get; set; } = true;

        /// <summary>
        /// Whether to include anomaly detection
        /// </summary>
        public bool IncludeAnomalies { get; set; } = true;

        /// <summary>
        /// Whether to include trend analysis
        /// </summary>
        public bool IncludeTrends { get; set; } = true;

        /// <summary>
        /// Whether to include forecasting
        /// </summary>
        public bool IncludeForecasts { get; set; } = false;

        /// <summary>
        /// Number of days to forecast (if forecasting is enabled)
        /// </summary>
        public int ForecastDays { get; set; } = 7;
    }
}
