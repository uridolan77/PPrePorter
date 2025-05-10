using System;
using System.Threading.Tasks;
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
        private readonly Mock<ILogger<ConnectionStringResolverService>> _mockLogger;
        private readonly ConnectionStringResolverService _service;

        public ConnectionStringResolverServiceTests()
        {
            _mockKeyVaultService = new Mock<IAzureKeyVaultService>();
            _mockLogger = new Mock<ILogger<ConnectionStringResolverService>>();
            _service = new ConnectionStringResolverService(_mockKeyVaultService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithNoPlaceholders_ReturnsOriginalString()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id=sa;Password=Password123;";

            // Act
            var result = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal(connectionString, result);
            _mockKeyVaultService.Verify(x => x.GetSecretAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithPlaceholders_ResolvesPlaceholders()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password={azurevault:vault:password};";
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "username"))
                .ReturnsAsync("testuser");
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "password"))
                .ReturnsAsync("testpassword");

            // Act
            var result = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal("Server=localhost;Database=TestDB;User Id=testuser;Password=testpassword;", result);
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "username"), Times.Once);
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "password"), Times.Once);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithCaching_UsesCachedValues()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password={azurevault:vault:password};";
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "username"))
                .ReturnsAsync("testuser");
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "password"))
                .ReturnsAsync("testpassword");

            // Act - Call twice to test caching
            var result1 = await _service.ResolveConnectionStringAsync(connectionString);
            var result2 = await _service.ResolveConnectionStringAsync(connectionString);

            // Assert
            Assert.Equal("Server=localhost;Database=TestDB;User Id=testuser;Password=testpassword;", result1);
            Assert.Equal("Server=localhost;Database=TestDB;User Id=testuser;Password=testpassword;", result2);
            
            // Verify that GetSecretAsync was called only once for each secret
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "username"), Times.Once);
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "password"), Times.Once);
        }

        [Fact]
        public async Task ResolveConnectionStringAsync_WithKeyVaultError_ThrowsException()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password=Password123;";
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "username"))
                .ThrowsAsync(new Exception("Key Vault error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _service.ResolveConnectionStringAsync(connectionString));
        }

        [Fact]
        public void ClearCaches_ClearsAllCaches()
        {
            // Arrange
            var connectionString = "Server=localhost;Database=TestDB;User Id={azurevault:vault:username};Password={azurevault:vault:password};";
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "username"))
                .ReturnsAsync("testuser");
            
            _mockKeyVaultService
                .Setup(x => x.GetSecretAsync("vault", "password"))
                .ReturnsAsync("testpassword");

            // Act - Call once to populate cache, then clear it
            var _ = _service.ResolveConnectionStringAsync(connectionString).Result;
            _service.ClearCaches();
            var result = _service.ResolveConnectionStringAsync(connectionString).Result;

            // Assert - Verify that GetSecretAsync was called twice for each secret
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "username"), Times.Exactly(2));
            _mockKeyVaultService.Verify(x => x.GetSecretAsync("vault", "password"), Times.Exactly(2));
        }
    }
}
