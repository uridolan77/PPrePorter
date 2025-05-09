using PPrePorter.Core.Interfaces;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Database
{
    /// <summary>
    /// Mock implementation of IConnectionStringResolverService for development purposes
    /// </summary>
    public class MockConnectionStringResolverService : IConnectionStringResolverService
    {
        public Task<string> ResolveConnectionStringAsync(string connectionString)
        {
            // For development, return a connection string to a local SQL Server or SQLite database
            return Task.FromResult("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=PPrePorterDev;Integrated Security=True;Connect Timeout=30;");
        }

        public void ClearCaches()
        {
            // No caches to clear in this mock implementation
        }
    }
}
