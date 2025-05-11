using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Transactions;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for bonus operations using repository pattern
    /// </summary>
    public class BonusService : IBonusService
    {
        private readonly IBonusRepository _bonusRepository;
        private readonly ILogger<BonusService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public BonusService(
            IBonusRepository bonusRepository,
            ILogger<BonusService> logger)
        {
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Bonus>> GetAllBonusesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all bonuses");
                return await _bonusRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all bonuses");
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Bonus?> GetBonusByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting bonus by ID {Id}", id);
                return await _bonusRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus by ID {Id}", id);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Bonus?> GetBonusByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Bonus name cannot be null or empty", nameof(name));
            }
            
            try
            {
                _logger.LogInformation("Getting bonus by name {Name}", name);
                return await _bonusRepository.GetByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonus by name {Name}", name);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Bonus>> GetBonusesByInternalNameAsync(string internalName)
        {
            if (string.IsNullOrWhiteSpace(internalName))
            {
                throw new ArgumentException("Internal name cannot be null or empty", nameof(internalName));
            }
            
            try
            {
                _logger.LogInformation("Getting bonuses by internal name {InternalName}", internalName);
                return await _bonusRepository.GetByInternalNameAsync(internalName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonuses by internal name {InternalName}", internalName);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Bonus>> GetBonusesByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status cannot be null or empty", nameof(status));
            }
            
            try
            {
                _logger.LogInformation("Getting bonuses by status {Status}", status);
                return await _bonusRepository.GetByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonuses by status {Status}", status);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Bonus>> GetBonusesByCouponCodeAsync(string couponCode)
        {
            if (string.IsNullOrWhiteSpace(couponCode))
            {
                throw new ArgumentException("Coupon code cannot be null or empty", nameof(couponCode));
            }
            
            try
            {
                _logger.LogInformation("Getting bonuses by coupon code {CouponCode}", couponCode);
                return await _bonusRepository.GetByCouponCodeAsync(couponCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonuses by coupon code {CouponCode}", couponCode);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(string type)
        {
            if (string.IsNullOrWhiteSpace(type))
            {
                throw new ArgumentException("Type cannot be null or empty", nameof(type));
            }
            
            try
            {
                _logger.LogInformation("Getting bonuses by type {Type}", type);
                return await _bonusRepository.GetByTypeAsync(type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bonuses by type {Type}", type);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Bonus> AddBonusAsync(Bonus bonus)
        {
            if (bonus == null)
            {
                throw new ArgumentNullException(nameof(bonus));
            }
            
            try
            {
                _logger.LogInformation("Adding new bonus {Name}", bonus.BonusName);
                
                // Check if a bonus with the same name already exists
                if (!string.IsNullOrWhiteSpace(bonus.BonusName))
                {
                    var existingBonus = await _bonusRepository.GetByNameAsync(bonus.BonusName);
                    if (existingBonus != null)
                    {
                        throw new InvalidOperationException($"A bonus with the name '{bonus.BonusName}' already exists");
                    }
                }
                
                return await _bonusRepository.AddAsync(bonus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bonus {Name}", bonus.BonusName);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<Bonus> UpdateBonusAsync(Bonus bonus)
        {
            if (bonus == null)
            {
                throw new ArgumentNullException(nameof(bonus));
            }
            
            try
            {
                _logger.LogInformation("Updating bonus with ID {Id}", bonus.BonusID);
                
                // Check if the bonus exists
                var existingBonus = await _bonusRepository.GetByIdAsync(bonus.BonusID);
                if (existingBonus == null)
                {
                    throw new InvalidOperationException($"Bonus with ID {bonus.BonusID} not found");
                }
                
                // Check if the name is being changed and if the new name is already in use
                if (!string.IsNullOrWhiteSpace(bonus.BonusName) && 
                    !string.IsNullOrWhiteSpace(existingBonus.BonusName) && 
                    existingBonus.BonusName != bonus.BonusName)
                {
                    var bonusWithSameName = await _bonusRepository.GetByNameAsync(bonus.BonusName);
                    if (bonusWithSameName != null && bonusWithSameName.BonusID != bonus.BonusID)
                    {
                        throw new InvalidOperationException($"A bonus with the name '{bonus.BonusName}' already exists");
                    }
                }
                
                return await _bonusRepository.UpdateAsync(bonus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating bonus with ID {Id}", bonus.BonusID);
                throw;
            }
        }
        
        /// <inheritdoc/>
        public async Task<bool> DeleteBonusAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting bonus with ID {Id}", id);
                return await _bonusRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting bonus with ID {Id}", id);
                throw;
            }
        }
    }
}
