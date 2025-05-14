using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents all dashboard data
    /// </summary>
    public class DashboardData
    {
        /// <summary>
        /// Dashboard summary
        /// </summary>
        public DashboardSummary Summary { get; set; }

        /// <summary>
        /// Casino revenue data
        /// </summary>
        public List<CasinoRevenueItem> RevenueData { get; set; } = new List<CasinoRevenueItem>();

        /// <summary>
        /// Casino revenue data (alias for RevenueData)
        /// </summary>
        public List<CasinoRevenueItem> CasinoRevenue { get; set; } = new List<CasinoRevenueItem>();

        /// <summary>
        /// Player registration data
        /// </summary>
        public List<PlayerRegistrationItem> RegistrationData { get; set; } = new List<PlayerRegistrationItem>();

        /// <summary>
        /// Player registration data (alias for RegistrationData)
        /// </summary>
        public List<PlayerRegistrationItem> PlayerRegistrations { get; set; } = new List<PlayerRegistrationItem>();

        /// <summary>
        /// Player registration data (alias for RegistrationData)
        /// </summary>
        public List<PlayerRegistrationItem> RegistrationsData { get; set; } = new List<PlayerRegistrationItem>();

        /// <summary>
        /// Top games data
        /// </summary>
        public List<TopGameItem> TopGames { get; set; } = new List<TopGameItem>();

        /// <summary>
        /// Recent transactions data
        /// </summary>
        public List<RecentTransactionItem> RecentTransactions { get; set; } = new List<RecentTransactionItem>();

        /// <summary>
        /// Top countries data
        /// </summary>
        public List<TopCountryItem> TopCountries { get; set; } = new List<TopCountryItem>();

        /// <summary>
        /// Detected anomalies
        /// </summary>
        public List<DataAnomaly> Anomalies { get; set; } = new List<DataAnomaly>();

        /// <summary>
        /// Dashboard request that generated this data
        /// </summary>
        public DashboardRequest Request { get; set; }
    }
}
