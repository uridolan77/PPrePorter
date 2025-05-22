using PPrePorter.DailyActionsDB.Models.Metadata;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPrePorter.DailyActionsDB.Models.Lookups
{
    /// <summary>
    /// Represents a language lookup value
    /// </summary>
    [NotMapped]
    public class Language : LookupMetadataItem
    {
        /// <summary>
        /// Gets the metadata type for this lookup
        /// </summary>
        public override string MetadataType => MetadataTypes.Language;
    }
}
