using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class DashboardData
    {
        public DashboardSummary Summary { get; set; }
        public List<CasinoRevenueItem> CasinoRevenue { get; set; }
        public List<PlayerRegistrationItem> PlayerRegistrations { get; set; }
        public List<TopGameItem> TopGames { get; set; }
        public List<RecentTransactionItem> RecentTransactions { get; set; }
    }
}