using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for platforms
    /// </summary>
    [Table("tbl_Platforms", Schema = "common")]
    public class PlatformLookup : LookupBase
    {
    }
}
