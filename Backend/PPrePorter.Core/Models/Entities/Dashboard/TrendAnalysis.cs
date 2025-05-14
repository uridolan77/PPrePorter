using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents options for trend analysis
    /// </summary>
    public class TrendAnalysisOptions
    {
        /// <summary>
        /// Type of trend analysis to perform (e.g., "linear", "seasonal", "moving_average")
        /// </summary>
        public string AnalysisType { get; set; } = "linear";

        /// <summary>
        /// Period for seasonal analysis (e.g., 7 for weekly, 30 for monthly)
        /// </summary>
        public int? SeasonalPeriod { get; set; }

        /// <summary>
        /// Window size for moving average analysis
        /// </summary>
        public int? MovingAverageWindow { get; set; }

        /// <summary>
        /// Whether to include forecasting in the analysis
        /// </summary>
        public bool IncludeForecasting { get; set; } = false;

        /// <summary>
        /// Number of periods to forecast
        /// </summary>
        public int ForecastPeriods { get; set; } = 7;

        /// <summary>
        /// Confidence level for forecasting (0-1)
        /// </summary>
        public double ConfidenceLevel { get; set; } = 0.95;

        /// <summary>
        /// Whether to detect anomalies in the data
        /// </summary>
        public bool DetectAnomalies { get; set; } = true;

        /// <summary>
        /// Sensitivity for anomaly detection (0-1)
        /// </summary>
        public double AnomalySensitivity { get; set; } = 0.5;

        /// <summary>
        /// Whether to decompose the trend into components
        /// </summary>
        public bool DecomposeTrend { get; set; } = false;
    }

    /// <summary>
    /// Represents the result of trend analysis
    /// </summary>
    public class TrendAnalysisResult
    {
        /// <summary>
        /// Type of trend analysis performed
        /// </summary>
        public string AnalysisType { get; set; }

        /// <summary>
        /// Original data points
        /// </summary>
        public List<DataPoint> OriginalData { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Trend line data points
        /// </summary>
        public List<DataPoint> TrendLine { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Forecasted data points
        /// </summary>
        public List<ForecastPoint> Forecast { get; set; } = new List<ForecastPoint>();

        /// <summary>
        /// Detected anomalies
        /// </summary>
        public List<DataAnomaly> Anomalies { get; set; } = new List<DataAnomaly>();

        /// <summary>
        /// Trend direction ("Increasing", "Decreasing", "Stable", "Volatile")
        /// </summary>
        public string TrendDirection { get; set; }

        /// <summary>
        /// Trend strength (0-1)
        /// </summary>
        public double TrendStrength { get; set; }

        /// <summary>
        /// Rate of change (e.g., percentage change per period)
        /// </summary>
        public double RateOfChange { get; set; }

        /// <summary>
        /// Seasonality detected in the data
        /// </summary>
        public bool HasSeasonality { get; set; }

        /// <summary>
        /// Period of seasonality (if detected)
        /// </summary>
        public int? SeasonalPeriod { get; set; }

        /// <summary>
        /// Seasonal components (if decomposition was performed)
        /// </summary>
        public List<DataPoint> SeasonalComponent { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Residual components (if decomposition was performed)
        /// </summary>
        public List<DataPoint> ResidualComponent { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Statistical measures of the trend
        /// </summary>
        public TrendStatistics Statistics { get; set; } = new TrendStatistics();

        /// <summary>
        /// Narrative summary of the trend analysis
        /// </summary>
        public string Summary { get; set; }

        /// <summary>
        /// Insights derived from the trend analysis
        /// </summary>
        public List<DashboardInsight> Insights { get; set; } = new List<DashboardInsight>();
    }

    /// <summary>
    /// Represents statistical measures of a trend
    /// </summary>
    public class TrendStatistics
    {
        /// <summary>
        /// R-squared value (coefficient of determination)
        /// </summary>
        public double RSquared { get; set; }

        /// <summary>
        /// Mean absolute error
        /// </summary>
        public double MeanAbsoluteError { get; set; }

        /// <summary>
        /// Mean squared error
        /// </summary>
        public double MeanSquaredError { get; set; }

        /// <summary>
        /// Root mean squared error
        /// </summary>
        public double RootMeanSquaredError { get; set; }

        /// <summary>
        /// Mean absolute percentage error
        /// </summary>
        public double MeanAbsolutePercentageError { get; set; }

        /// <summary>
        /// P-value for the trend
        /// </summary>
        public double PValue { get; set; }

        /// <summary>
        /// Autocorrelation at lag 1
        /// </summary>
        public double Autocorrelation { get; set; }
    }

    /// <summary>
    /// Represents a correlation between two metrics
    /// </summary>
    public class MetricCorrelation
    {
        /// <summary>
        /// First metric key
        /// </summary>
        public string Metric1 { get; set; }

        /// <summary>
        /// Second metric key
        /// </summary>
        public string Metric2 { get; set; }

        /// <summary>
        /// Correlation coefficient (-1 to 1)
        /// </summary>
        public double CorrelationCoefficient { get; set; }

        /// <summary>
        /// P-value for the correlation
        /// </summary>
        public double PValue { get; set; }

        /// <summary>
        /// Strength of the correlation ("Strong", "Moderate", "Weak", "None")
        /// </summary>
        public string CorrelationStrength { get; set; }

        /// <summary>
        /// Direction of the correlation ("Positive", "Negative", "None")
        /// </summary>
        public string CorrelationDirection { get; set; }

        /// <summary>
        /// Lag between the metrics (if time-lagged correlation was performed)
        /// </summary>
        public int? Lag { get; set; }

        /// <summary>
        /// Interpretation of the correlation
        /// </summary>
        public string Interpretation { get; set; }

        /// <summary>
        /// Whether the correlation is statistically significant
        /// </summary>
        public bool IsSignificant { get; set; }

        /// <summary>
        /// Scatter plot data points
        /// </summary>
        public List<ScatterPoint> ScatterPlotData { get; set; } = new List<ScatterPoint>();
    }

    /// <summary>
    /// Represents a point in a scatter plot
    /// </summary>
    public class ScatterPoint
    {
        /// <summary>
        /// X-coordinate (first metric value)
        /// </summary>
        public decimal X { get; set; }

        /// <summary>
        /// Y-coordinate (second metric value)
        /// </summary>
        public decimal Y { get; set; }

        /// <summary>
        /// Date associated with the point
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Label for the point (optional)
        /// </summary>
        public string Label { get; set; }
    }
}
