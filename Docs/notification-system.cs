// Notification System Implementation

// --------------------------
// 1. Backend Notification Services
// --------------------------

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using ProgressPlay.Reporting.Core.Models;
using System.IO;
using Microsoft.AspNetCore.SignalR;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using System.Linq;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface INotificationService
    {
        Task SendEmailNotificationAsync(string recipientEmail, string subject, string htmlContent, List<Attachment> attachments = null);
        Task SendSmsNotificationAsync(string phoneNumber, string message);
        Task SendInAppNotificationAsync(string userId, Notification notification);
        Task SendReportNotificationAsync(string userId, string reportId, string notificationType, string notificationDestination, ExportResult exportResult = null);
        Task<List<Notification>> GetUserNotificationsAsync(string userId, bool includeRead = false);
        Task MarkNotificationAsReadAsync(string userId, string notificationId);
        Task DeleteNotificationAsync(string userId, string notificationId);
    }

    public class NotificationService : INotificationService
    {
        private readonly IOptions<EmailSettings> _emailSettings;
        private readonly IOptions<SmsSettings> _smsSettings;
        private readonly IHubContext<NotificationHub, INotificationClient> _notificationHub;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserService _userService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IOptions<EmailSettings> emailSettings,
            IOptions<SmsSettings> smsSettings,
            IHubContext<NotificationHub, INotificationClient> notificationHub,
            INotificationRepository notificationRepository,
            IUserService userService,
            ILogger<NotificationService> logger)
        {
            _emailSettings = emailSettings;
            _smsSettings = smsSettings;
            _notificationHub = notificationHub;
            _notificationRepository = notificationRepository;
            _userService = userService;
            _logger = logger;
        }

        public async Task SendEmailNotificationAsync(string recipientEmail, string subject, string htmlContent, List<Attachment> attachments = null)
        {
            try
            {
                var client = new SendGridClient(_emailSettings.Value.ApiKey);
                var from = new EmailAddress(_emailSettings.Value.SenderEmail, _emailSettings.Value.SenderName);
                var to = new EmailAddress(recipientEmail);
                
                var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
                
                // Add attachments if any
                if (attachments != null && attachments.Count > 0)
                {
                    foreach (var attachment in attachments)
                    {
                        msg.AddAttachment(attachment.Filename, Convert.ToBase64String(attachment.Content), attachment.Type);
                    }
                }
                
                var response = await client.SendEmailAsync(msg);
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to send email: {await response.Body.ReadAsStringAsync()}");
                }
                
                _logger.LogInformation("Email notification sent to {RecipientEmail}", recipientEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification to {RecipientEmail}", recipientEmail);
                throw;
            }
        }

        public async Task SendSmsNotificationAsync(string phoneNumber, string message)
        {
            try
            {
                // Initialize Twilio client
                TwilioClient.Init(_smsSettings.Value.AccountSid, _smsSettings.Value.AuthToken);
                
                // Send SMS
                var smsMessage = await MessageResource.CreateAsync(
                    body: message,
                    from: new Twilio.Types.PhoneNumber(_smsSettings.Value.FromNumber),
                    to: new Twilio.Types.PhoneNumber(phoneNumber)
                );
                
                _logger.LogInformation("SMS notification sent to {PhoneNumber}, SID: {MessageSid}", phoneNumber, smsMessage.Sid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending SMS notification to {PhoneNumber}", phoneNumber);
                throw;
            }
        }

        public async Task SendInAppNotificationAsync(string userId, Notification notification)
        {
            try
            {
                // Save notification to database
                notification.RecipientId = userId;
                notification.CreatedAt = DateTime.UtcNow;
                notification.IsRead = false;
                notification.Id = Guid.NewGuid().ToString();
                
                await _notificationRepository.AddNotificationAsync(notification);
                
                // Send real-time notification via SignalR
                await _notificationHub.Clients.User(userId).ReceiveNotification(notification);
                
                _logger.LogInformation("In-app notification sent to user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending in-app notification to user {UserId}", userId);
                throw;
            }
        }

        public async Task SendReportNotificationAsync(string userId, string reportId, string notificationType, string notificationDestination, ExportResult exportResult = null)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    throw new ArgumentException($"User with ID {userId} not found");
                }
                
                switch (notificationType?.ToLower())
                {
                    case "email":
                        if (string.IsNullOrEmpty(user.Email))
                        {
                            throw new ArgumentException("User does not have an email address");
                        }
                        
                        var attachments = new List<Attachment>();
                        if (exportResult != null)
                        {
                            attachments.Add(new Attachment
                            {
                                Content = exportResult.Data,
                                Filename = exportResult.FileName,
                                Type = exportResult.ContentType
                            });
                        }
                        
                        await SendEmailNotificationAsync(
                            notificationDestination ?? user.Email,
                            "Your ProgressPlay Report is Ready",
                            $"<h1>Your report is ready</h1><p>Your report with ID {reportId} is now ready. You can view it in the ProgressPlay Analytics platform or find it attached to this email.</p>",
                            attachments
                        );
                        break;
                        
                    case "sms":
                        // Get phone number from user or use provided destination
                        var phoneNumber = notificationDestination;
                        
                        if (string.IsNullOrEmpty(phoneNumber))
                        {
                            throw new ArgumentException("No phone number provided for SMS notification");
                        }
                        
                        await SendSmsNotificationAsync(
                            phoneNumber,
                            $"Your ProgressPlay report is ready. Report ID: {reportId}"
                        );
                        break;
                        
                    case "inapp":
                    default:
                        // Create in-app notification
                        var notification = new Notification
                        {
                            Title = "Report Ready",
                            Message = $"Your report with ID {reportId} is now ready.",
                            Type = "report_ready",
                            Link = $"/reports/view/{reportId}",
                            Metadata = new Dictionary<string, string>
                            {
                                { "reportId", reportId }
                            }
                        };
                        
                        await SendInAppNotificationAsync(userId, notification);
                        break;
                }
                
                _logger.LogInformation("Report notification sent to user {UserId} via {NotificationType}", userId, notificationType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending report notification to user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(string userId, bool includeRead = false)
        {
            try
            {
                return await _notificationRepository.GetNotificationsForUserAsync(userId, includeRead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task MarkNotificationAsReadAsync(string userId, string notificationId)
        {
            try
            {
                await _notificationRepository.MarkNotificationAsReadAsync(userId, notificationId);
                _logger.LogInformation("Notification {NotificationId} marked as read for user {UserId}", notificationId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read for user {UserId}", notificationId, userId);
                throw;
            }
        }

        public async Task DeleteNotificationAsync(string userId, string notificationId)
        {
            try
            {
                await _notificationRepository.DeleteNotificationAsync(userId, notificationId);
                _logger.LogInformation("Notification {NotificationId} deleted for user {UserId}", notificationId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId} for user {UserId}", notificationId, userId);
                throw;
            }
        }
    }

    // Settings classes
    public class EmailSettings
    {
        public string ApiKey { get; set; }
        public string SenderEmail { get; set; }
        public string SenderName { get; set; }
    }

    public class SmsSettings
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string FromNumber { get; set; }
    }
}

// --------------------------
// 2. Notification SignalR Hub
// --------------------------

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ProgressPlay.Reporting.Core.Models;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface INotificationClient
    {
        Task ReceiveNotification(Notification notification);
    }

    [Authorize]
    public class NotificationHub : Hub<INotificationClient>
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}

// --------------------------
// 3. Notification Repository
// --------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Data;
using ProgressPlay.Reporting.Core.Models;

namespace ProgressPlay.Reporting.Core.Services
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetNotificationsForUserAsync(string userId, bool includeRead = false);
        Task<Notification> GetNotificationByIdAsync(string notificationId);
        Task AddNotificationAsync(Notification notification);
        Task MarkNotificationAsReadAsync(string userId, string notificationId);
        Task DeleteNotificationAsync(string userId, string notificationId);
    }

    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<NotificationRepository> _logger;

        public NotificationRepository(
            ApplicationDbContext dbContext,
            ILogger<NotificationRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<Notification>> GetNotificationsForUserAsync(string userId, bool includeRead = false)
        {
            try
            {
                var query = _dbContext.Notifications
                    .Where(n => n.RecipientId == userId);
                
                if (!includeRead)
                {
                    query = query.Where(n => !n.IsRead);
                }
                
                return await query
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Notification> GetNotificationByIdAsync(string notificationId)
        {
            try
            {
                return await _dbContext.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification {NotificationId}", notificationId);
                throw;
            }
        }

        public async Task AddNotificationAsync(Notification notification)
        {
            try
            {
                _dbContext.Notifications.Add(notification);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding notification for user {UserId}", notification.RecipientId);
                throw;
            }
        }

        public async Task MarkNotificationAsReadAsync(string userId, string notificationId)
        {
            try
            {
                var notification = await _dbContext.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientId == userId);
                
                if (notification != null)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    
                    await _dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read for user {UserId}", notificationId, userId);
                throw;
            }
        }

        public async Task DeleteNotificationAsync(string userId, string notificationId)
        {
            try
            {
                var notification = await _dbContext.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientId == userId);
                
                if (notification != null)
                {
                    _dbContext.Notifications.Remove(notification);
                    await _dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId} for user {UserId}", notificationId, userId);
                throw;
            }
        }
    }
}

// --------------------------
// 4. Notification Models
// --------------------------

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ProgressPlay.Reporting.Core.Models
{
    public class Notification
    {
        public string Id { get; set; }
        public string RecipientId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public string Link { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        
        private string _metadataJson;
        
        [JsonIgnore]
        public string MetadataJson
        {
            get => _metadataJson;
            set
            {
                _metadataJson = value;
                if (!string.IsNullOrEmpty(value))
                {
                    try
                    {
                        Metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(value);
                    }
                    catch
                    {
                        Metadata = new Dictionary<string, string>();
                    }
                }
            }
        }
        
        [NotMapped]
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }

    public class Attachment
    {
        public byte[] Content { get; set; }
        public string Filename { get; set; }
        public string Type { get; set; }
    }
}

// --------------------------
// 5. Notification Controller
// --------------------------

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProgressPlay.Reporting.Core.Models;
using ProgressPlay.Reporting.Core.Services;

namespace ProgressPlay.Reporting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IUserContextService _userContextService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            IUserContextService userContextService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _userContextService = userContextService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] bool includeRead = false)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                var notifications = await _notificationService.GetUserNotificationsAsync(currentUser.Id, includeRead);
                
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications");
                return StatusCode(500, "An error occurred while retrieving notifications");
            }
        }

        [HttpPost("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(string notificationId)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                await _notificationService.MarkNotificationAsReadAsync(currentUser.Id, notificationId);
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                return StatusCode(500, "An error occurred while marking notification as read");
            }
        }

        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(string notificationId)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                await _notificationService.DeleteNotificationAsync(currentUser.Id, notificationId);
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", notificationId);
                return StatusCode(500, "An error occurred while deleting notification");
            }
        }

        [HttpPost("test")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendTestNotification([FromBody] TestNotificationRequest request)
        {
            try
            {
                var currentUser = _userContextService.GetCurrentUser();
                
                switch (request.Type.ToLower())
                {
                    case "email":
                        await _notificationService.SendEmailNotificationAsync(
                            request.Destination ?? currentUser.Email,
                            "Test Notification",
                            "<h1>Test Notification</h1><p>This is a test notification from ProgressPlay Analytics.</p>"
                        );
                        break;
                        
                    case "sms":
                        await _notificationService.SendSmsNotificationAsync(
                            request.Destination,
                            "This is a test notification from ProgressPlay Analytics."
                        );
                        break;
                        
                    case "inapp":
                        var notification = new Notification
                        {
                            Title = "Test Notification",
                            Message = "This is a test notification from ProgressPlay Analytics.",
                            Type = "test",
                            Link = "/dashboard"
                        };
                        
                        await _notificationService.SendInAppNotificationAsync(currentUser.Id, notification);
                        break;
                        
                    default:
                        return BadRequest($"Unsupported notification type: {request.Type}");
                }
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test notification");
                return StatusCode(500, "An error occurred while sending test notification");
            }
        }
    }

    public class TestNotificationRequest
    {
        public string Type { get; set; } // "email", "sms", "inapp"
        public string Destination { get; set; } // email or phone number
    }
}

// --------------------------
// 6. Frontend Notification Components
// --------------------------

// src/components/notification/NotificationCenter.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge,
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatTimeAgo } from '../../utils/formatters';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };
  
  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to link if present
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    handleClose();
  };
  
  const handleMarkAllAsRead = async () => {
    // Mark all notifications as read
    for (const notification of notifications) {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
    }
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <IconButton color="inherit" onClick={handleClick} size="large">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          color="textSecondary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleDelete(notification.id, e)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;

// --------------------------
// 7. SignalR Connection
// --------------------------

// src/services/signalRService.js
import * as signalR from '@microsoft/signalr';
import { authHeader, getToken } from '../utils/authUtils';
import { API_BASE_URL } from '../config';

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = [];
  }

  init() {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => getToken()
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveNotification', (notification) => {
      this.callbacks.forEach(callback => callback(notification));
    });

    // Start the connection
    this.startConnection();
  }

  async startConnection() {
    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection error:', err);
      // Retry after 5 seconds
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  onNotification(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.callbacks = [];
    }
  }
}

// Singleton instance
const signalRService = new SignalRService();

export default signalRService;

// --------------------------
// 8. Notification Context
// --------------------------

// src/contexts/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import signalRService from '../services/signalRService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Initialize SignalR connection
      signalRService.init();
      
      // Subscribe to real-time notifications
      const unsubscribe = signalRService.onNotification((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        showBrowserNotification(notification);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);
  
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Update unread count
      const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const showBrowserNotification = (notification) => {
    // Check if browser notifications are supported and permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
    // If permission not granted, request it
    else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

// --------------------------
// 9. Notification Service
// --------------------------

// src/services/notificationService.js
import { API_BASE_URL } from '../config';
import { authHeader } from '../utils/authUtils';

const notificationService = {
  async getNotifications(includeRead = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?includeRead=${includeRead}`, {
        method: 'GET',
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching notifications: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },
  
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error marking notification as read: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },
  
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting notification: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },
  
  async sendTestNotification(type, destination) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          destination
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error sending test notification: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }
};

export default notificationService;
