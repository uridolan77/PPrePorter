using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPrePorter.Core.Models.Entities;

namespace PPrePorter.Core.Repositories
{
    /// <summary>
    /// Repository interface for DailyAction entities
    /// </summary>
    public interface IDailyActionRepository
    {
        /// <summary>
        /// Gets daily actions for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Daily actions in the specified date range</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets daily actions for a specific white label
        /// </summary>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>Daily actions for the specified white label</returns>
        Task<IEnumerable<DailyAction>> GetByWhiteLabelIdAsync(int whiteLabelId);

        /// <summary>
        /// Gets daily actions for a specific date range and white label
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>Daily actions for the specified date range and white label</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, int whiteLabelId);

        /// <summary>
        /// Gets daily actions for a specific date range and white labels
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelIds">White label IDs</param>
        /// <returns>Daily actions for the specified date range and white labels</returns>
        Task<IEnumerable<DailyAction>> GetByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<int> whiteLabelIds);

        /// <summary>
        /// Gets aggregated daily actions for a specific date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Aggregated daily actions for the specified date range</returns>
        Task<DailyActionAggregateResult> GetAggregatedByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets aggregated daily actions for a specific date range and white label
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="whiteLabelId">White label ID</param>
        /// <returns>Aggregated daily actions for the specified date range and white label</returns>
        Task<DailyActionAggregateResult> GetAggregatedByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, int whiteLabelId);
    }

    /// <summary>
    /// Aggregated daily action result
    /// </summary>
    public class DailyActionAggregateResult
    {
        /// <summary>
        /// Total registrations
        /// </summary>
        public int TotalRegistrations { get; set; }

        /// <summary>
        /// Total first-time deposits
        /// </summary>
        public int TotalFTD { get; set; }

        /// <summary>
        /// Total deposits
        /// </summary>
        public decimal TotalDeposits { get; set; }

        /// <summary>
        /// Total paid cashouts
        /// </summary>
        public decimal TotalPaidCashouts { get; set; }

        /// <summary>
        /// Total casino bets
        /// </summary>
        public decimal TotalBetsCasino { get; set; }

        /// <summary>
        /// Total casino wins
        /// </summary>
        public decimal TotalWinsCasino { get; set; }

        /// <summary>
        /// Total sport bets
        /// </summary>
        public decimal TotalBetsSport { get; set; }

        /// <summary>
        /// Total sport wins
        /// </summary>
        public decimal TotalWinsSport { get; set; }

        /// <summary>
        /// Total live bets
        /// </summary>
        public decimal TotalBetsLive { get; set; }

        /// <summary>
        /// Total live wins
        /// </summary>
        public decimal TotalWinsLive { get; set; }

        /// <summary>
        /// Total bingo bets
        /// </summary>
        public decimal TotalBetsBingo { get; set; }

        /// <summary>
        /// Total bingo wins
        /// </summary>
        public decimal TotalWinsBingo { get; set; }
    }
}
