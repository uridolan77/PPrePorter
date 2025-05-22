using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// DTO for combined metadata response
    /// </summary>
    public class MetadataResponseDto
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
    }
}
