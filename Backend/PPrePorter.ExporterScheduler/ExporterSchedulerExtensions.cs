using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Data;
using PPrePorter.ExporterScheduler.Exporters;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Repositories;
using PPrePorter.ExporterScheduler.Services;

namespace PPrePorter.ExporterScheduler
{
    /// <summary>
    /// Extensions for registering exporter scheduler services with dependency injection
    /// </summary>
    public static class ExporterSchedulerExtensions
    {
        /// <summary>
        /// Adds the exporter scheduler services to the service collection
        /// </summary>
        public static IServiceCollection AddExporterScheduler(
            this IServiceCollection services, 
            IConfiguration configuration,
            Action<ExporterSchedulerOptions> setupAction = null)
        {
            var options = new ExporterSchedulerOptions();
            setupAction?.Invoke(options);
            
            // Register DbContext
            services.AddDbContext<ExporterSchedulerDbContext>(builder =>
            {
                if (options.DbContextOptionsBuilder != null)
                {
                    options.DbContextOptionsBuilder(builder);
                }
                else
                {
                    // Default to SQL Server if no custom options provided
                    builder.UseSqlServer(
                        configuration.GetConnectionString("DefaultConnection"),
                        sqlOptions => sqlOptions.EnableRetryOnFailure());
                }
            });
            
            // Register repositories
            services.AddScoped<IScheduleRepository, ScheduleRepository>();
            services.AddScoped<IExecutionHistoryRepository, ExecutionHistoryRepository>();
            
            // Register exporters
            services.AddScoped<ExcelExporter>();
            services.AddScoped<CsvExporter>();
            services.AddScoped<JsonExporter>();
            services.AddScoped<PdfExporter>();
            services.AddScoped<ExporterFactory>();
            
            // Register external services
            services.AddScoped<IEmailSender, SendGridEmailSender>();
            services.AddScoped<ISmsProvider, TwilioSmsProvider>();
            
            // Register notification services
            services.AddScoped<EmailNotificationService>();
            services.AddScoped<SmsNotificationService>();
            services.AddScoped<InAppNotificationService>();
            services.AddScoped<NotificationServiceFactory>();
            
            // Register core services
            services.AddScoped<ExportService>();
            services.AddScoped<IScheduleService, ScheduleService>();
            services.AddScoped<IExportJob, ExportJob>();
            services.AddSingleton<SchedulingEngine>();
            
            // Register options
            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.Configure<SmsSettings>(configuration.GetSection("SmsSettings"));
            
            // Register SignalR
            services.AddSignalR();
            
            // Register hosted service
            if (options.EnableScheduler)
            {
                services.AddHostedService<SchedulerHostedService>();
            }
            
            return services;
        }
    }
    
    /// <summary>
    /// Options for configuring the exporter scheduler services
    /// </summary>
    public class ExporterSchedulerOptions
    {
        /// <summary>
        /// Custom options builder for the DbContext
        /// </summary>
        public Action<DbContextOptionsBuilder> DbContextOptionsBuilder { get; set; }
        
        /// <summary>
        /// Whether to enable the scheduler as a hosted service
        /// </summary>
        public bool EnableScheduler { get; set; } = true;
    }
    
    /// <summary>
    /// Hosted service that initializes and manages the scheduler
    /// </summary>
    public class SchedulerHostedService : Microsoft.Extensions.Hosting.BackgroundService
    {        private readonly SchedulingEngine _schedulingEngine;
        private readonly ILogger<SchedulerHostedService> _logger;
        
        /// <summary>
        /// Initializes a new instance of the SchedulerHostedService class
        /// </summary>
        /// <param name="schedulingEngine">The scheduling engine that handles the scheduling logic</param>
        /// <param name="logger">Logger for the scheduler hosted service</param>
        public SchedulerHostedService(
            SchedulingEngine schedulingEngine,
            ILogger<SchedulerHostedService> logger)
        {
            _schedulingEngine = schedulingEngine;
            _logger = logger;
        }
        
        /// <summary>
        /// Executes the background service logic
        /// </summary>
        /// <param name="stoppingToken">Cancellation token to signal when the service should stop</param>
        /// <returns>A task representing the background operation</returns>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting scheduler hosted service");
            
            try
            {
                await _schedulingEngine.InitializeAsync();
                
                // Wait for cancellation
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when stopping
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in scheduler hosted service");
            }
            finally
            {
                await _schedulingEngine.StopAsync();
            }
            
            _logger.LogInformation("Scheduler hosted service stopped");
        }
    }
}