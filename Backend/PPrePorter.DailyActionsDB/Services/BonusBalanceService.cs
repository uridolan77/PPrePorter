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
    /// Service for bonus balance operations using repository pattern
    /// </summary>
    public class BonusBalanceService : IBonusBalanceService
    {
        private readonly IBonusBalanceRepository _bonusBalanceRepository;
        private readonly ILogger<BonusBalanceService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public BonusBalanceService(
            IBonusBalanceRepository bonusBalanceRepository,
            ILogger<BonusBalanceService> logger)
        {
            _bonusBalanceRepository = bonusBalanceRepository ?? throw new ArgumentNullException(nameof(bonusBalanceRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<BonusBalance>> GetAllBonusBalancesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all bonus balances");
                return await _bonusBalanceRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all bonus balances");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<BonusBalance?> GetBonusBalanceByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting bonus balance by ID {Id}", id);
                return await _bonusBalanceRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus balance by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<BonusBalance>> GetBonusBalancesByPlayerIdAsync(long playerId)
        {
            try
            {
                _logger.LogInformation("Getting bonus balances by player ID {PlayerId}", playerId);
                return await _bonusBalanceRepository.GetByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus balances by player ID {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<BonusBalance>> GetBonusBalancesByBonusIdAsync(int bonusId)
        {
            try
            {
                _logger.LogInformation("Getting bonus balances by bonus ID {BonusId}", bonusId);
                return await _bonusBalanceRepository.GetByBonusIdAsync(bonusId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus balances by bonus ID {BonusId}", bonusId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<BonusBalance>> GetBonusBalancesByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status cannot be null or empty", nameof(status));
            }
            
            try
            {
                _logger.LogInformation("Getting bonus balances by status {Status}", status);
                return await _bonusBalanceRepository.GetByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus balances by status {Status}", status);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<BonusBalance>> GetBonusBalancesByPlayerIdAndBonusIdAsync(long playerId, int bonusId)
        {
            try
            {
                _logger.LogInformation("Getting bonus balances by player ID {PlayerId} and bonus ID {BonusId}", playerId, bonusId);
                return await _bonusBalanceRepository.GetByPlayerIdAndBonusIdAsync(playerId, bonusId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus balances by player ID {PlayerId} and bonus ID {BonusId}", playerId, bonusId);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<BonusBalance> AddBonusBalanceAsync(BonusBalance bonusBalance)
        {
            if (bonusBalance == null)
            {
                throw new ArgumentNullException(nameof(bonusBalance));
            }
            
            try
            {
                _logger.LogInformation("Adding new bonus balance for player ID {PlayerId} and bonus ID {BonusId}", bonusBalance.PlayerID, bonusBalance.BonusID);
                return await _bonusBalanceRepository.AddAsync(bonusBalance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bonus balance for player ID {PlayerId} and bonus ID {BonusId}", bonusBalance.PlayerID, bonusBalance.BonusID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<BonusBalance> UpdateBonusBalanceAsync(BonusBalance bonusBalance)
        {
            if (bonusBalance == null)
            {
                throw new ArgumentNullException(nameof(bonusBalance));
            }
            
            try
            {
                _logger.LogInformation("Updating bonus balance with ID {Id}", bonusBalance.ID);
                
                // Check if the bonus balance exists
                var existingBonusBalance = await _bonusBalanceRepository.GetByIdAsync(bonusBalance.ID);
                if (existingBonusBalance == null)
                {
                    throw new InvalidOperationException($"Bonus balance with ID {bonusBalance.ID} not found");
                }
                
                return await _bonusBalanceRepository.UpdateAsync(bonusBalance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating bonus balance with ID {Id}", bonusBalance.ID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteBonusBalanceAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting bonus balance with ID {Id}", id);
                return await _bonusBalanceRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting bonus balance with ID {Id}", id);
                throw;
            }
        }
    }
}
