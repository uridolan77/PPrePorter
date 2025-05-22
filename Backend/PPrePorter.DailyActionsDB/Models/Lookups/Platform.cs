using PPrePorter.DailyActionsDB.Models.Metadata;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Represents a platform lookup value
    /// </summary>
    [NotMapped]
    public class Platform : LookupMetadataItem
    {
        /// <summary>
        /// Gets the metadata type for this lookup
        /// </summary>
        public override string MetadataType => MetadataTypes.Platform;
    }
}
