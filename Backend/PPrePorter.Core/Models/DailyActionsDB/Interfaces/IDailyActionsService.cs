using PPrePorter.Core.Models.DailyActionsDB.Models.DTOs;
using System;
using System.Threading.Tasks;

namespace PPrePorter.Core.Models.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for the DailyActionsDB service
    /// </summary>
    public interface IDailyActionsService
    {
        /// <summary>
        /// Gets filtered daily actions based on the provided filter
        /// </summary>
        Task<DailyActionResponseDto> GetFilteredDailyActionsAsync(DailyActionFilterDto filter);

        /// <summary>
        /// Initializes the service by loading initial data
        /// </summary>
        Task PrewarmCacheAsync();
    }
}
