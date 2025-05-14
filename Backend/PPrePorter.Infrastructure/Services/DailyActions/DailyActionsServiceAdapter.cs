using Microsoft.Extensions.Logging;
using PPrePorter.Infrastructure.Adapters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// Use aliases to disambiguate between the two interfaces
using CoreIDailyActionsService = PPrePorter.Core.Interfaces.DailyActions.IDailyActionsService;
using DailyActionsDBIDailyActionsService = PPrePorter.DailyActionsDB.Interfaces.IDailyActionsService;
// Use aliases to disambiguate between the two DTOs
using CoreDailyActionDto = PPrePorter.Core.Models.DTOs.DailyActionDto;
using CoreDailyActionFilterDto = PPrePorter.Core.Models.DTOs.DailyActionFilterDto;
using CoreDailyActionResponseDto = PPrePorter.Core.Models.DTOs.DailyActionResponseDto;
using CoreDailyActionSummaryDto = PPrePorter.Core.Models.DTOs.DailyActionSummaryDto;
using CoreGroupByOption = PPrePorter.Core.Models.DTOs.GroupByOption;
using DbDailyActionDto = PPrePorter.DailyActionsDB.Models.DTOs.DailyActionDto;
using DbDailyActionFilterDto = PPrePorter.DailyActionsDB.Models.DTOs.DailyActionFilterDto;
using DbDailyActionResponseDto = PPrePorter.DailyActionsDB.Models.DTOs.DailyActionResponseDto;
using DbDailyActionsSummaryDto = PPrePorter.DailyActionsDB.Models.DTOs.DailyActionsSummaryDto;
using DbGroupByOption = PPrePorter.DailyActionsDB.Models.DTOs.GroupByOption;

namespace PPrePorter.Infrastructure.Services.DailyActions
{
    /// <summary>
    /// Adapter for the DailyActionsService that implements the Core IDailyActionsService interface
    /// and uses the DailyActionsDB IDailyActionsService implementation
    /// </summary>
    public class DailyActionsServiceAdapter : CoreIDailyActionsService
    {
        private readonly DailyActionsDBIDailyActionsService _dailyActionsService;
        private readonly ILogger<DailyActionsServiceAdapter> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        public DailyActionsServiceAdapter(
            DailyActionsDBIDailyActionsService dailyActionsService,
            ILogger<DailyActionsServiceAdapter> logger)
        {
            _dailyActionsService = dailyActionsService ?? throw new ArgumentNullException(nameof(dailyActionsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets filtered daily actions based on the provided filter
        /// </summary>
        public async Task<CoreDailyActionResponseDto> GetFilteredDailyActionsAsync(CoreDailyActionFilterDto filter)
        {
            try
            {
                // Convert Core filter to DailyActionsDB filter
                var dbFilter = ConvertToDailyActionsDBFilter(filter);

                // Call the DailyActionsDB service
                var dbResponse = await _dailyActionsService.GetFilteredDailyActionsAsync(dbFilter);

                // Convert DailyActionsDB response to Core response
                var response = ConvertToCoreResponse(dbResponse);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered daily actions");
                throw;
            }
        }

        /// <summary>
        /// Initializes the service by loading initial data
        /// </summary>
        public async Task InitializeAsync()
        {
            try
            {
                // Call the DailyActionsDB service
                await _dailyActionsService.PrewarmCacheAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing daily actions service");
                throw;
            }
        }

        /// <summary>
        /// Gets the raw daily actions data for a specific date range
        /// </summary>
        public async Task<List<CoreDailyActionDto>> GetRawDailyActionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Create a filter for the date range
                var dbFilter = new DbDailyActionFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    PageSize = 10000, // Large enough to get all data
                    PageNumber = 1
                };

                // Call the DailyActionsDB service
                var dbResponse = await _dailyActionsService.GetFilteredDailyActionsAsync(dbFilter);

                // Convert DailyActionsDB response to Core response
                var response = ConvertToCoreResponse(dbResponse);

                return response.Data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting raw daily actions by date range");
                throw;
            }
        }

        /// <summary>
        /// Converts a Core filter to a DailyActionsDB filter
        /// </summary>
        private DbDailyActionFilterDto ConvertToDailyActionsDBFilter(CoreDailyActionFilterDto filter)
        {
            return new DbDailyActionFilterDto
            {
                StartDate = filter.StartDate,
                EndDate = filter.EndDate,
                WhiteLabelIds = filter.WhiteLabelIds,
                PlayerIds = filter.PlayerIds,
                // Map the GroupBy enum using the adapter
                GroupBy = filter.GroupBy.ToDb(),
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                // Use string-based group by option
                GroupByString = filter.SortField
            };
        }

        /// <summary>
        /// Converts a DailyActionsDB response to a Core response
        /// </summary>
        private CoreDailyActionResponseDto ConvertToCoreResponse(DbDailyActionResponseDto dbResponse)
        {
            var response = new CoreDailyActionResponseDto
            {
                TotalRecords = dbResponse.TotalCount,
                TotalPages = dbResponse.TotalPages,
                CurrentPage = dbResponse.CurrentPage,
                PageSize = dbResponse.PageSize,
                Data = dbResponse.Data.Select(ConvertToCoreDto).ToList(),
                Summary = new CoreDailyActionSummaryDto
                {
                    TotalRegistrations = dbResponse.Summary.TotalRegistrations,
                    TotalFTD = dbResponse.Summary.TotalFTD,
                    TotalDeposits = dbResponse.Summary.TotalDeposits,
                    TotalCashouts = dbResponse.Summary.TotalCashouts,
                    TotalBetsCasino = dbResponse.Summary.TotalBetsCasino,
                    TotalWinsCasino = dbResponse.Summary.TotalWinsCasino,
                    TotalBetsSport = dbResponse.Summary.TotalBetsSport,
                    TotalWinsSport = dbResponse.Summary.TotalWinsSport,
                    TotalBetsLive = dbResponse.Summary.TotalBetsLive,
                    TotalWinsLive = dbResponse.Summary.TotalWinsLive,
                    TotalBetsBingo = dbResponse.Summary.TotalBetsBingo,
                    TotalWinsBingo = dbResponse.Summary.TotalWinsBingo,
                    TotalGGR = dbResponse.Summary.TotalGGR
                }
            };

            return response;
        }

        /// <summary>
        /// Converts a DailyActionsDB DTO to a Core DTO
        /// </summary>
        private CoreDailyActionDto ConvertToCoreDto(DbDailyActionDto dbDto)
        {
            var dto = new CoreDailyActionDto
            {
                Date = dbDto.Date,
                PlayerId = dbDto.PlayerId,
                PlayerName = dbDto.PlayerName ?? string.Empty,
                WhiteLabelId = dbDto.WhiteLabelId,
                WhiteLabelName = dbDto.WhiteLabelName,
                CountryName = dbDto.CountryName ?? string.Empty,
                CurrencyCode = dbDto.CurrencyCode ?? string.Empty,
                Registrations = dbDto.Registrations,
                FTD = dbDto.FTD,
                TotalDeposits = dbDto.Deposits,
                TotalCashouts = dbDto.PaidCashouts,
                TotalBetsCasino = dbDto.BetsCasino,
                TotalWinsCasino = dbDto.WinsCasino,
                TotalBetsSport = dbDto.BetsSport,
                TotalWinsSport = dbDto.WinsSport,
                TotalBetsLive = dbDto.BetsLive,
                TotalWinsLive = dbDto.WinsLive,
                TotalBetsBingo = dbDto.BetsBingo,
                TotalWinsBingo = dbDto.WinsBingo,
                TotalGGR = dbDto.TotalGGR,
                GroupData = dbDto.GroupData != null ? new Dictionary<string, object>(dbDto.GroupData) : new Dictionary<string, object>()
            };

            return dto;
        }
    }
}
