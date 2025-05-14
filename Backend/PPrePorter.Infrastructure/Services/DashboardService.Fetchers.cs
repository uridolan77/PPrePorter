using Microsoft.Extensions.Logging;
using PPrePorter.Core.Models.DTOs;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static PPrePorter.Core.Models.DTOs.DailyActionFilterDto;

namespace PPrePorter.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the dashboard service that uses real data from the DailyActionsService
    /// Data fetching methods
    /// </summary>
    public partial class DashboardService
    {
        /// <summary>
        /// Fetches the dashboard summary using real data from DailyActionsService
        /// </summary>
        private async Task<DashboardSummary> FetchDashboardSummaryRealAsync(DashboardRequest request)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);
                var whiteLabelIds = await _dataFilterService.GetAccessibleWhiteLabelIdsAsync(request.UserId);

                if (request.WhiteLabelId.HasValue && whiteLabelIds.Contains(request.WhiteLabelId.Value))
                {
                    whiteLabelIds = new List<int> { request.WhiteLabelId.Value };
                }

                // Create filter for today's data
                var todayFilter = new DailyActionFilterDto
                {
                    StartDate = today,
                    EndDate = today,
                    WhiteLabelIds = whiteLabelIds,
                    PageSize = 1000, // Large enough to get all data
                    PageNumber = 1
                };

                // Create filter for yesterday's data
                var yesterdayFilter = new DailyActionFilterDto
                {
                    StartDate = yesterday,
                    EndDate = yesterday,
                    WhiteLabelIds = whiteLabelIds,
                    PageSize = 1000, // Large enough to get all data
                    PageNumber = 1
                };

                // Get today's and yesterday's data
                var todayResponse = await _dailyActionsService.GetFilteredDailyActionsAsync(todayFilter);
                var yesterdayResponse = await _dailyActionsService.GetFilteredDailyActionsAsync(yesterdayFilter);

                // Extract summary metrics
                var todaySummary = todayResponse.Summary;
                var yesterdaySummary = yesterdayResponse.Summary;

                // Calculate average deposit amount
                decimal avgDepositAmount = 0;
                if (todaySummary.TotalRegistrations > 0)
                {
                    avgDepositAmount = todaySummary.TotalDeposits / todaySummary.TotalRegistrations;
                }

                // Calculate average withdrawal amount
                decimal avgWithdrawalAmount = 0;
                if (todaySummary.TotalRegistrations > 0)
                {
                    avgWithdrawalAmount = todaySummary.TotalCashouts / todaySummary.TotalRegistrations;
                }

                // Calculate conversion rate (FTD / Registrations)
                decimal conversionRate = 0;
                if (todaySummary.TotalRegistrations > 0)
                {
                    conversionRate = (decimal)todaySummary.TotalFTD / todaySummary.TotalRegistrations * 100;
                }

                // Create dashboard summary
                var summary = new DashboardSummary
                {
                    Date = today,
                    TotalRevenue = todaySummary.TotalGGR,
                    RevenueChange = CalculateChangePercentageDecimal(todaySummary.TotalGGR, yesterdaySummary.TotalGGR),
                    TotalRegistrations = todaySummary.TotalRegistrations,
                    RegistrationsChange = CalculateChangePercentage(todaySummary.TotalRegistrations, yesterdaySummary.TotalRegistrations),
                    TotalDeposits = (int)todaySummary.TotalDeposits,
                    DepositsChange = CalculateChangePercentageDecimal(todaySummary.TotalDeposits, yesterdaySummary.TotalDeposits),
                    TotalWithdrawals = (int)todaySummary.TotalCashouts,
                    WithdrawalsChange = CalculateChangePercentageDecimal(todaySummary.TotalCashouts, yesterdaySummary.TotalCashouts),
                    AverageDepositAmount = avgDepositAmount,
                    AverageWithdrawalAmount = avgWithdrawalAmount,
                    ActivePlayers = todayResponse.Data.Select(d => d.PlayerId).Distinct().Count(),
                    ConversionRate = conversionRate,
                    Bets = todaySummary.TotalBetsCasino + todaySummary.TotalBetsSport + todaySummary.TotalBetsLive + todaySummary.TotalBetsBingo,
                    BetsChange = CalculateChangePercentageDecimal(
                        todaySummary.TotalBetsCasino + todaySummary.TotalBetsSport + todaySummary.TotalBetsLive + todaySummary.TotalBetsBingo,
                        yesterdaySummary.TotalBetsCasino + yesterdaySummary.TotalBetsSport + yesterdaySummary.TotalBetsLive + yesterdaySummary.TotalBetsBingo),
                    Wins = todaySummary.TotalWinsCasino + todaySummary.TotalWinsSport + todaySummary.TotalWinsLive + todaySummary.TotalWinsBingo,
                    WinsChange = CalculateChangePercentageDecimal(
                        todaySummary.TotalWinsCasino + todaySummary.TotalWinsSport + todaySummary.TotalWinsLive + todaySummary.TotalWinsBingo,
                        yesterdaySummary.TotalWinsCasino + yesterdaySummary.TotalWinsSport + yesterdaySummary.TotalWinsLive + yesterdaySummary.TotalWinsBingo)
                };

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard summary for user {UserId}", request.UserId);
                throw;
            }
        }

        /// <summary>
        /// Calculates the percentage change between two decimal values
        /// </summary>
        private decimal CalculateChangePercentageDecimal(decimal current, decimal previous)
        {
            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }

            return (current - previous) / previous * 100;
        }

        /// <summary>
        /// Calculates the percentage change between two integer values
        /// </summary>
        private decimal CalculateChangePercentage(int current, int previous)
        {
            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }

            return (decimal)(current - previous) / previous * 100;
        }

        /// <summary>
        /// Fetches the dashboard data
        /// </summary>
        private async Task<DashboardData> FetchDashboardDataAsync(DashboardRequest request)
        {
            try
            {
                // Get all dashboard data in parallel
                var summaryTask = FetchDashboardSummaryAsync(request);
                var revenueChartTask = FetchCasinoRevenueChartDataAsync(request);
                var registrationsChartTask = FetchPlayerRegistrationsChartDataAsync(request);
                var topGamesTask = FetchTopGamesDataAsync(request);
                var recentTransactionsTask = FetchRecentTransactionsAsync(request);

                await Task.WhenAll(
                    summaryTask,
                    revenueChartTask,
                    registrationsChartTask,
                    topGamesTask,
                    recentTransactionsTask);

                var dashboard = new DashboardData
                {
                    Summary = await summaryTask,
                    CasinoRevenue = await revenueChartTask,
                    PlayerRegistrations = await registrationsChartTask,
                    TopGames = await topGamesTask,
                    RecentTransactions = await recentTransactionsTask
                };

                return dashboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard data for user {UserId}", request.UserId);
                throw;
            }
        }
    }
}
