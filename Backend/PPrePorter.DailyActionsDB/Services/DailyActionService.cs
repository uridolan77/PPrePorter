using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service implementation for DailyAction operations
    /// </summary>
    public class DailyActionService : IDailyActionService
    {
        private readonly IDailyActionRepository _dailyActionRepository;
        private readonly ILogger<DailyActionService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionService(
            IDailyActionRepository dailyActionRepository,
            ILogger<DailyActionService> logger)
        {
            _dailyActionRepository = dailyActionRepository ?? throw new ArgumentNullException(nameof(dailyActionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetAllDailyActionsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all daily actions (includeInactive: {IncludeInactive})", includeInactive);
                return await _dailyActionRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all daily actions");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyAction?> GetDailyActionByIdAsync(long id)
        {
            try
            {
                _logger.LogInformation("Getting daily action by ID {Id}", id);
                return await _dailyActionRepository.GetByIdAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily action by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _dailyActionRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByWhiteLabelIdAsync(short whiteLabelId)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by white label ID {WhiteLabelId}", whiteLabelId);
                return await _dailyActionRepository.GetByWhiteLabelIdAsync(whiteLabelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by white label ID {WhiteLabelId}", whiteLabelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndWhiteLabelIdAsync(DateTime startDate, DateTime endDate, short whiteLabelId)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by date range {StartDate} to {EndDate} and white label ID {WhiteLabelId}", 
                    startDate, endDate, whiteLabelId);
                return await _dailyActionRepository.GetByDateRangeAndWhiteLabelIdAsync(startDate, endDate, whiteLabelId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and white label ID {WhiteLabelId}", 
                    startDate, endDate, whiteLabelId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndWhiteLabelIdsAsync(DateTime startDate, DateTime endDate, IEnumerable<short> whiteLabelIds)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by date range {StartDate} to {EndDate} and white label IDs {WhiteLabelIds}", 
                    startDate, endDate, string.Join(", ", whiteLabelIds));
                return await _dailyActionRepository.GetByDateRangeAndWhiteLabelIdsAsync(startDate, endDate, whiteLabelIds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and white label IDs {WhiteLabelIds}", 
                    startDate, endDate, string.Join(", ", whiteLabelIds));
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByPlayerIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by player ID {PlayerId}", playerId);
                return await _dailyActionRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by player ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<DailyAction>> GetDailyActionsByDateRangeAndPlayerIdAsync(DateTime startDate, DateTime endDate, long playerId)
        {
            try
            {
                _logger.LogInformation("Getting daily actions by date range {StartDate} to {EndDate} and player ID {PlayerId}", 
                    startDate, endDate, playerId);
                return await _dailyActionRepository.GetByDateRangeAndPlayerIdAsync(startDate, endDate, playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily actions by date range {StartDate} to {EndDate} and player ID {PlayerId}", 
                    startDate, endDate, playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyAction> AddDailyActionAsync(DailyAction dailyAction)
        {
            if (dailyAction == null)
            {
                throw new ArgumentNullException(nameof(dailyAction));
            }
            
            try
            {
                _logger.LogInformation("Adding new daily action for date {Date} and white label ID {WhiteLabelId}", 
                    dailyAction.Date, dailyAction.WhiteLabelID);
                return await _dailyActionRepository.AddAsync(dailyAction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding daily action for date {Date} and white label ID {WhiteLabelId}", 
                    dailyAction.Date, dailyAction.WhiteLabelID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<DailyAction> UpdateDailyActionAsync(DailyAction dailyAction)
        {
            if (dailyAction == null)
            {
                throw new ArgumentNullException(nameof(dailyAction));
            }
            
            try
            {
                _logger.LogInformation("Updating daily action with ID {Id}", dailyAction.Id);
                return await _dailyActionRepository.UpdateAsync(dailyAction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily action with ID {Id}", dailyAction.Id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteDailyActionAsync(long id)
        {
            try
            {
                _logger.LogInformation("Deleting daily action with ID {Id}", id);
                return await _dailyActionRepository.DeleteAsync((int)id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting daily action with ID {Id}", id);
                throw;
            }
        }
    }
}
