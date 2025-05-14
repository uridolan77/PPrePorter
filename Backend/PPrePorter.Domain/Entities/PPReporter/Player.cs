using PPrePorter.Domain.Common;
using System;
using System.Collections.Generic;

namespace PPrePorter.Domain.Entities.PPReporter
{
    public class Player : BaseEntity
    {
        public string Alias { get; set; }
        public int CasinoId { get; set; }
        public bool IsActive { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? FirstDepositDate { get; set; }
        public DateTime? FirstGameDate { get; set; }

        // This property is used for ID in the queries
        public int PlayerID { get => Id; }

        // These properties are needed for backward compatibility
        public int CasinoID { get => CasinoId; set => CasinoId = value; }
        public DateTime? CreatedAt { get => RegistrationDate; set => RegistrationDate = value; }
        public DateTime? FirstDeposit { get => FirstDepositDate; set => FirstDepositDate = value; }
        public DateTime? FirstGame { get => FirstGameDate; set => FirstGameDate = value; }

        // Removed Transaction reference as part of code cleanup
        public virtual ICollection<DailyActionGame> DailyActionGames { get; set; }
    }
}
