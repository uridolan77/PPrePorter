using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Caching
{
    /// <summary>
    /// Mock implementation of ICachingService for development purposes
    /// </summary>
    public class MockCachingService : ICachingService
    {
        private readonly ConcurrentDictionary<string, object> _cache = new ConcurrentDictionary<string, object>();
        private readonly ConcurrentDictionary<string, DateTime> _expirations = new ConcurrentDictionary<string, DateTime>();

        public Task<T> GetAsync<T>(string key)
        {
            // Check if the key exists and hasn't expired
            if (_cache.TryGetValue(key, out var value) &&
                _expirations.TryGetValue(key, out var expiration) &&
                expiration > DateTime.UtcNow)
            {
                return Task.FromResult((T)value);
            }

            return Task.FromResult<T>(default);
        }

        public Task RemoveAsync(string key)
        {
            _cache.TryRemove(key, out _);
            _expirations.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            _cache[key] = value;
            _expirations[key] = DateTime.UtcNow.Add(expiration ?? TimeSpan.FromMinutes(30));
            return Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(string key)
        {
            return Task.FromResult(_cache.ContainsKey(key) &&
                _expirations.TryGetValue(key, out var expiration) &&
                expiration > DateTime.UtcNow);
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, TimeSpan? slidingExpiration = null)
        {
            // Check if the key exists and hasn't expired
            if (await ExistsAsync(key))
            {
                return await GetAsync<T>(key);
            }

            // Create the value
            var value = await factory();

            // Store in cache
            await SetAsync(key, value, expiration);

            return value;
        }
    }
}
