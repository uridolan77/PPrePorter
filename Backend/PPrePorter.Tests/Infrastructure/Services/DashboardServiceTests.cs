using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Infrastructure.Services;
using Xunit;

namespace PPrePorter.Tests.Infrastructure.Services
{
    public class DashboardServiceTests
    {
        private readonly Mock<ICachingService> _mockCachingService;
        private readonly Mock<ILogger<DashboardService>> _mockLogger;
        private readonly DashboardService _dashboardService;

        public DashboardServiceTests()
        {
            _mockCachingService = new Mock<ICachingService>();
            _mockLogger = new Mock<ILogger<DashboardService>>();
            _dashboardService = new DashboardService(_mockCachingService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetDashboardSummaryAsync_UsesCaching()
        {
            // Arrange
            var request = new DashboardRequest
            {
                UserId = "123",
                WhiteLabelId = 1,
                PlayMode = "real"
            };

            var expectedSummary = new DashboardSummary
            {
                TotalRevenue = 1000,
                TotalPlayers = 500,
                ActivePlayers = 300,
                NewPlayers = 50
            };

            _mockCachingService
                .Setup(x => x.GetOrCreateAsync(
                    It.IsAny<string>(),
                    It.IsAny<Func<Task<DashboardSummary>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()))
                .ReturnsAsync(expectedSummary);

            // Act
            var result = await _dashboardService.GetDashboardSummaryAsync(request);

            // Assert
            Assert.Equal(expectedSummary, result);
            _mockCachingService.Verify(
                x => x.GetOrCreateAsync(
                    It.Is<string>(s => s.Contains(request.UserId) && s.Contains(request.WhiteLabelId.ToString()) && s.Contains(request.PlayMode)),
                    It.IsAny<Func<Task<DashboardSummary>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()),
                Times.Once);
        }

        [Fact]
        public async Task GetCasinoRevenueChartDataAsync_UsesCaching()
        {
            // Arrange
            var request = new DashboardRequest
            {
                UserId = "123",
                WhiteLabelId = 1,
                PlayMode = "real"
            };

            var expectedData = new List<CasinoRevenueItem>
            {
                new CasinoRevenueItem { Date = DateTime.Today.AddDays(-2), Revenue = 100 },
                new CasinoRevenueItem { Date = DateTime.Today.AddDays(-1), Revenue = 200 },
                new CasinoRevenueItem { Date = DateTime.Today, Revenue = 300 }
            };

            _mockCachingService
                .Setup(x => x.GetOrCreateAsync(
                    It.IsAny<string>(),
                    It.IsAny<Func<Task<List<CasinoRevenueItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _dashboardService.GetCasinoRevenueChartDataAsync(request);

            // Assert
            Assert.Equal(expectedData, result);
            _mockCachingService.Verify(
                x => x.GetOrCreateAsync(
                    It.Is<string>(s => s.Contains(request.UserId) && s.Contains(request.WhiteLabelId.ToString()) && s.Contains(request.PlayMode)),
                    It.IsAny<Func<Task<List<CasinoRevenueItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()),
                Times.Once);
        }

        [Fact]
        public async Task GetPlayerRegistrationsChartDataAsync_UsesCaching()
        {
            // Arrange
            var request = new DashboardRequest
            {
                UserId = "123",
                WhiteLabelId = 1,
                PlayMode = "real"
            };

            var expectedData = new List<PlayerRegistrationItem>
            {
                new PlayerRegistrationItem { Date = DateTime.Today.AddDays(-2), Registrations = 10 },
                new PlayerRegistrationItem { Date = DateTime.Today.AddDays(-1), Registrations = 20 },
                new PlayerRegistrationItem { Date = DateTime.Today, Registrations = 30 }
            };

            _mockCachingService
                .Setup(x => x.GetOrCreateAsync(
                    It.IsAny<string>(),
                    It.IsAny<Func<Task<List<PlayerRegistrationItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _dashboardService.GetPlayerRegistrationsChartDataAsync(request);

            // Assert
            Assert.Equal(expectedData, result);
            _mockCachingService.Verify(
                x => x.GetOrCreateAsync(
                    It.Is<string>(s => s.Contains(request.UserId) && s.Contains(request.WhiteLabelId.ToString()) && s.Contains(request.PlayMode)),
                    It.IsAny<Func<Task<List<PlayerRegistrationItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()),
                Times.Once);
        }

        [Fact]
        public async Task GetTopGamesDataAsync_UsesCaching()
        {
            // Arrange
            var request = new DashboardRequest
            {
                UserId = "123",
                WhiteLabelId = 1,
                PlayMode = "real"
            };

            var expectedData = new List<TopGameItem>
            {
                new TopGameItem { GameId = 1, GameName = "Game 1", Revenue = 1000, Players = 100 },
                new TopGameItem { GameId = 2, GameName = "Game 2", Revenue = 800, Players = 80 },
                new TopGameItem { GameId = 3, GameName = "Game 3", Revenue = 600, Players = 60 }
            };

            _mockCachingService
                .Setup(x => x.GetOrCreateAsync(
                    It.IsAny<string>(),
                    It.IsAny<Func<Task<List<TopGameItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()))
                .ReturnsAsync(expectedData);

            // Act
            var result = await _dashboardService.GetTopGamesDataAsync(request);

            // Assert
            Assert.Equal(expectedData, result);
            _mockCachingService.Verify(
                x => x.GetOrCreateAsync(
                    It.Is<string>(s => s.Contains(request.UserId) && s.Contains(request.WhiteLabelId.ToString()) && s.Contains(request.PlayMode)),
                    It.IsAny<Func<Task<List<TopGameItem>>>>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<TimeSpan?>()),
                Times.Once);
        }
    }
}
