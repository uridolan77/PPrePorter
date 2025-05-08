using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using PPrePorter.ExporterScheduler.Interfaces;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// Email sender implementation using SendGrid
    /// </summary>
    public class SendGridEmailSender : IEmailSender
    {
        private readonly SendGridClient _client;
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<SendGridEmailSender> _logger;
        
        public SendGridEmailSender(
            IOptions<EmailSettings> emailSettings,
            ILogger<SendGridEmailSender> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
            _client = new SendGridClient(_emailSettings.ApiKey);
        }
        
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            _logger.LogInformation("Sending email to {Email} with subject '{Subject}'", email, subject);
            
            var msg = new SendGridMessage
            {
                From = new EmailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                PlainTextContent = message,
                HtmlContent = FormatHtmlMessage(message)
            };
            
            msg.AddTo(new EmailAddress(email));
            
            // Disable tracking settings
            // Ref: https://sendgrid.com/docs/User_Guide/Settings/tracking.html
            msg.SetClickTracking(false, false);
            msg.SetOpenTracking(false);
            
            var response = await _client.SendEmailAsync(msg);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {Email}", email);
            }
            else
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send email. Status: {StatusCode}, Response: {Response}", 
                    response.StatusCode, responseBody);
                throw new Exception($"Failed to send email. Status: {response.StatusCode}");
            }
        }
        
        public async Task SendEmailWithAttachmentAsync(
            string email, 
            string subject, 
            string message, 
            byte[] attachmentData, 
            string attachmentFileName, 
            string attachmentContentType)
        {
            _logger.LogInformation("Sending email with attachment ({Size} bytes) to {Email}", 
                attachmentData.Length, email);
            
            var msg = new SendGridMessage
            {
                From = new EmailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                PlainTextContent = message,
                HtmlContent = FormatHtmlMessage(message)
            };
            
            msg.AddTo(new EmailAddress(email));
            
            // Add attachment
            var attachment = Convert.ToBase64String(attachmentData);
            msg.AddAttachment(attachmentFileName, attachment, attachmentContentType);
            
            // Disable tracking settings
            msg.SetClickTracking(false, false);
            msg.SetOpenTracking(false);
            
            var response = await _client.SendEmailAsync(msg);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email with attachment sent successfully to {Email}", email);
            }
            else
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send email with attachment. Status: {StatusCode}, Response: {Response}", 
                    response.StatusCode, responseBody);
                throw new Exception($"Failed to send email with attachment. Status: {response.StatusCode}");
            }
        }
        
        private string FormatHtmlMessage(string message)
        {
            // Simple conversion of plain text to HTML
            return message
                .Replace(Environment.NewLine, "<br/>")
                .Replace("\n", "<br/>");
        }
    }
    
    /// <summary>
    /// Settings for email sender configuration
    /// </summary>
    public class EmailSettings
    {
        public string ApiKey { get; set; }
        public string SenderEmail { get; set; }
        public string SenderName { get; set; }
    }
}