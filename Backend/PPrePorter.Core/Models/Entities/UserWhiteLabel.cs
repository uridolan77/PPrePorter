

namespace PPrePorter.Core.Models.Entities
{
    /// <summary>
    /// Represents a relationship between a user and a white label
    /// </summary>
    public class UserWhiteLabel : BaseEntity
    {
        /// <summary>
        /// User ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// White label ID
        /// </summary>
        public int WhiteLabelId { get; set; }

        /// <summary>
        /// User
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// White label
        /// </summary>
        public virtual WhiteLabel WhiteLabel { get; set; }
    }
}
