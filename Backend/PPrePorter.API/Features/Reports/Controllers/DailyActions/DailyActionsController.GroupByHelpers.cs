using PPrePorter.DailyActionsDB.Models.DTOs;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Partial class for DailyActionsController containing helper methods for GroupBy operations
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Convert string-based group by option to enum value
        /// </summary>
        /// <param name="groupByString">String representation of group by option</param>
        /// <returns>Corresponding GroupByOption enum value</returns>
        private GroupByOption ConvertStringToGroupByOption(string groupByString)
        {
            if (string.IsNullOrEmpty(groupByString))
            {
                return GroupByOption.Day; // Default to Day if not specified
            }

            // Try to parse as enum directly (case-insensitive)
            if (Enum.TryParse<GroupByOption>(groupByString, true, out var result))
            {
                return result;
            }

            // If not parsed directly, map common string values to enum values
            return groupByString.ToLower() switch
            {
                "day" => GroupByOption.Day,
                "month" => GroupByOption.Month,
                "year" => GroupByOption.Year,
                "label" => GroupByOption.Label,
                "whitelabel" => GroupByOption.Label,
                "white label" => GroupByOption.Label,
                "country" => GroupByOption.Country,
                "tracker" => GroupByOption.Tracker,
                "currency" => GroupByOption.Currency,
                "gender" => GroupByOption.Gender,
                "platform" => GroupByOption.Platform,
                "ranking" => GroupByOption.Ranking,
                "player" => GroupByOption.Player,
                _ => GroupByOption.Day // Default to Day for unknown values
            };
        }

        /// <summary>
        /// Convert list of string-based group by options to list of enum values
        /// </summary>
        /// <param name="groupByStrings">List of string representations of group by options</param>
        /// <returns>List of corresponding GroupByOption enum values</returns>
        private List<GroupByOption> ConvertStringsToGroupByOptions(List<string> groupByStrings)
        {
            if (groupByStrings == null || !groupByStrings.Any())
            {
                return new List<GroupByOption> { GroupByOption.Day }; // Default to Day if not specified
            }

            return groupByStrings.Select(ConvertStringToGroupByOption).ToList();
        }

        /// <summary>
        /// Process filter to handle string-based group by options
        /// </summary>
        /// <param name="filter">The filter to process</param>
        private void ProcessStringBasedGroupBy(DailyActionFilterDto filter)
        {
            if (filter == null)
                return;

            // Process GroupByString if provided
            if (!string.IsNullOrEmpty(filter.GroupByString))
            {
                filter.GroupBy = ConvertStringToGroupByOption(filter.GroupByString);
                _logger.LogInformation("Converted GroupByString '{GroupByString}' to GroupBy enum value '{GroupBy}'", 
                    filter.GroupByString, filter.GroupBy);
            }

            // Process GroupByLevelsStrings if provided
            if (filter.GroupByLevelsStrings != null && filter.GroupByLevelsStrings.Any())
            {
                filter.GroupByLevels = ConvertStringsToGroupByOptions(filter.GroupByLevelsStrings);
                _logger.LogInformation("Converted GroupByLevelsStrings '{GroupByLevelsStrings}' to GroupByLevels enum values '{GroupByLevels}'", 
                    string.Join(", ", filter.GroupByLevelsStrings), string.Join(", ", filter.GroupByLevels));
            }
        }
    }
}
