namespace PPrePorter.Core.Interfaces
{
    public interface IPPRePorterDbContext
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}