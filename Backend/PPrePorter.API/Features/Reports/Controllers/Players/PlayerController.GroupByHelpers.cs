using PPrePorter.DailyActionsDB.Models.DTOs;

namespace PPrePorter.API.Features.Reports.Controllers.Players
{
    /// <summary>
    /// Partial class for PlayerController containing helper methods for GroupBy operations
    /// </summary>
    public partial class PlayerController
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
    }
}
