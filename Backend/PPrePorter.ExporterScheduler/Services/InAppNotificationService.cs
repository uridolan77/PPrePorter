using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Service for sending in-app notifications about scheduled exports
    /// </summary>
    public class InAppNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<InAppNotificationService> _logger;
        
        public InAppNotificationService(
            IHubContext<NotificationHub> hubContext,
            IUserRepository userRepository,
            ILogger<InAppNotificationService> logger)
        {
            _hubContext = hubContext;
            _userRepository = userRepository;
            _logger = logger;
        }
        
        public async Task SendNotificationAsync(
            NotificationConfiguration notification, 
            ScheduleConfiguration schedule, 
            byte[] reportData)
        {
            var userId = notification.Recipient;
            
            _logger.LogInformation("Sending in-app notification to user {UserId} for schedule {ScheduleId}", 
                userId, schedule.Id);
            
            // Get the user's connection ID from the repository
            var connectionId = await _userRepository.GetUserConnectionIdAsync(userId);
            
            if (string.IsNullOrEmpty(connectionId))
            {
                _logger.LogWarning("User {UserId} is not currently connected, notification won't be delivered in real-time", userId);
                // Could store in a database for later delivery
                return;
            }
            
            var message = string.IsNullOrEmpty(notification.Message)
                ? GetDefaultMessage(schedule)
                : notification.Message;
            
            var notificationData = new
            {
                type = "ReportGenerated",
                scheduleId = schedule.Id.ToString(),
                reportName = schedule.ReportName,
                message = message,
                timestamp = DateTime.UtcNow,
                format = schedule.Format.ToString()
            };
            
            // Send to specific user via their connection ID
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notificationData);
            
            _logger.LogInformation("In-app notification sent successfully to user {UserId}", userId);
        }
        
        private string GetDefaultMessage(ScheduleConfiguration schedule)
        {
            return $"Your scheduled report '{schedule.ReportName}' has been generated successfully.";
        }
    }
    
    /// <summary>
    /// SignalR hub for handling real-time notifications to clients
    /// </summary>
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;
        
        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }
        
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.Identity?.Name;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation("User {UserId} connected with connection ID {ConnectionId}", 
                    userId, Context.ConnectionId);
                
                // Here you might store the user's connection ID in a repository
                // for later user by the NotificationService
            }
            
            await base.OnConnectedAsync();
        }
        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.Identity?.Name;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation("User {UserId} disconnected from connection ID {ConnectionId}", 
                    userId, Context.ConnectionId);
                
                // Here you might remove the user's connection ID from the repository
            }
            
            await base.OnDisconnectedAsync(exception);
        }
    }
}