using PPrePorter.Domain.Common;
using System;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Transaction : BaseEntity
    {
        public int PlayerId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public decimal TransactionAmount { get; set; }
        public string CurrencyCode { get; set; }
        public string Status { get; set; }
        public string Platform { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionDetails { get; set; }
        public string TransactionSubDetails { get; set; }
        
        // This property is used for ID in the queries
        public int PlayerID { get => PlayerId; }
        public int TransactionID { get => Id; }
        
        public virtual Player Player { get; set; }
    }
}
