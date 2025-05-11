using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for player statuses
    /// </summary>
    [Table("tbl_Statuses", Schema = "common")]
    public class StatusLookup : LookupBase
    {
    }
}
