using System;
using Microsoft.Extensions.DependencyInjection;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Factory for creating notification services based on notification channel
    /// </summary>
    public class NotificationServiceFactory
    {
        private readonly IServiceProvider _serviceProvider;
        
        public NotificationServiceFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        /// <summary>
        /// Gets the appropriate notification service for the specified channel
        /// </summary>
        public INotificationService GetNotificationService(NotificationChannel channel)
        {
            return channel switch
            {
                NotificationChannel.InApp => _serviceProvider.GetRequiredService<InAppNotificationService>(),
                NotificationChannel.Email => _serviceProvider.GetRequiredService<EmailNotificationService>(),
                NotificationChannel.SMS => _serviceProvider.GetRequiredService<SmsNotificationService>(),
                _ => throw new ArgumentException($"Unsupported notification channel: {channel}")
            };
        }
    }
}