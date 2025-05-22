using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Lookup table for registration play modes
    /// </summary>
    [Table("tbl_RegistrationPlayModes", Schema = "common")]
    public class RegistrationPlayModeLookup : LookupBase
    {
    }
}
