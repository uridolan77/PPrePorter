using System.Threading;
using System.Threading.Tasks;

namespace CachingService.Core.Interfaces
{
    /// <summary>
    /// Interface for cache warmer providers that populate the cache
    /// </summary>
    public interface ICacheWarmerProvider
    {
        /// <summary>
        /// Warms up the cache with initial data
        /// </summary>
        /// <param name="cacheManager">Cache manager to use</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items added to the cache</returns>
        Task<int> WarmupAsync(ICacheManager cacheManager, CancellationToken cancellationToken);
        
        /// <summary>
        /// Refreshes items already in the cache
        /// </summary>
        /// <param name="cacheManager">Cache manager to use</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items refreshed in the cache</returns>
        Task<int> RefreshAsync(ICacheManager cacheManager, CancellationToken cancellationToken);
    }
}
