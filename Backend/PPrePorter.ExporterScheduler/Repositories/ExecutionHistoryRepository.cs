using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Data;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Repositories
{
    /// <summary>
    /// Repository for execution history using Entity Framework Core
    /// </summary>
    public class ExecutionHistoryRepository : IExecutionHistoryRepository
    {
        private readonly ExporterSchedulerDbContext _dbContext;
        private readonly ILogger<ExecutionHistoryRepository> _logger;
        
        public ExecutionHistoryRepository(
            ExporterSchedulerDbContext dbContext,
            ILogger<ExecutionHistoryRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }
        
        public async Task AddAsync(ExecutionHistory history)
        {
            _logger.LogInformation("Adding execution history for schedule {ScheduleId}", history.ScheduleId);
            
            await _dbContext.ExecutionHistories.AddAsync(history);
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Added execution history with ID {HistoryId}", history.Id);
        }
        
        public async Task UpdateAsync(ExecutionHistory history)
        {
            _logger.LogInformation("Updating execution history with ID {HistoryId}", history.Id);
            
            _dbContext.ExecutionHistories.Update(history);
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Updated execution history with ID {HistoryId}", history.Id);
        }
        
        public async Task<ExecutionHistory> GetByIdAsync(Guid id)
        {
            _logger.LogDebug("Getting execution history by ID {HistoryId}", id);
            
            return await _dbContext.ExecutionHistories
                .Include(h => h.Notifications)
                .FirstOrDefaultAsync(h => h.Id == id);
        }
        
        public async Task<IEnumerable<ExecutionHistory>> GetByScheduleIdAsync(Guid scheduleId)
        {
            _logger.LogDebug("Getting execution histories for schedule {ScheduleId}", scheduleId);
            
            return await _dbContext.ExecutionHistories
                .Include(h => h.Notifications)
                .Where(h => h.ScheduleId == scheduleId)
                .OrderByDescending(h => h.StartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ExecutionHistory>> GetRecentExecutionsAsync(int limit = 100)
        {
            _logger.LogDebug("Getting {Limit} most recent execution histories", limit);
            
            return await _dbContext.ExecutionHistories
                .Include(h => h.Notifications)
                .OrderByDescending(h => h.StartTime)
                .Take(limit)
                .ToListAsync();
        }
    }
}