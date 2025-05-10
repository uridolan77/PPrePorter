using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.Infrastructure.Services;
using Xunit;

namespace PPrePorter.Tests.Infrastructure.Services
{
    public class RedisCachingServiceTests
    {
        private readonly Mock<IDistributedCache> _mockDistributedCache;
        private readonly Mock<ILogger<RedisCachingService>> _mockLogger;
        private readonly RedisCachingService _cachingService;

        public RedisCachingServiceTests()
        {
            _mockDistributedCache = new Mock<IDistributedCache>();
            _mockLogger = new Mock<ILogger<RedisCachingService>>();
            _cachingService = new RedisCachingService(_mockDistributedCache.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetOrCreateAsync_CacheHit_ReturnsDeserializedValue()
        {
            // Arrange
            string key = "test-key";
            string cachedValue = JsonSerializer.Serialize("cached-value");
            
            _mockDistributedCache
                .Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
                .ReturnsAsync(cachedValue);

            // Act
            var result = await _cachingService.GetOrCreateAsync<string>(
                key,
                () => Task.FromResult("factory-value"),
                slidingExpiration: TimeSpan.FromMinutes(5),
                absoluteExpiration: TimeSpan.FromHours(1));

            // Assert
            Assert.Equal("cached-value", result);
            _mockDistributedCache.Verify(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()), Times.Once);
            _mockDistributedCache.Verify(x => x.SetStringAsync(
                It.IsAny<string>(), 
                It.IsAny<string>(), 
                It.IsAny<DistributedCacheEntryOptions>(), 
                It.IsAny<CancellationToken>()), 
                Times.Never);
        }

        [Fact]
        public async Task GetOrCreateAsync_CacheMiss_CallsFactoryAndCachesResult()
        {
            // Arrange
            string key = "test-key";
            string factoryValue = "factory-value";
            
            _mockDistributedCache
                .Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
                .ReturnsAsync((string)null);

            // Act
            var result = await _cachingService.GetOrCreateAsync<string>(
                key,
                () => Task.FromResult(factoryValue),
                slidingExpiration: TimeSpan.FromMinutes(5),
                absoluteExpiration: TimeSpan.FromHours(1));

            // Assert
            Assert.Equal(factoryValue, result);
            _mockDistributedCache.Verify(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()), Times.Once);
            _mockDistributedCache.Verify(x => x.SetStringAsync(
                key, 
                It.IsAny<string>(), 
                It.IsAny<DistributedCacheEntryOptions>(), 
                It.IsAny<CancellationToken>()), 
                Times.Once);
        }

        [Fact]
        public async Task GetOrCreateAsync_DeserializationError_CallsFactoryAndCachesResult()
        {
            // Arrange
            string key = "test-key";
            string invalidJson = "invalid-json";
            string factoryValue = "factory-value";
            
            _mockDistributedCache
                .Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
                .ReturnsAsync(invalidJson);

            // Act
            var result = await _cachingService.GetOrCreateAsync<string>(
                key,
                () => Task.FromResult(factoryValue),
                slidingExpiration: TimeSpan.FromMinutes(5),
                absoluteExpiration: TimeSpan.FromHours(1));

            // Assert
            Assert.Equal(factoryValue, result);
            _mockDistributedCache.Verify(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()), Times.Once);
            _mockDistributedCache.Verify(x => x.SetStringAsync(
                key, 
                It.IsAny<string>(), 
                It.IsAny<DistributedCacheEntryOptions>(), 
                It.IsAny<CancellationToken>()), 
                Times.Once);
        }

        [Fact]
        public async Task RemoveAsync_CallsDistributedCacheRemove()
        {
            // Arrange
            string key = "test-key";
            
            // Act
            await _cachingService.RemoveAsync(key);

            // Assert
            _mockDistributedCache.Verify(x => x.RemoveAsync(key, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_KeyExists_ReturnsTrue()
        {
            // Arrange
            string key = "test-key";
            
            _mockDistributedCache
                .Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new byte[] { 1, 2, 3 });

            // Act
            var result = await _cachingService.ExistsAsync(key);

            // Assert
            Assert.True(result);
            _mockDistributedCache.Verify(x => x.GetAsync(key, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_KeyDoesNotExist_ReturnsFalse()
        {
            // Arrange
            string key = "test-key";
            
            _mockDistributedCache
                .Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
                .ReturnsAsync((byte[])null);

            // Act
            var result = await _cachingService.ExistsAsync(key);

            // Assert
            Assert.False(result);
            _mockDistributedCache.Verify(x => x.GetAsync(key, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
