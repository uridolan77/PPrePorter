using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Repositories
{
    /// <summary>
    /// Repository interface for SportMatch entities
    /// </summary>
    public interface ISportMatchRepository : IBaseRepository<SportMatch>
    {
        /// <summary>
        /// Get sport match by name
        /// </summary>
        /// <param name="name">Sport match name</param>
        /// <returns>Sport match or null if not found</returns>
        Task<SportMatch?> GetByNameAsync(string name);
        
        /// <summary>
        /// Get sport matches by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport matches by competition ID
        /// </summary>
        /// <param name="competitionId">Competition ID</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetByCompetitionIdAsync(int competitionId);
        
        /// <summary>
        /// Get sport matches by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport matches by competition ID and date range
        /// </summary>
        /// <param name="competitionId">Competition ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetByCompetitionIdAndDateRangeAsync(int competitionId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get upcoming sport matches
        /// </summary>
        /// <param name="count">Number of matches to return</param>
        /// <returns>List of upcoming sport matches</returns>
        Task<IEnumerable<SportMatch>> GetUpcomingMatchesAsync(int count = 10);
    }
}
