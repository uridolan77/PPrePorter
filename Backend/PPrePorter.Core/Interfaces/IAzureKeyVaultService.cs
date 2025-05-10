using System.Threading.Tasks;

namespace PPrePorter.Core.Interfaces
{
    public interface IAzureKeyVaultService
    {
        Task<string?> GetSecretAsync(string vaultName, string secretName);
    }
}