using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;

namespace PPrePorter.API.Features.Reports.Controllers.DailyActions
{
    /// <summary>
    /// Partial class for DailyActionsController containing grouping helper methods
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Group daily actions data based on the specified groupBy parameter
        /// </summary>
        /// <param name="data">Raw daily actions data</param>
        /// <param name="groupBy">GroupBy option (Day=0, Month=1, Year=2, Label=3, etc.)</param>
        /// <param name="whiteLabelDict">Dictionary of white label IDs to names</param>
        /// <param name="startDate">Start date of the filter range</param>
        /// <param name="endDate">End date of the filter range</param>
        /// <returns>Grouped data with summed metrics</returns>
        private IEnumerable<object> GroupDailyActionsData(IEnumerable<DailyActionDto> data, GroupByOption groupBy, Dictionary<int, string> whiteLabelDict, DateTime startDate, DateTime endDate)
        {
            // Start a stopwatch to measure performance
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("GroupDailyActionsData: Starting grouping operation at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);

            if (data == null || !data.Any())
            {
                _logger.LogInformation("GroupDailyActionsData: No data to group, returning empty result at {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
                return Enumerable.Empty<object>();
            }

            _logger.LogInformation("GroupDailyActionsData: Processing {Count} records, groupBy={GroupBy} at {ElapsedMs}ms",
                data.Count(), groupBy, stopwatch.ElapsedMilliseconds);

            // Define the grouping key selector based on the GroupBy option
            Func<DailyActionDto, object> keySelector;
            Func<DailyActionDto, object, object> resultSelector;

            switch (groupBy)
            {
                case GroupByOption.Day:
                    // Group by day (date)
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Day",
                        groupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        date = key,
                    };
                    break;

                case GroupByOption.Month:
                    // Group by month
                    keySelector = da => new { da.Date.Year, da.Date.Month };
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Month",
                        groupValue = $"{((dynamic)key).Year}-{((dynamic)key).Month:D2}",
                        date = new DateTime(((dynamic)key).Year, ((dynamic)key).Month, 1),
                    };
                    break;

                case GroupByOption.Year:
                    // Group by year
                    keySelector = da => da.Date.Year;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Year",
                        groupValue = key.ToString(),
                        date = new DateTime((int)key, 1, 1),
                    };
                    break;

                case GroupByOption.Label:
                    // Group by white label
                    keySelector = da => da.WhiteLabelId;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Label",
                        groupValue = whiteLabelDict.TryGetValue((int)key, out var name) ? name : $"Label {key}",
                        whiteLabelId = key,
                        whiteLabelName = whiteLabelDict.TryGetValue((int)key, out var wlName) ? wlName : $"Label {key}",
                    };
                    break;

                default:
                    // Default to day if unknown groupBy value
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new
                    {
                        groupKey = "Day",
                        groupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        date = key,
                    };
                    break;
            }

            // Perform the grouping
            var groups = data.GroupBy(keySelector).ToList();

            // Create the grouped data
            var groupedData = groups.Select(g => {
                // Create the base object with the group key
                var baseObj = resultSelector(g.First(), g.Key);

                // Create a dynamic object to hold the result
                dynamic result = new ExpandoObject();
                var resultDict = (IDictionary<string, object>)result;

                // Add the base properties
                foreach (var prop in baseObj.GetType().GetProperties())
                {
                    resultDict[prop.Name] = prop.GetValue(baseObj);
                }

                // Add ID
                resultDict["id"] = Guid.NewGuid().ToString();

                // Add the summed metrics
                resultDict["registrations"] = g.Sum(da => da.Registrations);
                resultDict["ftd"] = g.Sum(da => da.FTD);
                resultDict["ftda"] = g.Sum(da => da.FTDA);
                resultDict["deposits"] = g.Sum(da => da.Deposits);
                resultDict["paidCashouts"] = g.Sum(da => da.PaidCashouts);
                resultDict["betsCasino"] = g.Sum(da => da.BetsCasino);
                resultDict["winsCasino"] = g.Sum(da => da.WinsCasino);
                resultDict["betsSport"] = g.Sum(da => da.BetsSport);
                resultDict["winsSport"] = g.Sum(da => da.WinsSport);
                resultDict["betsLive"] = g.Sum(da => da.BetsLive);
                resultDict["winsLive"] = g.Sum(da => da.WinsLive);
                resultDict["betsBingo"] = g.Sum(da => da.BetsBingo);
                resultDict["winsBingo"] = g.Sum(da => da.WinsBingo);

                // Add GGR values
                resultDict["ggrCasino"] = g.Sum(da => da.GGRCasino);
                resultDict["ggrSport"] = g.Sum(da => da.GGRSport);
                resultDict["ggrLive"] = g.Sum(da => da.GGRLive);
                resultDict["ggrBingo"] = g.Sum(da => da.GGRBingo);
                resultDict["totalGGR"] = g.Sum(da => da.TotalGGR);

                return result;
            })
            .ToList<object>();

            return groupedData;
        }
    }
}
