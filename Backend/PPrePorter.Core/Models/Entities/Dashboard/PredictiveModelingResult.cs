using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents the result of predictive modeling
    /// </summary>
    public class PredictiveModelingResult
    {
        /// <summary>
        /// Model name
        /// </summary>
        public string ModelName { get; set; }

        /// <summary>
        /// Model type
        /// </summary>
        public string ModelType { get; set; }

        /// <summary>
        /// Target metric
        /// </summary>
        public string TargetMetric { get; set; }

        /// <summary>
        /// Forecast horizon (in days)
        /// </summary>
        public int ForecastHorizon { get; set; }

        /// <summary>
        /// Forecast start date
        /// </summary>
        public DateTime ForecastStartDate { get; set; }

        /// <summary>
        /// Forecast end date
        /// </summary>
        public DateTime ForecastEndDate { get; set; }

        /// <summary>
        /// Training start date
        /// </summary>
        public DateTime TrainingStartDate { get; set; }

        /// <summary>
        /// Training end date
        /// </summary>
        public DateTime TrainingEndDate { get; set; }

        /// <summary>
        /// Model accuracy
        /// </summary>
        public decimal ModelAccuracy { get; set; }

        /// <summary>
        /// Mean absolute error
        /// </summary>
        public decimal MeanAbsoluteError { get; set; }

        /// <summary>
        /// Mean squared error
        /// </summary>
        public decimal MeanSquaredError { get; set; }

        /// <summary>
        /// R-squared
        /// </summary>
        public decimal RSquared { get; set; }

        /// <summary>
        /// Forecast data points
        /// </summary>
        public List<ForecastPoint> ForecastPoints { get; set; } = new List<ForecastPoint>();

        /// <summary>
        /// Historical data points
        /// </summary>
        public List<DataPoint> HistoricalPoints { get; set; } = new List<DataPoint>();

        /// <summary>
        /// Feature importance
        /// </summary>
        public Dictionary<string, decimal> FeatureImportance { get; set; } = new Dictionary<string, decimal>();

        /// <summary>
        /// Insights
        /// </summary>
        public List<string> Insights { get; set; } = new List<string>();

        /// <summary>
        /// Recommendations
        /// </summary>
        public List<string> Recommendations { get; set; } = new List<string>();
    }
}
