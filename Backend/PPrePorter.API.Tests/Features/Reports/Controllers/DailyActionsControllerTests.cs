using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.API.Features.Reports.Controllers;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PPrePorter.API.Tests.Features.Reports.Controllers
{
    public class DailyActionsControllerTests
    {
        private readonly Mock<IDailyActionsService> _mockDailyActionsService;
        private readonly Mock<ILogger<DailyActionsController>> _mockLogger;
        private readonly DailyActionsController _controller;

        public DailyActionsControllerTests()
        {
            _mockDailyActionsService = new Mock<IDailyActionsService>();
            _mockLogger = new Mock<ILogger<DailyActionsController>>();
            _controller = new DailyActionsController(_mockDailyActionsService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetDailyActions_ReturnsOkResult_WithDailyActions()
        {
            // Arrange
            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;
            var whiteLabelId = 1;

            var dailyActions = new List<DailyAction>
            {
                new DailyAction
                {
                    Id = 1,
                    Date = DateTime.UtcNow.AddDays(-2),
                    WhiteLabelID = whiteLabelId,
                    Registration = 100,
                    FTD = 50,
                    Deposits = 10000,
                    PaidCashouts = 5000,
                    BetsCasino = 8000,
                    WinsCasino = 7000,
                    GGRCasino = 1000,
                    TotalGGR = 1000
                },
                new DailyAction
                {
                    Id = 2,
                    Date = DateTime.UtcNow.AddDays(-1),
                    WhiteLabelID = whiteLabelId,
                    Registration = 150,
                    FTD = 75,
                    Deposits = 15000,
                    PaidCashouts = 7500,
                    BetsCasino = 12000,
                    WinsCasino = 10000,
                    GGRCasino = 2000,
                    TotalGGR = 2000
                }
            };

            _mockDailyActionsService.Setup(s => s.GetDailyActionsAsync(
                It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<int?>()))
                .ReturnsAsync(dailyActions);

            // Act
            var result = await _controller.GetDailyActions(startDate, endDate, whiteLabelId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<object>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetDailyActionById_ReturnsOkResult_WhenDailyActionExists()
        {
            // Arrange
            var id = 1;
            var dailyAction = new DailyAction
            {
                Id = id,
                Date = DateTime.UtcNow.AddDays(-1),
                WhiteLabelID = 1,
                Registration = 100,
                FTD = 50,
                Deposits = 10000,
                PaidCashouts = 5000,
                BetsCasino = 8000,
                WinsCasino = 7000,
                GGRCasino = 1000,
                TotalGGR = 1000
            };

            _mockDailyActionsService.Setup(s => s.GetDailyActionByIdAsync(id))
                .ReturnsAsync(dailyAction);

            // Act
            var result = await _controller.GetDailyActionById(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetDailyActionById_ReturnsNotFound_WhenDailyActionDoesNotExist()
        {
            // Arrange
            var id = 999;
            _mockDailyActionsService.Setup(s => s.GetDailyActionByIdAsync(id))
                .ReturnsAsync((DailyAction)null);

            // Act
            var result = await _controller.GetDailyActionById(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetDailyActionsSummary_ReturnsOkResult_WithSummary()
        {
            // Arrange
            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;
            var whiteLabelId = 1;

            var summary = new DailyActionsSummary
            {
                TotalRegistrations = 250,
                TotalFTD = 125,
                TotalDeposits = 25000,
                TotalCashouts = 12500,
                TotalGGR = 3000
            };

            _mockDailyActionsService.Setup(s => s.GetSummaryMetricsAsync(
                It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<int?>()))
                .ReturnsAsync(summary);

            // Act
            var result = await _controller.GetDailyActionsSummary(startDate, endDate, whiteLabelId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<object>(okResult.Value);
            Assert.NotNull(returnValue);
        }

        [Fact]
        public async Task GetFilteredDailyActions_ReturnsOkResult_WithFilteredData()
        {
            // Arrange
            var filter = new DailyActionFilterDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                WhiteLabelIds = new List<int> { 1 },
                PageNumber = 1,
                PageSize = 10
            };

            var response = new DailyActionResponseDto
            {
                Data = new List<DailyActionDto>
                {
                    new DailyActionDto
                    {
                        Id = 1,
                        Date = DateTime.UtcNow.AddDays(-2),
                        WhiteLabelId = 1,
                        WhiteLabelName = "Test Label",
                        Registrations = 100,
                        FTD = 50,
                        Deposits = 10000,
                        PaidCashouts = 5000,
                        TotalGGR = 1000
                    }
                },
                Summary = new DailyActionSummaryDto
                {
                    TotalRegistrations = 100,
                    TotalFTD = 50,
                    TotalDeposits = 10000,
                    TotalCashouts = 5000,
                    TotalGGR = 1000
                },
                TotalCount = 1,
                TotalPages = 1,
                CurrentPage = 1,
                PageSize = 10
            };

            _mockDailyActionsService.Setup(s => s.GetFilteredDailyActionsAsync(It.IsAny<DailyActionFilterDto>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetFilteredDailyActions(filter);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DailyActionResponseDto>(okResult.Value);
            Assert.Equal(1, returnValue.Data.Count);
            Assert.Equal(1, returnValue.TotalCount);
        }

        [Fact]
        public async Task GetDailyActionsMetadata_ReturnsOkResult_WithMetadata()
        {
            // Arrange
            var metadata = new DailyActionMetadataDto
            {
                WhiteLabels = new List<WhiteLabelDto>
                {
                    new WhiteLabelDto { Id = 1, Name = "Test Label" }
                },
                Countries = new List<CountryDto>
                {
                    new CountryDto { Id = 1, Name = "Test Country" }
                },
                GroupByOptions = new List<GroupByOptionDto>
                {
                    new GroupByOptionDto { Id = 1, Name = "Day", Value = "Day" }
                }
            };

            _mockDailyActionsService.Setup(s => s.GetDailyActionsMetadataAsync())
                .ReturnsAsync(metadata);

            // Act
            var result = await _controller.GetDailyActionsMetadata();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DailyActionMetadataDto>(okResult.Value);
            Assert.NotNull(returnValue.WhiteLabels);
            Assert.NotNull(returnValue.Countries);
            Assert.NotNull(returnValue.GroupByOptions);
        }

        [Fact]
        public async Task ExportFilteredDailyActions_ReturnsCsvFile_WhenFormatIsCsv()
        {
            // Arrange
            var filter = new DailyActionFilterDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                WhiteLabelIds = new List<int> { 1 },
                PageNumber = 1,
                PageSize = 10
            };

            var response = new DailyActionResponseDto
            {
                Data = new List<DailyActionDto>
                {
                    new DailyActionDto
                    {
                        Id = 1,
                        Date = DateTime.UtcNow.AddDays(-2),
                        WhiteLabelId = 1,
                        WhiteLabelName = "Test Label",
                        Registrations = 100,
                        FTD = 50,
                        Deposits = 10000,
                        PaidCashouts = 5000,
                        TotalGGR = 1000
                    }
                },
                Summary = new DailyActionSummaryDto
                {
                    TotalRegistrations = 100,
                    TotalFTD = 50,
                    TotalDeposits = 10000,
                    TotalCashouts = 5000,
                    TotalGGR = 1000
                },
                TotalCount = 1,
                TotalPages = 1,
                CurrentPage = 1,
                PageSize = 10
            };

            _mockDailyActionsService.Setup(s => s.GetFilteredDailyActionsAsync(It.IsAny<DailyActionFilterDto>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.ExportFilteredDailyActions(filter, "csv");

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("text/csv", fileResult.ContentType);
            Assert.Contains("daily-actions-report", fileResult.FileDownloadName);
            Assert.EndsWith(".csv", fileResult.FileDownloadName);
        }
    }
}
