using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    public interface IUserContextService
    {
        Task<UserContext> GetCurrentUserAsync();
    }

    public class UserContext
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}