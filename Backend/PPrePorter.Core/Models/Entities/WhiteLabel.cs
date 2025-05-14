using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a white label
    /// </summary>
    public class WhiteLabel : BaseEntity
    {
        /// <summary>
        /// Label name
        /// </summary>
        public string LabelName { get; set; }

        /// <summary>
        /// Label code
        /// </summary>
        public string LabelCode { get; set; }

        /// <summary>
        /// Whether the label is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Label ID (alias for Id)
        /// </summary>
        public int LabelID { get => Id; }

        /// <summary>
        /// Users associated with this white label
        /// </summary>
        public virtual ICollection<UserWhiteLabel> Users { get; set; }
    }
}
