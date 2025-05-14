using CoreGroupByOption = PPrePorter.Core.Models.DTOs.GroupByOption;
using DbGroupByOption = PPrePorter.DailyActionsDB.Models.DTOs.GroupByOption;

namespace PPrePorter.Infrastructure.Adapters
{
    /// <summary>
    /// Adapter for converting between Core.Models.DTOs.GroupByOption and DailyActionsDB.Models.DTOs.GroupByOption
    /// </summary>
    public static class GroupByOptionAdapter
    {
        /// <summary>
        /// Converts a DailyActionsDB.Models.DTOs.GroupByOption to Core.Models.DTOs.GroupByOption
        /// </summary>
        public static CoreGroupByOption ToCore(this DbGroupByOption dbGroupByOption)
        {
            return dbGroupByOption switch
            {
                DbGroupByOption.Day => CoreGroupByOption.Day,
                DbGroupByOption.Month => CoreGroupByOption.Month,
                DbGroupByOption.Year => CoreGroupByOption.Year,
                DbGroupByOption.Label => CoreGroupByOption.WhiteLabel,
                DbGroupByOption.Country => CoreGroupByOption.Country,
                DbGroupByOption.Currency => CoreGroupByOption.Currency,
                DbGroupByOption.Platform => CoreGroupByOption.Platform,
                DbGroupByOption.Player => CoreGroupByOption.Player,
                _ => CoreGroupByOption.None
            };
        }

        /// <summary>
        /// Converts a Core.Models.DTOs.GroupByOption to DailyActionsDB.Models.DTOs.GroupByOption
        /// </summary>
        public static DbGroupByOption ToDb(this CoreGroupByOption coreGroupByOption)
        {
            return coreGroupByOption switch
            {
                CoreGroupByOption.Day => DbGroupByOption.Day,
                CoreGroupByOption.Month => DbGroupByOption.Month,
                CoreGroupByOption.Year => DbGroupByOption.Year,
                CoreGroupByOption.WhiteLabel => DbGroupByOption.Label,
                CoreGroupByOption.Country => DbGroupByOption.Country,
                CoreGroupByOption.Currency => DbGroupByOption.Currency,
                CoreGroupByOption.Platform => DbGroupByOption.Platform,
                CoreGroupByOption.Player => DbGroupByOption.Player,
                _ => DbGroupByOption.Day
            };
        }

        /// <summary>
        /// Converts a string to DailyActionsDB.Models.DTOs.GroupByOption
        /// </summary>
        public static DbGroupByOption StringToDbGroupByOption(string groupByString)
        {
            if (string.IsNullOrEmpty(groupByString))
            {
                return DbGroupByOption.Day;
            }

            return groupByString.ToLower() switch
            {
                "day" => DbGroupByOption.Day,
                "month" => DbGroupByOption.Month,
                "year" => DbGroupByOption.Year,
                "label" => DbGroupByOption.Label,
                "whitelabel" => DbGroupByOption.Label,
                "white label" => DbGroupByOption.Label,
                "country" => DbGroupByOption.Country,
                "tracker" => DbGroupByOption.Tracker,
                "currency" => DbGroupByOption.Currency,
                "gender" => DbGroupByOption.Gender,
                "platform" => DbGroupByOption.Platform,
                "ranking" => DbGroupByOption.Ranking,
                "player" => DbGroupByOption.Player,
                _ => DbGroupByOption.Day
            };
        }
    }
}
