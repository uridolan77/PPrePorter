using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.DailyActions
{
    public class Transaction : BaseEntity
    {
        public string TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string PlayerId { get; set; }
        public string WhitelabelId { get; set; }
        public string GameId { get; set; }
        public string GameName { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; }
        public string Currency { get; set; }
    }
}