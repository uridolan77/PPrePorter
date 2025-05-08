using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class DashboardRequest
    {
        public string UserId { get; set; }
        public int? WhiteLabelId { get; set; }
        public string PlayMode { get; set; } // "Casino", "Sport", "Live", "Bingo", or null for all
    }
}