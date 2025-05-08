using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class DashboardSummary
    {
        public DateTime Date { get; set; }
        public int Registrations { get; set; }
        public decimal RegistrationsChange { get; set; }
        public int FTD { get; set; }
        public decimal FTDChange { get; set; }
        public decimal Deposits { get; set; }
        public decimal DepositsChange { get; set; }
        public decimal Cashouts { get; set; }
        public decimal CashoutsChange { get; set; }
        public decimal Bets { get; set; }
        public decimal BetsChange { get; set; }
        public decimal Wins { get; set; }
        public decimal WinsChange { get; set; }
        public decimal Revenue { get; set; }
        public decimal RevenueChange { get; set; }
    }
}