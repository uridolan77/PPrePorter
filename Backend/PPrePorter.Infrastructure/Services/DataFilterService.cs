using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;

namespace PPrePorter.Infrastructure.Services
{
    public class DataFilterService : IDataFilterService
    {
        private readonly IPPRePorterDbContext _dbContext;
        private readonly ILogger<DataFilterService> _logger;

        public DataFilterService(IPPRePorterDbContext dbContext, ILogger<DataFilterService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<int>> GetAccessibleWhiteLabelIdsAsync(string userId)
        {
            try
            {
                // Get the user's role from the database
                var user = await _dbContext.Users
                    .Include(u => u.UserRole)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning("User not found with ID: {UserId}", userId);
                    return new List<int>();
                }

                // Determine accessible white labels based on user role
                if (user.UserRole.Name == "Admin")
                {
                    // Admins can access all white labels
                    var allLabels = await _dbContext.WhiteLabels
                        .Select(wl => wl.LabelID)
                        .ToListAsync();
                        
                    _logger.LogInformation("Admin user {UserId} has access to all {Count} white labels", userId, allLabels.Count);
                    return allLabels;
                }
                else if (user.UserRole.Name == "Partner")
                {
                    // Partners can access specific white labels assigned to them
                    var partnerLabels = await _dbContext.UserWhiteLabels
                        .Where(uwl => uwl.UserId == userId)
                        .Select(uwl => uwl.WhiteLabelId)
                        .ToListAsync();
                        
                    _logger.LogInformation("Partner user {UserId} has access to {Count} white labels", userId, partnerLabels.Count);
                    return partnerLabels;
                }
                else if (user.UserRole.Name == "Subpartner")
                {
                    // Subpartners typically have access to a single white label
                    var subpartnerLabel = await _dbContext.UserWhiteLabels
                        .Where(uwl => uwl.UserId == userId)
                        .Select(uwl => uwl.WhiteLabelId)
                        .FirstOrDefaultAsync();
                        
                    _logger.LogInformation("Subpartner user {UserId} has access to white label {LabelId}", userId, subpartnerLabel);
                    return new List<int> { subpartnerLabel };
                }
                else
                {
                    // Default case - no access
                    _logger.LogWarning("User {UserId} with role {Role} does not have access to any white labels", userId, user.UserRole.Name);
                    return new List<int>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accessible white labels for user {UserId}", userId);
                throw;
            }
        }
    }
}