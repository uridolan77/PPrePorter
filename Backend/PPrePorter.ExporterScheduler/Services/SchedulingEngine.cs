using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Scheduling engine using Quartz.NET to manage schedules
    /// </summary>
    public class SchedulingEngine
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SchedulingEngine> _logger;
        private IScheduler _scheduler;
        
        /// <summary>
        /// Initializes a new instance of the SchedulingEngine class
        /// </summary>
        /// <param name="scheduleRepository">Repository for accessing schedule information</param>
        /// <param name="serviceProvider">Service provider for resolving dependencies</param>
        /// <param name="logger">Logger for the scheduling engine</param>
        public SchedulingEngine(
            IScheduleRepository scheduleRepository,
            IServiceProvider serviceProvider,
            ILogger<SchedulingEngine> logger)
        {
            _scheduleRepository = scheduleRepository;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }
        
        /// <summary>
        /// Initializes the scheduler and loads all active schedules
        /// </summary>
        public async Task InitializeAsync()
        {
            _logger.LogInformation("Initializing scheduling engine");
            
            // Create the scheduler factory
            var factory = new StdSchedulerFactory();
            
            // Get a scheduler
            _scheduler = await factory.GetScheduler();
            
            // Create and register job factory to use dependency injection
            _scheduler.JobFactory = new DependencyInjectionJobFactory(_serviceProvider);
            
            // Start the scheduler
            await _scheduler.Start();
            
            // Load all active schedules
            await LoadSchedulesAsync();
            
            _logger.LogInformation("Scheduling engine initialized successfully");
        }
        
        /// <summary>
        /// Loads all active schedules from the repository and registers them with the scheduler
        /// </summary>
        public async Task LoadSchedulesAsync()
        {
            _logger.LogInformation("Loading schedules from repository");
            
            var schedules = await _scheduleRepository.GetAllAsync();
            
            foreach (var schedule in schedules)
            {
                if (schedule.IsActive)
                {
                    await ScheduleJobAsync(schedule);
                }
            }
            
            _logger.LogInformation("Schedules loaded successfully");
        }
        
        /// <summary>
        /// Schedules a job for a specific schedule configuration
        /// </summary>
        public async Task ScheduleJobAsync(ScheduleConfiguration schedule)
        {
            _logger.LogInformation("Scheduling job for schedule {ScheduleId} ({ScheduleName})", 
                schedule.Id, schedule.Name);
            
            // Create job with schedule ID as data
            var jobData = new JobDataMap
            {
                { "scheduleId", schedule.Id.ToString() }
            };
            
            var job = JobBuilder.Create<ExportScheduleJob>()
                .WithIdentity($"job-{schedule.Id}", "export-jobs")
                .UsingJobData(jobData)
                .Build();
            
            // Create trigger based on schedule frequency
            ITrigger trigger = CreateTrigger(schedule);
            
            // Schedule the job
            await _scheduler.ScheduleJob(job, trigger);
            
            _logger.LogInformation("Job scheduled successfully for schedule {ScheduleId}", schedule.Id);
        }
        
        /// <summary>
        /// Unschedules a job for a specific schedule
        /// </summary>
        public async Task UnscheduleJobAsync(Guid scheduleId)
        {
            _logger.LogInformation("Unscheduling job for schedule {ScheduleId}", scheduleId);
            
            var jobKey = new JobKey($"job-{scheduleId}", "export-jobs");
            await _scheduler.DeleteJob(jobKey);
            
            _logger.LogInformation("Job unscheduled successfully for schedule {ScheduleId}", scheduleId);
        }
        
        /// <summary>
        /// Stops the scheduler
        /// </summary>
        public async Task StopAsync()
        {
            _logger.LogInformation("Stopping scheduling engine");
            
            if (_scheduler != null && !_scheduler.IsShutdown)
            {
                await _scheduler.Shutdown();
            }
            
            _logger.LogInformation("Scheduling engine stopped successfully");
        }
        
        /// <summary>
        /// Creates a trigger based on the schedule configuration
        /// </summary>
        private ITrigger CreateTrigger(ScheduleConfiguration schedule)
        {
            var triggerBuilder = TriggerBuilder.Create()
                .WithIdentity($"trigger-{schedule.Id}", "export-triggers");
            
            switch (schedule.Frequency)
            {                case ScheduleFrequency.Daily:                    triggerBuilder = triggerBuilder.WithDailyTimeIntervalSchedule(x => x
                        .OnEveryDay()
                        .StartingDailyAt(TimeOfDay.HourAndMinuteOfDay(
                            schedule.TimeOfDay.Hours, 
                            schedule.TimeOfDay.Minutes))
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById(schedule.TimeZone)));
                    break;
                      case ScheduleFrequency.Weekly:
                    triggerBuilder = triggerBuilder.WithSchedule(CronScheduleBuilder
                        .WeeklyOnDayAndHourAndMinute(
                            MapDayOfWeek(schedule.DayOfWeek.Value),
                            schedule.TimeOfDay.Hours,
                            schedule.TimeOfDay.Minutes)
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById(schedule.TimeZone)));
                    break;
                    
                case ScheduleFrequency.Monthly:
                    // Create cron expression for monthly schedule on specific day
                    var cronExpression = $"0 {schedule.TimeOfDay.Minutes} {schedule.TimeOfDay.Hours} {schedule.DayOfMonth} * ?";
                    triggerBuilder = triggerBuilder.WithCronSchedule(cronExpression, x => x
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById(schedule.TimeZone)));
                    break;
                    
                case ScheduleFrequency.Custom:
                    triggerBuilder = triggerBuilder.WithCronSchedule(schedule.CronExpression, x => x
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById(schedule.TimeZone)));
                    break;
                    
                default:
                    throw new ArgumentException($"Unsupported schedule frequency: {schedule.Frequency}");
            }
            
            return triggerBuilder.Build();
        }
        
        /// <summary>
        /// Maps .NET DayOfWeek to Quartz DayOfWeek
        /// </summary>
        private DayOfWeek MapDayOfWeek(System.DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                System.DayOfWeek.Sunday => DayOfWeek.Sunday,
                System.DayOfWeek.Monday => DayOfWeek.Monday,
                System.DayOfWeek.Tuesday => DayOfWeek.Tuesday,
                System.DayOfWeek.Wednesday => DayOfWeek.Wednesday,
                System.DayOfWeek.Thursday => DayOfWeek.Thursday,
                System.DayOfWeek.Friday => DayOfWeek.Friday,
                System.DayOfWeek.Saturday => DayOfWeek.Saturday,
                _ => throw new ArgumentException($"Invalid day of week: {dayOfWeek}")
            };
        }
    }
      /// <summary>
    /// Job factory that uses dependency injection to resolve job instances
    /// </summary>
    public class DependencyInjectionJobFactory : IJobFactory
    {
        private readonly IServiceProvider _serviceProvider;
        
        /// <summary>
        /// Initializes a new instance of the DependencyInjectionJobFactory class
        /// </summary>
        /// <param name="serviceProvider">The service provider used to resolve job instances</param>
        public DependencyInjectionJobFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        /// <summary>
        /// Creates a new job instance
        /// </summary>
        /// <param name="bundle">The trigger fired bundle containing job details</param>
        /// <param name="scheduler">The scheduler</param>
        /// <returns>A new job instance</returns>
        public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
        {
            return _serviceProvider.GetRequiredService(bundle.JobDetail.JobType) as IJob;
        }
        
        /// <summary>
        /// Returns a job instance to the scheduler
        /// </summary>
        /// <param name="job">The job instance to return</param>
        public void ReturnJob(IJob job)
        {
            (job as IDisposable)?.Dispose();
        }
    }
      /// <summary>
    /// Quartz job implementation that executes scheduled exports
    /// </summary>
    [DisallowConcurrentExecution]
    public class ExportScheduleJob : IJob
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IExportJob _exportJob;
        private readonly ILogger<ExportScheduleJob> _logger;
        
        /// <summary>
        /// Initializes a new instance of the ExportScheduleJob class
        /// </summary>
        /// <param name="scheduleRepository">Repository for accessing schedule information</param>
        /// <param name="exportJob">Service that performs the export operation</param>
        /// <param name="logger">Logger for the export schedule job</param>
        public ExportScheduleJob(
            IScheduleRepository scheduleRepository,
            IExportJob exportJob,
            ILogger<ExportScheduleJob> logger)
        {
            _scheduleRepository = scheduleRepository;
            _exportJob = exportJob;            _logger = logger;
        }
        
        /// <summary>
        /// Executes the scheduled job
        /// </summary>
        /// <param name="context">The execution context</param>
        /// <returns>A task representing the job execution</returns>
        public async Task Execute(IJobExecutionContext context)
        {
            // Get schedule ID from job data
            var scheduleIdStr = context.JobDetail.JobDataMap.GetString("scheduleId");
            
            if (!Guid.TryParse(scheduleIdStr, out var scheduleId))
            {
                _logger.LogError("Invalid schedule ID: {ScheduleId}", scheduleIdStr);
                return;
            }
            
            _logger.LogInformation("Executing scheduled job for schedule {ScheduleId}", scheduleId);
            
            try
            {
                // Get schedule configuration
                var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
                
                if (schedule == null)
                {
                    _logger.LogWarning("Schedule {ScheduleId} not found", scheduleId);
                    return;
                }
                
                if (!schedule.IsActive)
                {
                    _logger.LogWarning("Schedule {ScheduleId} is not active, skipping execution", scheduleId);
                    return;
                }
                
                // Execute the export job
                await _exportJob.ExecuteAsync(schedule);
                
                _logger.LogInformation("Scheduled job executed successfully for schedule {ScheduleId}", scheduleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing scheduled job for schedule {ScheduleId}", scheduleId);
                throw;
            }
        }
    }
}