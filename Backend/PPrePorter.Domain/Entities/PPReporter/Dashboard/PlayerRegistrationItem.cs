using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class PlayerRegistrationItem
    {
        public DateTime Date { get; set; }
        public int Registrations { get; set; }
        public int FirstTimeDepositors { get; set; }
    }
}