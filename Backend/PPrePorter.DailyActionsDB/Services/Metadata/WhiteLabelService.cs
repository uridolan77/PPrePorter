using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for white label operations using repository pattern
    /// </summary>
    public class WhiteLabelService : IWhiteLabelService
    {
        private readonly IWhiteLabelRepository _whiteLabelRepository;
        private readonly ILogger<WhiteLabelService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public WhiteLabelService(
            IWhiteLabelRepository whiteLabelRepository,
            ILogger<WhiteLabelService> logger)
        {
            _whiteLabelRepository = whiteLabelRepository ?? throw new ArgumentNullException(nameof(whiteLabelRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<WhiteLabel>> GetAllWhiteLabelsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all white labels (includeInactive: {IncludeInactive})", includeInactive);
                return await _whiteLabelRepository.GetAllAsync(includeInactive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all white labels");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<WhiteLabel?> GetWhiteLabelByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting white label by ID {Id}", id);
                return await _whiteLabelRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting white label by ID {Id}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<WhiteLabel> AddWhiteLabelAsync(WhiteLabel whiteLabel)
        {
            if (whiteLabel == null)
            {
                throw new ArgumentNullException(nameof(whiteLabel));
            }

            try
            {
                _logger.LogInformation("Adding new white label {Name}", whiteLabel.Name);

                // Check if a white label with the same name already exists
                var existingWhiteLabel = await _whiteLabelRepository.GetByNameAsync(whiteLabel.Name);
                if (existingWhiteLabel != null)
                {
                    throw new InvalidOperationException($"A white label with the name '{whiteLabel.Name}' already exists");
                }

                return await _whiteLabelRepository.AddAsync(whiteLabel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding white label {Name}", whiteLabel.Name);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<WhiteLabel> UpdateWhiteLabelAsync(WhiteLabel whiteLabel)
        {
            if (whiteLabel == null)
            {
                throw new ArgumentNullException(nameof(whiteLabel));
            }

            try
            {
                _logger.LogInformation("Updating white label with ID {Id}", whiteLabel.Id);

                // Check if the white label exists
                var existingWhiteLabel = await _whiteLabelRepository.GetByIdAsync(whiteLabel.Id);
                if (existingWhiteLabel == null)
                {
                    throw new InvalidOperationException($"White label with ID {whiteLabel.Id} not found");
                }

                // Check if the name is being changed and if the new name is already in use
                if (existingWhiteLabel.Name != whiteLabel.Name)
                {
                    var whiteLabelWithSameName = await _whiteLabelRepository.GetByNameAsync(whiteLabel.Name);
                    if (whiteLabelWithSameName != null && whiteLabelWithSameName.Id != whiteLabel.Id)
                    {
                        throw new InvalidOperationException($"A white label with the name '{whiteLabel.Name}' already exists");
                    }
                }

                return await _whiteLabelRepository.UpdateAsync(whiteLabel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating white label with ID {Id}", whiteLabel.Id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteWhiteLabelAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting white label with ID {Id}", id);

                // Check if the white label exists
                var existingWhiteLabel = await _whiteLabelRepository.GetByIdAsync(id);
                if (existingWhiteLabel == null)
                {
                    _logger.LogWarning("White label with ID {Id} not found", id);
                    return false;
                }

                // Instead of deleting, just update the entity
                await _whiteLabelRepository.UpdateAsync(existingWhiteLabel);
                return true;

                // If we want to actually delete the white label
                return await _whiteLabelRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting white label with ID {Id}", id);
                throw;
            }
        }
    }
}
