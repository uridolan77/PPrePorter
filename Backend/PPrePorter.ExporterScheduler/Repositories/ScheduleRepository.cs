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
    /// Repository for schedule configurations using Entity Framework Core
    /// </summary>
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly ExporterSchedulerDbContext _dbContext;
        private readonly ILogger<ScheduleRepository> _logger;
        
        public ScheduleRepository(
            ExporterSchedulerDbContext dbContext,
            ILogger<ScheduleRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }
        
        public async Task<ScheduleConfiguration> GetByIdAsync(Guid id)
        {
            _logger.LogDebug("Getting schedule by ID {ScheduleId}", id);
            
            return await _dbContext.Schedules
                .Include(s => s.Notifications)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
        
        public async Task<IEnumerable<ScheduleConfiguration>> GetAllAsync()
        {
            _logger.LogDebug("Getting all schedules");
            
            return await _dbContext.Schedules
                .Include(s => s.Notifications)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ScheduleConfiguration>> GetDueSchedulesAsync(DateTime dueDate)
        {
            _logger.LogDebug("Getting schedules due by {DueDate}", dueDate);
            
            // This is a simplistic implementation - in a real application, 
            // the logic for determining due schedules would be more complex,
            // possibly using a stored procedure or advanced query
            
            // For now, we'll just return all active schedules
            return await _dbContext.Schedules
                .Include(s => s.Notifications)
                .Where(s => s.IsActive)
                .ToListAsync();
        }
        
        public async Task AddAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Adding new schedule with ID {ScheduleId}", schedule.Id);
            
            await _dbContext.Schedules.AddAsync(schedule);
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Added schedule with ID {ScheduleId}", schedule.Id);
        }
        
        public async Task UpdateAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Updating schedule with ID {ScheduleId}", schedule.Id);
            
            // First, remove existing notifications to avoid conflicts
            var existingNotifications = await _dbContext.NotificationConfigurations
                .Where(n => n.Id == schedule.Id)
                .ToListAsync();
            
            if (existingNotifications.Any())
            {
                _dbContext.NotificationConfigurations.RemoveRange(existingNotifications);
            }
            
            // Update the schedule
            _dbContext.Schedules.Update(schedule);
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Updated schedule with ID {ScheduleId}", schedule.Id);
        }
        
        public async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation("Deleting schedule with ID {ScheduleId}", id);
            
            var schedule = await _dbContext.Schedules.FindAsync(id);
            
            if (schedule != null)
            {
                _dbContext.Schedules.Remove(schedule);
                await _dbContext.SaveChangesAsync();
                
                _logger.LogInformation("Deleted schedule with ID {ScheduleId}", id);
            }
            else
            {
                _logger.LogWarning("Schedule with ID {ScheduleId} not found for deletion", id);
            }
        }
    }
}