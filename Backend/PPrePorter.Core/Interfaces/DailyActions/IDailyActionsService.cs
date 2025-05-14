using PPrePorter.Core.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces.DailyActions
{
    /// <summary>
    /// Interface for the Daily Actions Service
    /// </summary>
    public interface IDailyActionsService
    {
        /// <summary>
        /// Gets filtered daily actions based on the provided filter
        /// </summary>
        /// <param name="filter">The filter to apply</param>
        /// <returns>A response containing the filtered daily actions</returns>
        Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(DailyActionFilterDto filter);

        /// <summary>
        /// Initializes the service by loading initial data
        /// </summary>
        /// <returns>A task representing the asynchronous operation</returns>
        Task InitializeAsync();

        /// <summary>
        /// Gets the raw daily actions data for a specific date range
        /// </summary>
        /// <param name="startDate">The start date</param>
        /// <param name="endDate">The end date</param>
        /// <returns>A list of daily action DTOs</returns>
        Task<List<DailyActionDto>> GetRawDailyActionsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
