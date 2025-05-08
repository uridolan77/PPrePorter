using PPrePorter.Domain.Common;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Player : BaseEntity
    {
        public string Alias { get; set; }
        public int CasinoId { get; set; }
        public bool IsActive { get; set; }
        
        public virtual ICollection<Transaction> Transactions { get; set; }
    }
}
