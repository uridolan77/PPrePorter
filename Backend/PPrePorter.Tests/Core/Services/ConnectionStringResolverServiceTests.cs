using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Services;
using Xunit;

namespace PPrePorter.Tests.Core.Services
{
    public class ConnectionStringResolverServiceTests
    {
        private readonly Mock<IAzureKeyVaultService> _mockKeyVaultService;
        private readonly Mock<IConnectionStringCacheService> _mockCacheService;
        private readonly Mock<ILogger<ConnectionStringResolverService>> _mockLogger;
        private readonly ConnectionStringResolverService _service;

        public ConnectionStringResolverServiceTests()
        {
            _mockKeyVaultService = new Mock<IAzureKeyVaultService>();
            _mockCacheService = new Mock<IConnectionStringCacheService>();
            _mockLogger = new Mock<ILogger<ConnectionStringResolverService>>();
            _service = new ConnectionStringResolverService(_mockCacheService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithNoPlaceholders_ReturnsOriginalString()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id=sa;Password=Password123;";

            _mockCacheService
                .Setup(x => x.ResolveConnectionStringAsync(connectionString))
                .ReturnsAsync(connectionString);

            // Act
            var result = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal(connectionString, result);
            _mockCacheService.Verify(x => x.ResolveConnectionStringAsync(connectionString), Times.Once);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithPlaceholders_ResolvesPlaceholders()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password={azurevault:vault:password};";
            var resolvedConnectionString = "Server=localhost;Database=TestDB;User Id=testuser;Password=testpassword;";

            _mockCacheService
                .Setup(x => x.ResolveConnectionStringAsync(connectionString))
                .ReturnsAsync(resolvedConnectionString);

            // Act
            var result = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal(resolvedConnectionString, result);
            _mockCacheService.Verify(x => x.ResolveConnectionStringAsync(connectionString), Times.Once);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithCaching_UsesCachedValues()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password={azurevault:vault:password};";
            var resolvedConnectionString = "Server=localhost;Database=TestDB;User Id=testuser;Password=testpassword;";

            _mockCacheService
                .Setup(x => x.ResolveConnectionStringAsync(connectionString))
                .ReturnsAsync(resolvedConnectionString);

            // Act - Call twice to test caching
            var result1 = await _service.ResolveConnectionStringAsync(connectionString);
            var result2 = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal(resolvedConnectionString, result1);
            Assert.Equal(resolvedConnectionString, result2);

            // Verify that ResolveConnectionStringAsync was called twice
            _mockCacheService.Verify(x => x.ResolveConnectionStringAsync(connectionString), Times.Exactly(2));
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithCacheError_ThrowsException()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password=Password123;";

            _mockCacheService
                .Setup(x => x.ResolveConnectionStringAsync(connectionString))
                .ThrowsAsync(new Exception("Cache error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _service.ResolveConnectionStringAsync(connectionString));
        }

        [Fact]
        public void ClearCaches_LogsMessage()
        {
            // Act
            _service.ClearCaches();

            // Assert - Verify that the logger was called
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Connection string resolver caches cleared")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }
    }
}
