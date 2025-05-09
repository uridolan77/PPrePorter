using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Mock implementation of IWhiteLabelService that returns empty results
    /// </summary>
    public class MockWhiteLabelService : IWhiteLabelService
    {
        private readonly ILogger<MockWhiteLabelService> _logger;

        public MockWhiteLabelService(ILogger<MockWhiteLabelService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public Task<WhiteLabel> AddWhiteLabelAsync(WhiteLabel whiteLabel)
        {
            _logger.LogWarning("Mock WhiteLabelService: AddWhiteLabelAsync called but not implemented");
            return Task.FromResult(whiteLabel);
        }

        public Task<bool> DeleteWhiteLabelAsync(int id)
        {
            _logger.LogWarning("Mock WhiteLabelService: DeleteWhiteLabelAsync called but not implemented");
            return Task.FromResult(false);
        }

        public Task<IEnumerable<WhiteLabel>> GetAllWhiteLabelsAsync(bool includeInactive = false)
        {
            _logger.LogWarning("Mock WhiteLabelService: GetAllWhiteLabelsAsync called but not implemented");
            return Task.FromResult<IEnumerable<WhiteLabel>>(new List<WhiteLabel>());
        }

        public Task<WhiteLabel?> GetWhiteLabelByIdAsync(int id)
        {
            _logger.LogWarning("Mock WhiteLabelService: GetWhiteLabelByIdAsync called but not implemented");
            return Task.FromResult<WhiteLabel?>(null);
        }

        public Task<WhiteLabel> UpdateWhiteLabelAsync(WhiteLabel whiteLabel)
        {
            _logger.LogWarning("Mock WhiteLabelService: UpdateWhiteLabelAsync called but not implemented");
            return Task.FromResult(whiteLabel);
        }
    }
}
