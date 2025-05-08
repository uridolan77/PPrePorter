namespace PPrePorter.API.Features.Authentication.Services
{
    public interface IJwtService
    {
        string GenerateJwtToken(string userId, string username, string role, IEnumerable<string> permissions);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
        DateTime GetTokenExpirationTime(string token);
    }
}