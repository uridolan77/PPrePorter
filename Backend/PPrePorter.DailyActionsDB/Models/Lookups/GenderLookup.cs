using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for genders
    /// </summary>
    [Table("tbl_Genders", Schema = "common")]
    public class GenderLookup : LookupBase
    {
    }
}
