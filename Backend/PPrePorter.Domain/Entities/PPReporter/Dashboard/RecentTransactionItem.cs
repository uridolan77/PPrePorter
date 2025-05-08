using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    public class RecentTransactionItem
    {
        public long TransactionID { get; set; }
        public long PlayerID { get; set; }
        public string PlayerAlias { get; set; }
        public string WhiteLabel { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; }
        public string Status { get; set; }
        public string Platform { get; set; }
        public string PaymentMethod { get; set; }
    }
}