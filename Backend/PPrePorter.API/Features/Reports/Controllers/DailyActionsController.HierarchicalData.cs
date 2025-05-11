using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models;
using System.Text.Json;
using System.Linq;

namespace PPrePorter.API.Features.Reports.Controllers
{
    /// <summary>
    /// Partial class for DailyActionsController containing hierarchical data endpoints
    /// </summary>
    public partial class DailyActionsController
    {
        /// <summary>
        /// Get hierarchical grouped daily actions data
        /// </summary>
        /// <param name="filter">Filter parameters with groupByLevels option</param>
        [HttpPost("hierarchical-grouped")]
        public async Task<IActionResult> GetHierarchicalGroupedDailyActionsData([FromBody] DailyActionFilterDto filter)
        {
            try
            {
                // Validate filter
                if (filter == null)
                {
                    return BadRequest(new { message = "Filter is required" });
                }

                // Default date range to yesterday-today if not specified
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                filter.StartDate ??= yesterday;
                filter.EndDate ??= today;

                // Ensure we have at least one grouping level
                if (filter.GroupByLevels == null || !filter.GroupByLevels.Any())
                {
                    filter.GroupByLevels = new List<GroupByOption> { filter.GroupBy };
                }

                // Remove pagination for grouping (we'll return all grouped results)
                // Set a large page size to get all records
                filter.PageSize = 1000;
                filter.PageNumber = 1;

                _logger.LogInformation("Hierarchical grouping with levels: {Levels}. Set PageSize={PageSize}, PageNumber={PageNumber}",
                    string.Join(", ", filter.GroupByLevels), filter.PageSize, filter.PageNumber);

                // Get all filtered daily actions data
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Create hierarchical data structure
                // Start with the first level of grouping
                var firstLevelGroupBy = filter.GroupByLevels.FirstOrDefault();
                var hierarchicalData = CreateHierarchicalData(result.Data, firstLevelGroupBy, whiteLabelDict, 0);

                // Get summary metrics
                var summary = await _dailyActionsService.GetSummaryMetricsAsync(
                    filter.StartDate.Value,
                    filter.EndDate.Value,
                    filter.WhiteLabelIds?.FirstOrDefault());

                // Create the response
                var response = new HierarchicalDailyActionResponseDto
                {
                    Data = hierarchicalData,
                    Summary = new DailyActionsSummaryDto
                    {
                        TotalRegistrations = summary.TotalRegistrations,
                        TotalFTD = summary.TotalFTD,
                        TotalDeposits = summary.TotalDeposits,
                        TotalCashouts = summary.TotalCashouts,
                        TotalGGR = summary.TotalGGR
                    },
                    TotalCount = result.TotalCount,
                    GroupByLevels = filter.GroupByLevels,
                    StartDate = filter.StartDate.Value,
                    EndDate = filter.EndDate.Value,
                    AppliedFilters = filter
                };

                // Log the response
                _logger.LogInformation("GetHierarchicalGroupedDailyActionsData: Returning response with {Count} top-level groups",
                    hierarchicalData.Count);

                // Return the hierarchical grouped data with summary
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving hierarchical grouped daily actions data");
                return StatusCode(500, new { message = "An error occurred while retrieving hierarchical grouped daily actions data" });
            }
        }

        /// <summary>
        /// Load children for a specific group
        /// </summary>
        /// <param name="request">Request with parent path and child level information</param>
        [HttpPost("load-group-children")]
        public async Task<IActionResult> LoadGroupChildren([FromBody] GroupChildrenRequestDto request)
        {
            try
            {
                // Validate request
                if (request == null || string.IsNullOrEmpty(request.ParentPath) || request.Filter == null)
                {
                    return BadRequest(new { message = "Invalid request parameters" });
                }

                _logger.LogInformation("Loading children for parent path: {ParentPath}, child level: {ChildLevel}, group by: {GroupBy}",
                    request.ParentPath, request.ChildLevel, request.GroupBy);

                // Get filtered data based on the parent path constraints
                // This would involve parsing the parent path to add additional filters
                var filter = request.Filter;
                
                // Apply parent path constraints to the filter
                ApplyParentPathConstraints(filter, request.ParentPath);

                // Get filtered data
                var result = await _dailyActionsService.GetFilteredDailyActionsAsync(filter);

                // Get white labels for mapping names
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(true);
                var whiteLabelDict = whiteLabels.ToDictionary(wl => wl.Id, wl => wl.Name);

                // Group the data by the requested child level
                var childrenData = CreateHierarchicalData(result.Data, request.GroupBy, whiteLabelDict, request.ChildLevel, request.ParentPath);

                // Return the children data
                return Ok(new { children = childrenData, totalCount = childrenData.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading group children");
                return StatusCode(500, new { message = "An error occurred while loading group children" });
            }
        }

        /// <summary>
        /// Create hierarchical data structure from flat data
        /// </summary>
        /// <param name="data">Flat daily actions data</param>
        /// <param name="groupBy">Group by option for this level</param>
        /// <param name="whiteLabelDict">Dictionary of white label IDs to names</param>
        /// <param name="level">Current hierarchy level (0-based)</param>
        /// <param name="parentPath">Path to the parent node</param>
        /// <returns>Hierarchical data structure</returns>
        private List<HierarchicalDailyActionDto> CreateHierarchicalData(
            IEnumerable<DailyActionDto> data, 
            GroupByOption groupBy, 
            Dictionary<int, string> whiteLabelDict, 
            int level = 0,
            string parentPath = "")
        {
            if (data == null || !data.Any())
            {
                return new List<HierarchicalDailyActionDto>();
            }

            // Define the grouping key selector based on the GroupBy option
            Func<DailyActionDto, object> keySelector;
            Func<DailyActionDto, object, HierarchicalDailyActionDto> resultSelector;

            switch (groupBy)
            {
                case GroupByOption.Day:
                    // Group by day (date)
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Day",
                        GroupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        GroupData = key,
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Day:{((DateTime)key):yyyyMMdd}" 
                            : $"{parentPath}/Day:{((DateTime)key):yyyyMMdd}"
                    };
                    break;

                case GroupByOption.Month:
                    // Group by month
                    keySelector = da => new { da.Date.Year, da.Date.Month };
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Month",
                        GroupValue = $"{((dynamic)key).Year}-{((dynamic)key).Month:D2}",
                        GroupData = new DateTime(((dynamic)key).Year, ((dynamic)key).Month, 1),
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Month:{((dynamic)key).Year}{((dynamic)key).Month:D2}" 
                            : $"{parentPath}/Month:{((dynamic)key).Year}{((dynamic)key).Month:D2}"
                    };
                    break;

                case GroupByOption.Year:
                    // Group by year
                    keySelector = da => da.Date.Year;
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Year",
                        GroupValue = key.ToString(),
                        GroupData = new DateTime((int)key, 1, 1),
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Year:{key}" 
                            : $"{parentPath}/Year:{key}"
                    };
                    break;

                case GroupByOption.Label:
                    // Group by white label
                    keySelector = da => da.WhiteLabelId;
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Label",
                        GroupValue = whiteLabelDict.TryGetValue((int)key, out var name) ? name : $"Label {key}",
                        GroupData = new { WhiteLabelId = key, WhiteLabelName = whiteLabelDict.TryGetValue((int)key, out var wlName) ? wlName : $"Label {key}" },
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Label:{key}" 
                            : $"{parentPath}/Label:{key}"
                    };
                    break;

                case GroupByOption.Country:
                    // Group by country
                    keySelector = da => da.CountryName ?? "Unknown";
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Country",
                        GroupValue = key.ToString(),
                        GroupData = key,
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Country:{key}" 
                            : $"{parentPath}/Country:{key}"
                    };
                    break;

                case GroupByOption.Player:
                    // Group by player
                    keySelector = da => da.PlayerId ?? 0;
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Player",
                        GroupValue = da.PlayerName ?? $"Player {key}",
                        GroupData = new { PlayerId = key, PlayerName = da.PlayerName ?? $"Player {key}" },
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Player:{key}" 
                            : $"{parentPath}/Player:{key}"
                    };
                    break;

                default:
                    // Default to day if unknown groupBy value
                    keySelector = da => da.Date.Date;
                    resultSelector = (da, key) => new HierarchicalDailyActionDto
                    {
                        GroupKey = "Day",
                        GroupValue = ((DateTime)key).ToString("yyyy-MM-dd"),
                        GroupData = key,
                        Level = level,
                        Path = string.IsNullOrEmpty(parentPath) 
                            ? $"Day:{((DateTime)key):yyyyMMdd}" 
                            : $"{parentPath}/Day:{((DateTime)key):yyyyMMdd}"
                    };
                    break;
            }

            // Log the data before grouping
            _logger.LogInformation("CreateHierarchicalData: About to group {Count} records by {GroupBy} at level {Level}",
                data.Count(), groupBy, level);

            // Perform the grouping and sum all numeric fields
            var groups = data.GroupBy(keySelector).ToList();

            // Log the number of groups
            _logger.LogInformation("CreateHierarchicalData: Created {Count} groups after grouping by {GroupBy} at level {Level}",
                groups.Count, groupBy, level);

            var hierarchicalData = groups.Select(g => {
                // Create the base hierarchical object with the group key
                var hierarchicalObj = resultSelector(g.First(), g.Key);

                // Add metrics
                hierarchicalObj.Metrics = new Dictionary<string, decimal>
                {
                    // Basic metrics
                    { "registrations", g.Sum(da => da.Registrations) },
                    { "ftd", g.Sum(da => da.FTD) },
                    { "deposits", g.Sum(da => da.Deposits) },
                    { "paidCashouts", g.Sum(da => da.PaidCashouts) },

                    // Casino metrics
                    { "betsCasino", g.Sum(da => da.BetsCasino) },
                    { "winsCasino", g.Sum(da => da.WinsCasino) },
                    { "ggrCasino", g.Sum(da => da.GGRCasino) },

                    // Sport metrics
                    { "betsSport", g.Sum(da => da.BetsSport) },
                    { "winsSport", g.Sum(da => da.WinsSport) },
                    { "ggrSport", g.Sum(da => da.GGRSport) },

                    // Live metrics
                    { "betsLive", g.Sum(da => da.BetsLive) },
                    { "winsLive", g.Sum(da => da.WinsLive) },
                    { "ggrLive", g.Sum(da => da.GGRLive) },

                    // Bingo metrics
                    { "betsBingo", g.Sum(da => da.BetsBingo) },
                    { "winsBingo", g.Sum(da => da.WinsBingo) },
                    { "ggrBingo", g.Sum(da => da.GGRBingo) },

                    // Total GGR
                    { "totalGGR", g.Sum(da => da.TotalGGR) }
                };

                // Mark as having children if there are more grouping levels
                hierarchicalObj.HasChildren = true;
                hierarchicalObj.ChildrenLoaded = false;

                return hierarchicalObj;
            }).ToList();

            return hierarchicalData;
        }

        /// <summary>
        /// Apply parent path constraints to the filter
        /// </summary>
        /// <param name="filter">Filter to modify</param>
        /// <param name="parentPath">Path to the parent node</param>
        private void ApplyParentPathConstraints(DailyActionFilterDto filter, string parentPath)
        {
            if (string.IsNullOrEmpty(parentPath))
                return;

            // Parse the parent path to extract constraints
            // Format: GroupKey1:Value1/GroupKey2:Value2/...
            var pathSegments = parentPath.Split('/');
            
            foreach (var segment in pathSegments)
            {
                var parts = segment.Split(':');
                if (parts.Length != 2)
                    continue;

                var groupKey = parts[0];
                var groupValue = parts[1];

                switch (groupKey)
                {
                    case "Day":
                        if (DateTime.TryParseExact(groupValue, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var day))
                        {
                            filter.StartDate = day;
                            filter.EndDate = day.AddDays(1).AddTicks(-1);
                        }
                        break;

                    case "Month":
                        if (groupValue.Length == 6 && int.TryParse(groupValue.Substring(0, 4), out var year) && int.TryParse(groupValue.Substring(4, 2), out var month))
                        {
                            var startOfMonth = new DateTime(year, month, 1);
                            filter.StartDate = startOfMonth;
                            filter.EndDate = startOfMonth.AddMonths(1).AddTicks(-1);
                        }
                        break;

                    case "Year":
                        if (int.TryParse(groupValue, out var yearValue))
                        {
                            filter.StartDate = new DateTime(yearValue, 1, 1);
                            filter.EndDate = new DateTime(yearValue, 12, 31, 23, 59, 59);
                        }
                        break;

                    case "Label":
                        if (int.TryParse(groupValue, out var labelId))
                        {
                            filter.WhiteLabelIds = new List<int> { labelId };
                        }
                        break;

                    case "Country":
                        filter.Countries = new List<string> { groupValue };
                        break;

                    case "Player":
                        if (long.TryParse(groupValue, out var playerId))
                        {
                            filter.PlayerIds = new List<long> { playerId };
                        }
                        break;
                }
            }
        }
    }
}
