using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a comprehensive story generated from dashboard data
    /// </summary>
    public class DashboardStory
    {
        /// <summary>
        /// Unique identifier for the story
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Title of the story
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Summary of the story
        /// </summary>
        public string Summary { get; set; }

        /// <summary>
        /// Date and time when the story was generated
        /// </summary>
        public DateTime GeneratedAt { get; set; }

        /// <summary>
        /// Start date of the period covered by the story
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the period covered by the story
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Key insights in the story
        /// </summary>
        public List<DashboardInsight> KeyInsights { get; set; } = new List<DashboardInsight>();

        /// <summary>
        /// Revenue section of the story
        /// </summary>
        public StorySection RevenueSection { get; set; }

        /// <summary>
        /// Registration section of the story
        /// </summary>
        public StorySection RegistrationSection { get; set; }

        /// <summary>
        /// Games section of the story
        /// </summary>
        public StorySection GamesSection { get; set; }

        /// <summary>
        /// Transactions section of the story
        /// </summary>
        public StorySection TransactionsSection { get; set; }

        /// <summary>
        /// Anomalies detected in the data
        /// </summary>
        public List<DataAnomaly> Anomalies { get; set; } = new List<DataAnomaly>();

        /// <summary>
        /// Forecasts for the next period
        /// </summary>
        public List<Forecast> Forecasts { get; set; } = new List<Forecast>();

        /// <summary>
        /// User ID who generated the story
        /// </summary>
        public int UserId { get; set; }
    }

    /// <summary>
    /// Represents a section of the dashboard story
    /// </summary>
    public class StorySection
    {
        /// <summary>
        /// Title of the section
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Summary of the section
        /// </summary>
        public string Summary { get; set; }

        /// <summary>
        /// Insights in the section
        /// </summary>
        public List<DashboardInsight> Insights { get; set; } = new List<DashboardInsight>();

        /// <summary>
        /// Data points supporting the section
        /// </summary>
        public List<DataPoint> SupportingData { get; set; } = new List<DataPoint>();
    }

    /// <summary>
    /// Represents a forecast for a metric
    /// </summary>
    public class Forecast
    {
        /// <summary>
        /// Metric being forecasted
        /// </summary>
        public string MetricKey { get; set; }

        /// <summary>
        /// Forecasted values
        /// </summary>
        public List<ForecastPoint> Values { get; set; } = new List<ForecastPoint>();

        /// <summary>
        /// Confidence level of the forecast (0-1)
        /// </summary>
        public double ConfidenceLevel { get; set; }

        /// <summary>
        /// Method used for forecasting
        /// </summary>
        public string ForecastMethod { get; set; }
    }

    /// <summary>
    /// Represents a single point in a forecast
    /// </summary>
    public class ForecastPoint
    {
        /// <summary>
        /// Date of the forecast point
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Forecasted value
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Lower bound of the confidence interval
        /// </summary>
        public decimal LowerBound { get; set; }

        /// <summary>
        /// Upper bound of the confidence interval
        /// </summary>
        public decimal UpperBound { get; set; }
    }
}
