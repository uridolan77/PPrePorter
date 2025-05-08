using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    public interface IDataFilterService
    {
        Task<List<int>> GetAccessibleWhiteLabelIdsAsync(string userId);
    }
}