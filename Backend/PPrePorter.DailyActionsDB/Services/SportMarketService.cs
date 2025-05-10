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
    /// Service for sport market operations using repository pattern
    /// </summary>
    public class SportMarketService : ISportMarketService
    {
        private readonly ISportMarketRepository _sportMarketRepository;
        private readonly ILogger<SportMarketService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public SportMarketService(
            ISportMarketRepository sportMarketRepository,
            ILogger<SportMarketService> logger)
        {
            _sportMarketRepository = sportMarketRepository ?? throw new ArgumentNullException(nameof(sportMarketRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetAllSportMarketsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all sport markets (includeInactive: {IncludeInactive})", includeInactive);
                return await _sportMarketRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sport markets");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMarket?> GetSportMarketByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting sport market by ID {Id}", id);
                return await _sportMarketRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport market by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetSportMarketsByMatchIdAsync(int matchId)
        {
            try
            {
                _logger.LogInformation("Getting sport markets by match ID {MatchId}", matchId);
                return await _sportMarketRepository.GetByMatchIdAsync(matchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport markets by match ID {MatchId}", matchId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetSportMarketsBySportIdAsync(int sportId)
        {
            try
            {
                _logger.LogInformation("Getting sport markets by sport ID {SportId}", sportId);
                return await _sportMarketRepository.GetBySportIdAsync(sportId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport markets by sport ID {SportId}", sportId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetSportMarketsByActiveStatusAsync(bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport markets by active status {IsActive}", isActive);
                return await _sportMarketRepository.GetByActiveStatusAsync(isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport markets by active status {IsActive}", isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetSportMarketsByMatchIdAndActiveStatusAsync(int matchId, bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport markets by match ID {MatchId} and active status {IsActive}", matchId, isActive);
                return await _sportMarketRepository.GetByMatchIdAndActiveStatusAsync(matchId, isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport markets by match ID {MatchId} and active status {IsActive}", matchId, isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<SportMarket>> GetSportMarketsBySportIdAndActiveStatusAsync(int sportId, bool isActive)
        {
            try
            {
                _logger.LogInformation("Getting sport markets by sport ID {SportId} and active status {IsActive}", sportId, isActive);
                return await _sportMarketRepository.GetBySportIdAndActiveStatusAsync(sportId, isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sport markets by sport ID {SportId} and active status {IsActive}", sportId, isActive);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMarket> AddSportMarketAsync(SportMarket sportMarket)
        {
            if (sportMarket == null)
            {
                throw new ArgumentNullException(nameof(sportMarket));
            }

            try
            {
                _logger.LogInformation("Adding new sport market for market type ID {MarketTypeId}", sportMarket.MarketTypeID);
                return await _sportMarketRepository.AddAsync(sportMarket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sport market for market type ID {MarketTypeId}", sportMarket.MarketTypeID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SportMarket> UpdateSportMarketAsync(SportMarket sportMarket)
        {
            if (sportMarket == null)
            {
                throw new ArgumentNullException(nameof(sportMarket));
            }

            try
            {
                _logger.LogInformation("Updating sport market with ID {Id}", sportMarket.ID);

                // Check if the sport market exists
                var existingSportMarket = await _sportMarketRepository.GetByIdAsync((int)sportMarket.ID);
                if (existingSportMarket == null)
                {
                    throw new InvalidOperationException($"Sport market with ID {sportMarket.ID} not found");
                }

                return await _sportMarketRepository.UpdateAsync(sportMarket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sport market with ID {Id}", sportMarket.ID);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSportMarketAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting sport market with ID {Id}", id);

                // Check if the sport market exists
                var existingSportMarket = await _sportMarketRepository.GetByIdAsync((int)id);
                if (existingSportMarket == null)
                {
                    _logger.LogWarning("Sport market with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _sportMarketRepository.UpdateAsync(existingSportMarket);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sport market with ID {Id}", id);
                throw;
            }
        }
    }
}
