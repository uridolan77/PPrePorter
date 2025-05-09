using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Metadata DTO for DailyActions report
    /// </summary>
    public class DailyActionMetadataDto
    {
        /// <summary>
        /// List of white labels
        /// </summary>
        public List<WhiteLabelDto> WhiteLabels { get; set; } = new List<WhiteLabelDto>();
        
        /// <summary>
        /// List of countries
        /// </summary>
        public List<CountryDto> Countries { get; set; } = new List<CountryDto>();
        
        /// <summary>
        /// List of currencies
        /// </summary>
        public List<CurrencyDto> Currencies { get; set; } = new List<CurrencyDto>();
        
        /// <summary>
        /// List of languages
        /// </summary>
        public List<LanguageDto> Languages { get; set; } = new List<LanguageDto>();
        
        /// <summary>
        /// List of platforms
        /// </summary>
        public List<string> Platforms { get; set; } = new List<string>();
        
        /// <summary>
        /// List of genders
        /// </summary>
        public List<string> Genders { get; set; } = new List<string>();
        
        /// <summary>
        /// List of statuses
        /// </summary>
        public List<string> Statuses { get; set; } = new List<string>();
        
        /// <summary>
        /// List of player types
        /// </summary>
        public List<string> PlayerTypes { get; set; } = new List<string>();
        
        /// <summary>
        /// List of registration play modes
        /// </summary>
        public List<string> RegistrationPlayModes { get; set; } = new List<string>();
        
        /// <summary>
        /// List of trackers
        /// </summary>
        public List<string> Trackers { get; set; } = new List<string>();
        
        /// <summary>
        /// List of group by options
        /// </summary>
        public List<GroupByOptionDto> GroupByOptions { get; set; } = new List<GroupByOptionDto>();
    }
    
    /// <summary>
    /// DTO for white label
    /// </summary>
    public class WhiteLabelDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// DTO for country
    /// </summary>
    public class CountryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? IsoCode { get; set; }
    }
    
    /// <summary>
    /// DTO for currency
    /// </summary>
    public class CurrencyDto
    {
        public byte Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Symbol { get; set; }
    }
    
    /// <summary>
    /// DTO for language
    /// </summary>
    public class LanguageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// DTO for group by option
    /// </summary>
    public class GroupByOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
