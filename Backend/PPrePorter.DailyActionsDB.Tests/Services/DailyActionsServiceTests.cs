using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.DailyActionsDB.Data;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models;
using PPrePorter.DailyActionsDB.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PPrePorter.DailyActionsDB.Tests.Services
{
    public class DailyActionsServiceTests
    {
        private readonly Mock<ILogger<DailyActionsService>> _mockLogger;
        private readonly Mock<IWhiteLabelService> _mockWhiteLabelService;
        private readonly Mock<IMemoryCache> _mockMemoryCache;
        private readonly DbContextOptions<DailyActionsDbContext> _dbContextOptions;

        public DailyActionsServiceTests()
        {
            _mockLogger = new Mock<ILogger<DailyActionsService>>();
            _mockWhiteLabelService = new Mock<IWhiteLabelService>();
            _mockMemoryCache = new Mock<IMemoryCache>();
            
            // Set up in-memory database
            _dbContextOptions = new DbContextOptionsBuilder<DailyActionsDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            // Set up white label service
            _mockWhiteLabelService.Setup(s => s.GetAllWhiteLabelsAsync(It.IsAny<bool>()))
                .ReturnsAsync(new List<WhiteLabel>
                {
                    new WhiteLabel { Id = 1, Name = "Test Label 1" },
                    new WhiteLabel { Id = 2, Name = "Test Label 2" }
                });
        }

        private DailyActionsDbContext CreateDbContext()
        {
            var context = new DailyActionsDbContext(_dbContextOptions);
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
            return context;
        }

        private void SeedDatabase(DailyActionsDbContext context)
        {
            // Add daily actions
            context.DailyActions.AddRange(
                new DailyAction
                {
                    Id = 1,
                    Date = DateTime.UtcNow.AddDays(-2),
                    WhiteLabelID = 1,
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
                    WhiteLabelID = 2,
                    Registration = 150,
                    FTD = 75,
                    Deposits = 15000,
                    PaidCashouts = 7500,
                    BetsCasino = 12000,
                    WinsCasino = 10000,
                    GGRCasino = 2000,
                    TotalGGR = 2000
                }
            );

            // Add countries
            context.Countries.AddRange(
                new Country { CountryID = 1, CountryName = "Country 1", IsoCode = "C1", IsActive = true },
                new Country { CountryID = 2, CountryName = "Country 2", IsoCode = "C2", IsActive = true }
            );

            // Add currencies
            context.Currencies.AddRange(
                new Currency { CurrencyID = 1, CurrencyName = "Currency 1", CurrencyCode = "CUR1", CurrencySymbol = "$" },
                new Currency { CurrencyID = 2, CurrencyName = "Currency 2", CurrencyCode = "CUR2", CurrencySymbol = "€" }
            );

            // Add players
            context.Players.AddRange(
                new Player
                {
                    PlayerID = 1,
                    WhiteLabelID = 1,
                    Language = "English",
                    RegisteredPlatform = "Web",
                    Gender = "Male",
                    Status = "Active",
                    RegistrationPlayMode = "Real",
                    AffiliateID = "Tracker1"
                },
                new Player
                {
                    PlayerID = 2,
                    WhiteLabelID = 2,
                    Language = "Spanish",
                    RegisteredPlatform = "Mobile",
                    Gender = "Female",
                    Status = "Inactive",
                    RegistrationPlayMode = "Fun",
                    AffiliateID = "Tracker2"
                }
            );

            context.SaveChanges();
        }

        [Fact]
        public async Task GetDailyActionsAsync_ReturnsAllDailyActions_WhenNoFiltersApplied()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);
            var startDate = DateTime.UtcNow.AddDays(-3);
            var endDate = DateTime.UtcNow;

            // Act
            var result = await service.GetDailyActionsAsync(startDate, endDate);

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetDailyActionsAsync_ReturnsFilteredDailyActions_WhenWhiteLabelIdProvided()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);
            var startDate = DateTime.UtcNow.AddDays(-3);
            var endDate = DateTime.UtcNow;
            var whiteLabelId = 1;

            // Act
            var result = await service.GetDailyActionsAsync(startDate, endDate, whiteLabelId);

            // Assert
            Assert.Single(result);
            Assert.Equal(whiteLabelId, result.First().WhiteLabelID);
        }

        [Fact]
        public async Task GetDailyActionByIdAsync_ReturnsDailyAction_WhenIdExists()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);
            var id = 1;

            // Act
            var result = await service.GetDailyActionByIdAsync(id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(id, result.Id);
        }

        [Fact]
        public async Task GetDailyActionByIdAsync_ReturnsNull_WhenIdDoesNotExist()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);
            var id = 999;

            // Act
            var result = await service.GetDailyActionByIdAsync(id);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetSummaryMetricsAsync_ReturnsSummary_ForAllDailyActions()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);
            var startDate = DateTime.UtcNow.AddDays(-3);
            var endDate = DateTime.UtcNow;

            // Act
            var result = await service.GetSummaryMetricsAsync(startDate, endDate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(250, result.TotalRegistrations);
            Assert.Equal(125, result.TotalFTD);
            Assert.Equal(25000, result.TotalDeposits);
            Assert.Equal(12500, result.TotalCashouts);
            Assert.Equal(3000, result.TotalGGR);
        }

        [Fact]
        public async Task GetDailyActionsMetadataAsync_ReturnsMetadata_FromCache_WhenAvailable()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            
            var metadata = new DailyActionMetadataDto
            {
                WhiteLabels = new List<WhiteLabelDto>
                {
                    new WhiteLabelDto { Id = 1, Name = "Cached Label" }
                }
            };
            
            // Set up cache to return metadata
            var cacheEntry = Mock.Of<ICacheEntry>();
            _mockMemoryCache.Setup(m => m.CreateEntry(It.IsAny<object>()))
                .Returns(cacheEntry);
            _mockMemoryCache.Setup(m => m.TryGetValue(It.IsAny<string>(), out metadata))
                .Returns(true);
            
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);

            // Act
            var result = await service.GetDailyActionsMetadataAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Cached Label", result.WhiteLabels.First().Name);
            
            // Verify that the service didn't call the white label service
            _mockWhiteLabelService.Verify(s => s.GetAllWhiteLabelsAsync(It.IsAny<bool>()), Times.Never);
        }

        [Fact]
        public async Task GetDailyActionsMetadataAsync_ReturnsMetadata_FromDatabase_WhenNotInCache()
        {
            // Arrange
            using var context = CreateDbContext();
            SeedDatabase(context);
            
            // Set up cache to not return metadata
            object metadata = null;
            _mockMemoryCache.Setup(m => m.TryGetValue(It.IsAny<string>(), out metadata))
                .Returns(false);
            
            var cacheEntry = Mock.Of<ICacheEntry>();
            _mockMemoryCache.Setup(m => m.CreateEntry(It.IsAny<object>()))
                .Returns(cacheEntry);
            
            var service = new DailyActionsService(context, _mockWhiteLabelService.Object, _mockLogger.Object, _mockMemoryCache.Object);

            // Act
            var result = await service.GetDailyActionsMetadataAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.WhiteLabels.Count);
            Assert.Equal(2, result.Countries.Count);
            Assert.Equal(2, result.Currencies.Count);
            Assert.Equal(2, result.Languages.Count);
            Assert.Equal(2, result.Platforms.Count);
            Assert.Equal(2, result.Genders.Count);
            Assert.Equal(2, result.Statuses.Count);
            Assert.Equal(2, result.RegistrationPlayModes.Count);
            Assert.Equal(2, result.Trackers.Count);
            
            // Verify that the service called the white label service
            _mockWhiteLabelService.Verify(s => s.GetAllWhiteLabelsAsync(It.IsAny<bool>()), Times.Once);
        }
    }
}
