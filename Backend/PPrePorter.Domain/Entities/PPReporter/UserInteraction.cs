using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    /// <summary>
    /// Represents a user interaction with the system
    /// </summary>
    public class UserInteraction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ComponentId { get; set; }
        public string InteractionType { get; set; }
        public string MetricKey { get; set; }
        public DateTime Timestamp { get; set; }
        public string AdditionalData { get; set; }
    }
}
