using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using PPrePorter.ExporterScheduler.Interfaces;

namespace PPrePorter.ExporterScheduler.Services
{
    /// <summary>
    /// SMS provider implementation using Twilio
    /// </summary>
    public class TwilioSmsProvider : ISmsProvider
    {
        private readonly SmsSettings _smsSettings;
        private readonly ILogger<TwilioSmsProvider> _logger;
        
        public TwilioSmsProvider(
            IOptions<SmsSettings> smsSettings,
            ILogger<TwilioSmsProvider> logger)
        {
            _smsSettings = smsSettings.Value;
            _logger = logger;
            
            // Initialize Twilio client with credentials
            TwilioClient.Init(_smsSettings.AccountSid, _smsSettings.AuthToken);
        }
        
        public async Task SendSmsAsync(string phoneNumber, string message)
        {
            _logger.LogInformation("Sending SMS to {PhoneNumber}", phoneNumber);
            
            try
            {
                // Ensure phone number is in E.164 format
                var toPhoneNumber = NormalizePhoneNumber(phoneNumber);
                
                var messageResource = await MessageResource.CreateAsync(
                    to: new PhoneNumber(toPhoneNumber),
                    from: new PhoneNumber(_smsSettings.FromNumber),
                    body: message
                );
                
                _logger.LogInformation("SMS sent successfully to {PhoneNumber}, SID: {SID}", 
                    phoneNumber, messageResource.Sid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS to {PhoneNumber}", phoneNumber);
                throw new Exception($"Failed to send SMS: {ex.Message}", ex);
            }
        }
        
        private string NormalizePhoneNumber(string phoneNumber)
        {
            // Simple normalization - more robust handling would be needed in production
            string normalizedNumber = phoneNumber.Trim()
                .Replace(" ", "")
                .Replace("-", "")
                .Replace("(", "")
                .Replace(")", "");
            
            // Ensure E.164 format (e.g., +1xxxxxxxxxx)
            if (!normalizedNumber.StartsWith("+"))
            {
                if (normalizedNumber.StartsWith("1"))
                {
                    normalizedNumber = "+" + normalizedNumber;
                }
                else
                {
                    // Default to US country code if none provided
                    // This would need to be adjusted based on your user base
                    normalizedNumber = "+1" + normalizedNumber;
                }
            }
            
            return normalizedNumber;
        }
    }
    
    /// <summary>
    /// Settings for SMS provider configuration
    /// </summary>
    public class SmsSettings
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string FromNumber { get; set; }
    }
}