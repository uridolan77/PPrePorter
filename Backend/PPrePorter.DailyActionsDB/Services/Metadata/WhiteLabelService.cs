using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Interfaces.Metadata;
using PPrePorter.DailyActionsDB.Models.Metadata;
using PPrePorter.DailyActionsDB.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Service for white label operations using repository pattern
    /// </summary>
    public class WhiteLabelService : IWhiteLabelService
    {
        private readonly IWhiteLabelRepository _whiteLabelRepository;
        private readonly IDailyActionsMetadataRepository _metadataRepository;
        private readonly ILogger<WhiteLabelService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public WhiteLabelService(
            IWhiteLabelRepository whiteLabelRepository,
            IDailyActionsMetadataRepository metadataRepository,
            ILogger<WhiteLabelService> logger)
        {
            _whiteLabelRepository = whiteLabelRepository ?? throw new ArgumentNullException(nameof(whiteLabelRepository));
            _metadataRepository = metadataRepository ?? throw new ArgumentNullException(nameof(metadataRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<WhiteLabel>> GetAllWhiteLabelsAsync(bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Getting all white labels from DailyActionsMetadata (includeInactive: {IncludeInactive})", includeInactive);

                // Get white labels from the DailyActionsMetadata table
                var metadataWhiteLabels = await _metadataRepository.GetWhiteLabelsAsync(includeInactive);

                // Convert to WhiteLabel entities
                var whiteLabels = metadataWhiteLabels.Select(m => new WhiteLabel
                {
                    Id = m.Id,
                    Name = m.Name,
                    Code = m.Code,
                    Url = m.AdditionalData ?? string.Empty,
                    UrlName = m.Description,
                    IsActive = m.IsActive
                }).ToList();

                _logger.LogInformation("Retrieved {Count} white labels from DailyActionsMetadata", whiteLabels.Count);

                return whiteLabels;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting white labels from DailyActionsMetadata");

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for white labels");
                try
                {
                    return await _whiteLabelRepository.GetAllAsync(includeInactive);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting white labels from fallback repository");
                    throw;
                }
            }
        }

        /// <inheritdoc/>
        public async Task<WhiteLabel?> GetWhiteLabelByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting white label by ID {Id} from DailyActionsMetadata", id);

                // Get all white labels from the DailyActionsMetadata table
                var metadataWhiteLabels = await _metadataRepository.GetWhiteLabelsAsync(true);

                // Find the white label with the specified ID
                var metadataWhiteLabel = metadataWhiteLabels.FirstOrDefault(m => m.Id == id);

                if (metadataWhiteLabel != null)
                {
                    // Convert to WhiteLabel entity
                    var whiteLabel = new WhiteLabel
                    {
                        Id = metadataWhiteLabel.Id,
                        Name = metadataWhiteLabel.Name,
                        Code = metadataWhiteLabel.Code,
                        Url = metadataWhiteLabel.AdditionalData ?? string.Empty,
                        UrlName = metadataWhiteLabel.Description,
                        IsActive = metadataWhiteLabel.IsActive
                    };

                    _logger.LogInformation("Retrieved white label with ID {Id} from DailyActionsMetadata", id);

                    return whiteLabel;
                }

                _logger.LogWarning("White label with ID {Id} not found in DailyActionsMetadata", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting white label by ID {Id} from DailyActionsMetadata", id);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for white label with ID {Id}", id);
                try
                {
                    return await _whiteLabelRepository.GetByIdAsync(id);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting white label by ID {Id} from fallback repository", id);
                    throw;
                }
            }
        }

        /// <summary>
        /// Gets a white label by its code
        /// </summary>
        /// <param name="code">The code of the white label to retrieve</param>
        /// <returns>The white label with the specified code, or null if not found</returns>
        public async Task<WhiteLabel?> GetWhiteLabelByCodeAsync(string code)
        {
            try
            {
                _logger.LogInformation("Getting white label by Code {Code} from DailyActionsMetadata", code);

                // Get all white labels from the DailyActionsMetadata table
                var metadataWhiteLabels = await _metadataRepository.GetWhiteLabelsAsync(true);

                // Find the white label with the specified Code
                var metadataWhiteLabel = metadataWhiteLabels.FirstOrDefault(m => m.Code == code);

                if (metadataWhiteLabel != null)
                {
                    // Convert to WhiteLabel entity
                    var whiteLabel = new WhiteLabel
                    {
                        Id = metadataWhiteLabel.Id,
                        Name = metadataWhiteLabel.Name,
                        Code = metadataWhiteLabel.Code,
                        Url = metadataWhiteLabel.AdditionalData ?? string.Empty,
                        UrlName = metadataWhiteLabel.Description,
                        IsActive = metadataWhiteLabel.IsActive
                    };

                    _logger.LogInformation("Retrieved white label with Code {Code} from DailyActionsMetadata", code);

                    return whiteLabel;
                }

                _logger.LogWarning("White label with Code {Code} not found in DailyActionsMetadata", code);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting white label by Code {Code} from DailyActionsMetadata", code);

                // Fallback to the original repository if there's an error
                _logger.LogInformation("Falling back to original repository for white label with Code {Code}", code);
                try
                {
                    // Try to find by Code in the repository
                    var allWhiteLabels = await _whiteLabelRepository.GetAllAsync(true);
                    return allWhiteLabels.FirstOrDefault(wl => wl.Code == code);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Error getting white label by Code {Code} from fallback repository", code);
                    throw;
                }
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

                // Instead of deleting, just update the entity to mark it as inactive
                existingWhiteLabel.IsActive = false;
                await _whiteLabelRepository.UpdateAsync(existingWhiteLabel);
                return true;

                // Uncomment if we want to actually delete the white label
                // return await _whiteLabelRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting white label with ID {Id}", id);
                throw;
            }
        }
    }
}
