using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for languages
    /// </summary>
    [Table("tbl_Languages", Schema = "common")]
    public class LanguageLookup : LookupBase
    {
    }
}
