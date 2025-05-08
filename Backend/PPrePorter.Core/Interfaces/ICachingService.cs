using System;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    public interface ICachingService
    {
        Task<T> GetOrCreateAsync<T>(
            string key, 
            Func<Task<T>> factory, 
            TimeSpan? slidingExpiration = null, 
            TimeSpan? absoluteExpiration = null);
        
        Task RemoveAsync(string key);
        Task<bool> ExistsAsync(string key);
    }
}