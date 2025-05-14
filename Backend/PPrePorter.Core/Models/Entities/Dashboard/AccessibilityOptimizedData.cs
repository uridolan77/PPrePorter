using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Models.Entities.Dashboard
{
    /// <summary>
    /// Represents a request for accessibility-optimized data
    /// </summary>
    public class AccessibilityDataRequest
    {
        /// <summary>
        /// Start date for the data
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date for the data
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Metrics to include
        /// </summary>
        public List<string> Metrics { get; set; } = new List<string>();

        /// <summary>
        /// Dimensions to include
        /// </summary>
        public List<string> Dimensions { get; set; } = new List<string>();

        /// <summary>
        /// Filters to apply
        /// </summary>
        public Dictionary<string, object> Filters { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Accessibility features to optimize for (e.g., "screen_reader", "high_contrast", "keyboard_navigation")
        /// </summary>
        public List<string> AccessibilityFeatures { get; set; } = new List<string>();

        /// <summary>
        /// User ID making the request
        /// </summary>
        public int UserId { get; set; }
    }

    /// <summary>
    /// Represents accessibility-optimized data
    /// </summary>
    public class AccessibilityOptimizedData
    {
        /// <summary>
        /// Tabular data representation
        /// </summary>
        public TabularData TabularData { get; set; } = new TabularData();

        /// <summary>
        /// Text summaries of the data
        /// </summary>
        public List<string> TextSummaries { get; set; } = new List<string>();

        /// <summary>
        /// Audio descriptions of the data
        /// </summary>
        public List<AudioDescription> AudioDescriptions { get; set; } = new List<AudioDescription>();

        /// <summary>
        /// Keyboard navigation structure
        /// </summary>
        public KeyboardNavigationStructure KeyboardNavigation { get; set; } = new KeyboardNavigationStructure();

        /// <summary>
        /// High-contrast visualization options
        /// </summary>
        public HighContrastOptions HighContrast { get; set; } = new HighContrastOptions();

        /// <summary>
        /// Screen reader optimized data
        /// </summary>
        public ScreenReaderData ScreenReader { get; set; } = new ScreenReaderData();
    }

    /// <summary>
    /// Represents tabular data
    /// </summary>
    public class TabularData
    {
        /// <summary>
        /// Column headers
        /// </summary>
        public List<string> Headers { get; set; } = new List<string>();

        /// <summary>
        /// Data rows
        /// </summary>
        public List<List<string>> Rows { get; set; } = new List<List<string>>();

        /// <summary>
        /// Column descriptions
        /// </summary>
        public Dictionary<string, string> ColumnDescriptions { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Summary statistics for each column
        /// </summary>
        public Dictionary<string, Dictionary<string, string>> ColumnStatistics { get; set; } = new Dictionary<string, Dictionary<string, string>>();
    }

    /// <summary>
    /// Represents an audio description
    /// </summary>
    public class AudioDescription
    {
        /// <summary>
        /// Description ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Description text
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Audio URL
        /// </summary>
        public string AudioUrl { get; set; }

        /// <summary>
        /// Duration in seconds
        /// </summary>
        public int DurationSeconds { get; set; }
    }

    /// <summary>
    /// Represents a keyboard navigation structure
    /// </summary>
    public class KeyboardNavigationStructure
    {
        /// <summary>
        /// Navigation elements
        /// </summary>
        public List<NavigationElement> Elements { get; set; } = new List<NavigationElement>();

        /// <summary>
        /// Keyboard shortcuts
        /// </summary>
        public Dictionary<string, string> Shortcuts { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Represents a navigation element
    /// </summary>
    public class NavigationElement
    {
        /// <summary>
        /// Element ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Element label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Tab index
        /// </summary>
        public int TabIndex { get; set; }

        /// <summary>
        /// Parent element ID
        /// </summary>
        public string ParentId { get; set; }

        /// <summary>
        /// Child element IDs
        /// </summary>
        public List<string> ChildIds { get; set; } = new List<string>();
    }

    /// <summary>
    /// Represents high-contrast options
    /// </summary>
    public class HighContrastOptions
    {
        /// <summary>
        /// Color palette
        /// </summary>
        public List<string> ColorPalette { get; set; } = new List<string>();

        /// <summary>
        /// Text size options
        /// </summary>
        public Dictionary<string, string> TextSizeOptions { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Pattern options for colorblind users
        /// </summary>
        public Dictionary<string, string> PatternOptions { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Represents screen reader optimized data
    /// </summary>
    public class ScreenReaderData
    {
        /// <summary>
        /// ARIA labels
        /// </summary>
        public Dictionary<string, string> AriaLabels { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Hierarchical structure
        /// </summary>
        public List<ScreenReaderElement> Structure { get; set; } = new List<ScreenReaderElement>();

        /// <summary>
        /// Alternative text descriptions
        /// </summary>
        public Dictionary<string, string> AltTextDescriptions { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Represents a screen reader element
    /// </summary>
    public class ScreenReaderElement
    {
        /// <summary>
        /// Element ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Element type
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Element content
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Element level in the hierarchy
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// Child elements
        /// </summary>
        public List<ScreenReaderElement> Children { get; set; } = new List<ScreenReaderElement>();
    }
}
