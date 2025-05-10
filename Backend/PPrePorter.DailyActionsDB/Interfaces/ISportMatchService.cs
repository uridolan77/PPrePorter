using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Interfaces
{
    /// <summary>
    /// Interface for sport match service
    /// </summary>
    public interface ISportMatchService
    {
        /// <summary>
        /// Get all sport matches
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive sport matches</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetAllSportMatchesAsync(bool includeInactive = false);
        
        /// <summary>
        /// Get a specific sport match by ID
        /// </summary>
        /// <param name="id">Sport match ID</param>
        /// <returns>Sport match or null if not found</returns>
        Task<SportMatch?> GetSportMatchByIdAsync(int id);
        
        /// <summary>
        /// Get a specific sport match by name
        /// </summary>
        /// <param name="name">Sport match name</param>
        /// <returns>Sport match or null if not found</returns>
        Task<SportMatch?> GetSportMatchByNameAsync(string name);
        
        /// <summary>
        /// Get sport matches by active status
        /// </summary>
        /// <param name="isActive">Active status</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetSportMatchesByActiveStatusAsync(bool isActive);
        
        /// <summary>
        /// Get sport matches by competition ID
        /// </summary>
        /// <param name="competitionId">Competition ID</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetSportMatchesByCompetitionIdAsync(int competitionId);
        
        /// <summary>
        /// Get sport matches by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetSportMatchesByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get sport matches by competition ID and date range
        /// </summary>
        /// <param name="competitionId">Competition ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of sport matches</returns>
        Task<IEnumerable<SportMatch>> GetSportMatchesByCompetitionIdAndDateRangeAsync(int competitionId, DateTime startDate, DateTime endDate);
        
        /// <summary>
        /// Get upcoming sport matches
        /// </summary>
        /// <param name="count">Number of matches to return</param>
        /// <returns>List of upcoming sport matches</returns>
        Task<IEnumerable<SportMatch>> GetUpcomingSportMatchesAsync(int count = 10);
        
        /// <summary>
        /// Add a new sport match
        /// </summary>
        /// <param name="sportMatch">Sport match to add</param>
        /// <returns>Added sport match</returns>
        Task<SportMatch> AddSportMatchAsync(SportMatch sportMatch);
        
        /// <summary>
        /// Update an existing sport match
        /// </summary>
        /// <param name="sportMatch">Sport match to update</param>
        /// <returns>Updated sport match</returns>
        Task<SportMatch> UpdateSportMatchAsync(SportMatch sportMatch);
        
        /// <summary>
        /// Delete a sport match
        /// </summary>
        /// <param name="id">Sport match ID</param>
        /// <returns>True if deleted, false if not found</returns>
        Task<bool> DeleteSportMatchAsync(int id);
    }
}
