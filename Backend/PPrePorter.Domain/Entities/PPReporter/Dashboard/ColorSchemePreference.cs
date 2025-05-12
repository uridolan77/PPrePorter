using System;

namespace PPrePorter.Domain.Entities.PPReporter.Dashboard
{
    /// <summary>
    /// Represents a user's color scheme preference
    /// </summary>
    public class ColorSchemePreference
    {
        /// <summary>
        /// User ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Base theme
        /// </summary>
        public string BaseTheme { get; set; }

        /// <summary>
        /// Color mode (Light/Dark)
        /// </summary>
        public string Mode { get; set; }

        /// <summary>
        /// Color mode (alias for Mode)
        /// </summary>
        public string ColorMode { get; set; }

        /// <summary>
        /// Primary color
        /// </summary>
        public string PrimaryColor { get; set; }

        /// <summary>
        /// Secondary color
        /// </summary>
        public string SecondaryColor { get; set; }

        /// <summary>
        /// Accent color
        /// </summary>
        public string AccentColor { get; set; }

        /// <summary>
        /// Positive color
        /// </summary>
        public string PositiveColor { get; set; }

        /// <summary>
        /// Negative color
        /// </summary>
        public string NegativeColor { get; set; }

        /// <summary>
        /// Neutral color
        /// </summary>
        public string NeutralColor { get; set; }

        /// <summary>
        /// Contrast level
        /// </summary>
        public int? ContrastLevel { get; set; }
    }
}
