using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for trackers (affiliate IDs)
    /// </summary>
    [Table("tbl_Trackers", Schema = "common")]
    public class TrackerLookup : LookupBase
    {
    }
}
