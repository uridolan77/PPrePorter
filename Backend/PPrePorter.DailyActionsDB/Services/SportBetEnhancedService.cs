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
    /// Service for sport bet enhanced operations using repository pattern
    /// </summary>
    public class SportBetEnhancedService : ISportBetEnhancedService
    {
        private readonly ISportBetEnhancedRepository _sportBetEnhancedRepository;
        private readonly ILogger<SportBetEnhancedService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public SportBetEnhancedService(
            ISportBetEnhancedRepository sportBetEnhancedRepository,
            ILogger<SportBetEnhancedService> logger)
        {
            _sportBetEnhancedRepository = sportBetEnhancedRepository ?? throw new ArgumentNullException(nameof(sportBetEnhancedRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetAllSportBetsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all sport bets");
                return await _sportBetEnhancedRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport bets");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetEnhanced?> GetSportBetByIdAsync(long id)
        {
            try
            {
                _logger.LogInformation("Getting sport bet by ID {Id}", id);
                return await _sportBetEnhancedRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bet by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByPlayerIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by player ID {PlayerId}", playerId);
                return await _sportBetEnhancedRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by player ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetTypeIdAsync(int betTypeId)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by bet type ID {BetTypeId}", betTypeId);
                return await _sportBetEnhancedRepository.GetByBetTypeIdAsync(betTypeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by bet type ID {BetTypeId}", betTypeId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetStateIdAsync(int betStateId)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by bet state ID {BetStateId}", betStateId);
                return await _sportBetEnhancedRepository.GetByBetStateIdAsync(betStateId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by bet state ID {BetStateId}", betStateId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by date range {StartDate} to {EndDate}", startDate, endDate);
                return await _sportBetEnhancedRepository.GetByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByPlayerIdAndDateRangeAsync(long playerId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                return await _sportBetEnhancedRepository.GetByPlayerIdAndDateRangeAsync(playerId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by player ID {PlayerId} and date range {StartDate} to {EndDate}", playerId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetTypeIdAndDateRangeAsync(int betTypeId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by bet type ID {BetTypeId} and date range {StartDate} to {EndDate}", betTypeId, startDate, endDate);
                return await _sportBetEnhancedRepository.GetByBetTypeIdAndDateRangeAsync(betTypeId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by bet type ID {BetTypeId} and date range {StartDate} to {EndDate}", betTypeId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<SportBetEnhanced>> GetSportBetsByBetStateIdAndDateRangeAsync(int betStateId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting sport bets by bet state ID {BetStateId} and date range {StartDate} to {EndDate}", betStateId, startDate, endDate);
                return await _sportBetEnhancedRepository.GetByBetStateIdAndDateRangeAsync(betStateId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport bets by bet state ID {BetStateId} and date range {StartDate} to {EndDate}", betStateId, startDate, endDate);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetEnhanced> AddSportBetAsync(SportBetEnhanced sportBet)
        {
            if (sportBet == null)
            {
                throw new ArgumentNullException(nameof(sportBet));
            }
            
            try
            {
                _logger.LogInformation("Adding new sport bet for player ID {PlayerId}", sportBet.PlayerID);
                return await _sportBetEnhancedRepository.AddAsync(sportBet);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport bet for player ID {PlayerId}", sportBet.PlayerID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<SportBetEnhanced> UpdateSportBetAsync(SportBetEnhanced sportBet)
        {
            if (sportBet == null)
            {
                throw new ArgumentNullException(nameof(sportBet));
            }
            
            try
            {
                _logger.LogInformation("Updating sport bet with ID {Id}", sportBet.ID);
                
                // Check if the sport bet exists
                var existingSportBet = await _sportBetEnhancedRepository.GetByIdAsync(sportBet.ID);
                if (existingSportBet == null)
                {
                    throw new InvalidOperationException($"Sport bet with ID {sportBet.ID} not found");
                }
                
                return await _sportBetEnhancedRepository.UpdateAsync(sportBet);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport bet with ID {Id}", sportBet.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteSportBetAsync(long id)
        {
            try
            {
                _logger.LogInformation("Deleting sport bet with ID {Id}", id);
                return await _sportBetEnhancedRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport bet with ID {Id}", id);
                throw;
            }
        }
    }
}
