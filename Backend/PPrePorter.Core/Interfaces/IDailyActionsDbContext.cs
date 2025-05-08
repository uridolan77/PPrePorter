namespace PPrePorter.Core.Interfaces
{
    public interface IDailyActionsDbContext
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}