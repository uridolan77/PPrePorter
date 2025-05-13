// NOTE: This file is no longer used. We've switched to using Entity Framework with NOLOCK hints
// via the SqlCommandInterceptor and SqlNoLockExtensions classes.
// This file is kept for reference purposes only.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Extension methods for DailyActionsDbContext
    /// </summary>
    public static class DailyActionsDbContextExtensions
    {
        /// <summary>
        /// Gets daily actions with NOLOCK hint
        /// </summary>
        public static async Task<List<DailyAction>> GetDailyActionsWithNoLockAsync(
            this DailyActionsDbContext dbContext,
            DateTime startDate,
            DateTime endDate,
            int? whiteLabelId = null,
            ILogger logger = null)
        {
            try
            {
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                logger?.LogInformation("Getting daily actions with NOLOCK hint for date range {StartDate} to {EndDate}, whiteLabelId={WhiteLabelId}",
                    start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), whiteLabelId);

                // Build the SQL query with explicit NOLOCK hints
                var sql = @"
                    SELECT *
                    FROM common.tbl_Daily_actions WITH (NOLOCK)
                    WHERE Date >= @startDate AND Date <= @endDate";

                // Add white label filter if specified
                if (whiteLabelId.HasValue)
                {
                    sql += " AND WhiteLabelID = @whiteLabelId";
                }

                // Add ordering
                sql += " ORDER BY Date, WhiteLabelID";

                // Create parameters
                var parameters = new List<Microsoft.Data.SqlClient.SqlParameter>
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@startDate", start),
                    new Microsoft.Data.SqlClient.SqlParameter("@endDate", end)
                };

                if (whiteLabelId.HasValue)
                {
                    parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@whiteLabelId", whiteLabelId.Value));
                }

                // Execute the query with explicit NOLOCK hints
                var result = await dbContext.DailyActions
                    .FromSqlRaw(sql, parameters.ToArray())
                    .AsNoTracking()
                    .ToListAsync();

                logger?.LogInformation("Retrieved {Count} daily actions with NOLOCK hint", result.Count);

                return result;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Error getting daily actions with NOLOCK hint");
                throw;
            }
        }

        /// <summary>
        /// Gets grouped daily actions with NOLOCK hint
        /// </summary>
        public static async Task<List<DailyAction>> GetGroupedDailyActionsWithNoLockAsync(
            this DailyActionsDbContext dbContext,
            DateTime startDate,
            DateTime endDate,
            GroupByOption groupBy,
            int? whiteLabelId = null,
            ILogger logger = null)
        {
            try
            {
                // Normalize dates to start/end of day
                var start = startDate.Date;
                var end = endDate.Date.AddDays(1).AddTicks(-1);

                logger?.LogInformation("Getting grouped daily actions with NOLOCK hint for date range {StartDate} to {EndDate}, groupBy={GroupBy}, whiteLabelId={WhiteLabelId}",
                    start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"), groupBy, whiteLabelId);

                // Build the SQL query with explicit NOLOCK hints based on the grouping option
                string sql = "";

                // Common aggregation columns for all grouping options
                string aggregationColumns = @"
                    CAST(SUM(ISNULL(Registration, 0)) AS SMALLINT) AS Registration,
                    CAST(SUM(ISNULL(FTD, 0)) AS SMALLINT) AS FTD,
                    CAST(SUM(ISNULL(FTDA, 0)) AS SMALLINT) AS FTDA,
                    SUM(ISNULL(Deposits, 0)) AS Deposits,
                    SUM(ISNULL(PaidCashouts, 0)) AS PaidCashouts,
                    SUM(ISNULL(BetsCasino, 0)) AS BetsCasino,
                    SUM(ISNULL(WinsCasino, 0)) AS WinsCasino,
                    SUM(ISNULL(BetsSport, 0)) AS BetsSport,
                    SUM(ISNULL(WinsSport, 0)) AS WinsSport,
                    SUM(ISNULL(BetsLive, 0)) AS BetsLive,
                    SUM(ISNULL(WinsLive, 0)) AS WinsLive,
                    SUM(ISNULL(BetsBingo, 0)) AS BetsBingo,
                    SUM(ISNULL(WinsBingo, 0)) AS WinsBingo";

                switch (groupBy)
                {
                    case GroupByOption.Day:
                        sql = $@"
                            SELECT
                                CAST(Date AS DATETIME) AS Date,
                                NULL AS WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;

                    case GroupByOption.Month:
                        sql = $@"
                            SELECT
                                DATEFROMPARTS(YEAR(Date), MONTH(Date), 1) AS Date,
                                NULL AS WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;

                    case GroupByOption.Year:
                        sql = $@"
                            SELECT
                                DATEFROMPARTS(YEAR(Date), 1, 1) AS Date,
                                NULL AS WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;

                    case GroupByOption.Label:
                        sql = $@"
                            SELECT
                                NULL AS Date,
                                WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;

                    case GroupByOption.Country:
                        // For country grouping, we need to join with the players table
                        sql = $@"
                            SELECT
                                NULL AS Date,
                                NULL AS WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions da WITH (NOLOCK)
                            JOIN common.tbl_Daily_actions_players p WITH (NOLOCK) ON da.PlayerID = p.PlayerID
                            WHERE da.Date >= @startDate AND da.Date <= @endDate";
                        break;

                    case GroupByOption.Currency:
                        // For currency grouping, we need to join with the players table
                        sql = $@"
                            SELECT
                                NULL AS Date,
                                NULL AS WhiteLabelID,
                                NULL AS PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions da WITH (NOLOCK)
                            JOIN common.tbl_Daily_actions_players p WITH (NOLOCK) ON da.PlayerID = p.PlayerID
                            WHERE da.Date >= @startDate AND da.Date <= @endDate";
                        break;

                    case GroupByOption.Player:
                        sql = $@"
                            SELECT
                                NULL AS Date,
                                NULL AS WhiteLabelID,
                                PlayerID,
                                {aggregationColumns}
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;

                    default:
                        // For other grouping options, use the regular query
                        sql = @"
                            SELECT *
                            FROM common.tbl_Daily_actions WITH (NOLOCK)
                            WHERE Date >= @startDate AND Date <= @endDate";
                        break;
                }

                // Add white label filter if specified
                if (whiteLabelId.HasValue)
                {
                    sql += " AND WhiteLabelID = @whiteLabelId";
                }

                // Add grouping clause
                switch (groupBy)
                {
                    case GroupByOption.Day:
                        sql += " GROUP BY Date";
                        break;
                    case GroupByOption.Month:
                        sql += " GROUP BY YEAR(Date), MONTH(Date)";
                        break;
                    case GroupByOption.Year:
                        sql += " GROUP BY YEAR(Date)";
                        break;
                    case GroupByOption.Label:
                        sql += " GROUP BY WhiteLabelID";
                        break;
                    case GroupByOption.Country:
                        sql += " GROUP BY p.CountryID";
                        break;
                    case GroupByOption.Currency:
                        sql += " GROUP BY p.CurrencyID";
                        break;
                    case GroupByOption.Player:
                        sql += " GROUP BY PlayerID";
                        break;
                }

                // Create parameters
                var parameters = new List<Microsoft.Data.SqlClient.SqlParameter>
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@startDate", start),
                    new Microsoft.Data.SqlClient.SqlParameter("@endDate", end)
                };

                if (whiteLabelId.HasValue)
                {
                    parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@whiteLabelId", whiteLabelId.Value));
                }

                // Execute the query with explicit NOLOCK hints
                var result = await dbContext.DailyActions
                    .FromSqlRaw(sql, parameters.ToArray())
                    .AsNoTracking()
                    .ToListAsync();

                logger?.LogInformation("Retrieved {Count} grouped daily actions with NOLOCK hint", result.Count);

                return result;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Error getting grouped daily actions with NOLOCK hint");
                throw;
            }
        }
    }
}
