using PPrePorter.Domain.Common;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Player : BaseEntity
    {
        public string Alias { get; set; }
        public int CasinoId { get; set; }
        public bool IsActive { get; set; }
        
        // This property is used for ID in the queries
        public int PlayerID { get => Id; }
        
        // This property is needed for backward compatibility
        public int CasinoID { get => CasinoId; }
        
        public virtual ICollection<Transaction> Transactions { get; set; }
        public virtual ICollection<DailyActionGame> DailyActionGames { get; set; }
    }
}
