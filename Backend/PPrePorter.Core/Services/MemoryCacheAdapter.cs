using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using PPrePorter.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PPrePorter.Core.Services
{
    /// <summary>
    /// Adapter class that implements IMemoryCache but uses IGlobalCacheService internally
    /// This allows existing code that depends on IMemoryCache to use the GlobalCacheService
    /// </summary>
    public class MemoryCacheAdapter : IMemoryCache
    {
        private readonly IGlobalCacheService _globalCacheService;

        public MemoryCacheAdapter(IGlobalCacheService globalCacheService)
        {
            _globalCacheService = globalCacheService ?? throw new ArgumentNullException(nameof(globalCacheService));
        }

        /// <summary>
        /// Create a cache entry
        /// </summary>
        public ICacheEntry CreateEntry(object key)
        {
            // This is a simplified implementation that doesn't fully support all ICacheEntry features
            return new CacheEntryAdapter(key.ToString(), _globalCacheService);
        }

        /// <summary>
        /// Remove a cache entry
        /// </summary>
        public void Remove(object key)
        {
            _globalCacheService.Remove(key.ToString());
        }

        /// <summary>
        /// Try to get a value from the cache
        /// </summary>
        public bool TryGetValue(object key, out object value)
        {
            // Ensure we have a valid key
            if (key == null)
            {
                value = default!;
                return false;
            }

            // Convert key to string and try to get the value
            string keyString = key.ToString();

            // Forward the call to the global cache service
            if (_globalCacheService.TryGetValue(keyString, out object cachedValue))
            {
                value = cachedValue;
                return true;
            }

            value = default!;
            return false;
        }

        /// <summary>
        /// Dispose the cache
        /// </summary>
        public void Dispose()
        {
            // Nothing to dispose
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Adapter class for ICacheEntry
        /// </summary>
        private class CacheEntryAdapter : ICacheEntry
        {
            private readonly string _key;
            private readonly IGlobalCacheService _globalCacheService;
            private object _value;
            private TimeSpan? _absoluteExpirationRelativeToNow;
            private DateTimeOffset? _absoluteExpiration;
            private TimeSpan? _slidingExpiration;
            private CacheItemPriority _priority = CacheItemPriority.Normal;
            private readonly List<IDisposable> _expirationTokens = new List<IDisposable>();
            private readonly List<PostEvictionCallbackRegistration> _postEvictionCallbacks = new List<PostEvictionCallbackRegistration>();

            public CacheEntryAdapter(string key, IGlobalCacheService globalCacheService)
            {
                _key = key;
                _globalCacheService = globalCacheService;
            }

            public object Key => _key;

            public object? Value
            {
                get => _value;
                set => _value = value;
            }

            public DateTimeOffset? AbsoluteExpiration
            {
                get => _absoluteExpiration;
                set => _absoluteExpiration = value;
            }

            public TimeSpan? AbsoluteExpirationRelativeToNow
            {
                get => _absoluteExpirationRelativeToNow;
                set => _absoluteExpirationRelativeToNow = value;
            }

            public TimeSpan? SlidingExpiration
            {
                get => _slidingExpiration;
                set => _slidingExpiration = value;
            }

            public CacheItemPriority Priority
            {
                get => _priority;
                set => _priority = value;
            }

            public long? Size { get; set; }

            public IList<IChangeToken> ExpirationTokens => _expirationTokens.Cast<IChangeToken>().ToList();

            public IList<PostEvictionCallbackRegistration> PostEvictionCallbacks => _postEvictionCallbacks;

            public void Dispose()
            {
                // When disposed, set the value in the cache
                if (_value != null)
                {
                    var options = new MemoryCacheEntryOptions();

                    if (_absoluteExpiration.HasValue)
                    {
                        options.SetAbsoluteExpiration(_absoluteExpiration.Value);
                    }
                    else if (_absoluteExpirationRelativeToNow.HasValue)
                    {
                        options.SetAbsoluteExpiration(_absoluteExpirationRelativeToNow.Value);
                    }

                    if (_slidingExpiration.HasValue)
                    {
                        options.SetSlidingExpiration(_slidingExpiration.Value);
                    }

                    options.SetPriority(_priority);

                    // Set a default size if not explicitly specified
                    if (Size.HasValue)
                    {
                        options.SetSize(Size.Value);
                    }
                    else
                    {
                        // For DailyAction objects or collections, use a larger size estimate
                        if (_value != null)
                        {
                            var typeName = _value.GetType().Name;
                            if (typeName.Contains("DailyAction"))
                            {
                                // DailyAction objects are large
                                if (_value is System.Collections.ICollection collection)
                                {
                                    // Collection of DailyAction objects
                                    options.SetSize(collection.Count * 1000); // 1000 bytes per DailyAction
                                }
                                else
                                {
                                    // Single DailyAction object
                                    options.SetSize(1000); // 1000 bytes for a single DailyAction
                                }
                            }
                            else
                            {
                                // Estimate size based on object type
                                long estimatedSize = EstimateObjectSize(_value);
                                options.SetSize(estimatedSize);
                            }
                        }
                        else
                        {
                            // Null value
                            options.SetSize(1);
                        }
                    }

                    _globalCacheService.Set(_key, _value, options);
                }

                GC.SuppressFinalize(this);
            }

            /// <summary>
            /// Estimates the size of an object for cache size limits
            /// </summary>
            private long EstimateObjectSize(object obj)
            {
                if (obj == null)
                    return 0;

                // Default minimum size for any object
                long baseSize = 1;

                // For strings, use the string length as an approximation
                if (obj is string str)
                {
                    return Math.Max(baseSize, str.Length * 2); // Unicode chars are 2 bytes
                }

                // For collections, estimate based on count
                if (obj is System.Collections.ICollection collection)
                {
                    return Math.Max(baseSize, collection.Count);
                }

                // For simple value types, use a small fixed size
                if (obj.GetType().IsValueType)
                {
                    return baseSize;
                }

                // For other objects, use a default size of 10
                return 10;
            }
        }
    }
}
