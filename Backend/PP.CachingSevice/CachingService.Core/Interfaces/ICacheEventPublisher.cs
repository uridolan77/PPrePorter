using System;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Events;

namespace CachingService.Core.Interfaces
{
    /// <summary>
    /// Interface for publishing cache events
    /// </summary>
    public interface ICacheEventPublisher
    {
        /// <summary>
        /// Publishes a cache event
        /// </summary>
        /// <param name="cacheEvent">The event to publish</param>
        void Publish(CacheEvent cacheEvent);
        
        /// <summary>
        /// Publishes a cache event asynchronously
        /// </summary>
        /// <param name="cacheEvent">The event to publish</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A task representing the asynchronous operation</returns>
        Task PublishAsync(CacheEvent cacheEvent, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Subscribes to cache events
        /// </summary>
        /// <typeparam name="T">Type of event to subscribe to</typeparam>
        /// <param name="handler">Event handler</param>
        /// <returns>A subscription that can be disposed to unsubscribe</returns>
        IDisposable Subscribe<T>(Action<T> handler) where T : CacheEvent;
    }
}
