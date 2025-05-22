using PPrePorter.DailyActionsDB.Models.Metadata;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Represents a registration play mode lookup value
    /// </summary>
    [NotMapped]
    public class RegistrationPlayMode : LookupMetadataItem
    {
        /// <summary>
        /// Gets the metadata type for this lookup
        /// </summary>
        public override string MetadataType => MetadataTypes.RegistrationPlayMode;
    }
}
