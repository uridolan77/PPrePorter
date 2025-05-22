$interfaces = @(
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameCasinoSessionRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for GameCasinoSession entities
    /// </summary>
    public interface IGameCasinoSessionRepository : IBaseRepository<GameCasinoSession>
    {
        /// <summary>
        /// Gets game casino session by session ID
        /// </summary>
        Task<GameCasinoSession> GetBySessionIdAsync(string sessionId);

        /// <summary>
        /// Gets game casino sessions by player ID
        /// </summary>
        Task<IEnumerable<GameCasinoSession>> GetByPlayerIdAsync(string playerId);

        /// <summary>
        /// Gets game casino sessions by game ID
        /// </summary>
        Task<IEnumerable<GameCasinoSession>> GetByGameIdAsync(string gameId);
    }
}"
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameDescriptionRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for GameDescription entities
    /// </summary>
    public interface IGameDescriptionRepository : IBaseRepository<GameDescription>
    {
        /// <summary>
        /// Gets game descriptions by game ID
        /// </summary>
        Task<IEnumerable<GameDescription>> GetByGameIdAsync(int gameId);

        /// <summary>
        /// Gets game descriptions by language code
        /// </summary>
        Task<IEnumerable<GameDescription>> GetByLanguageCodeAsync(string languageCode);

        /// <summary>
        /// Gets game description by game ID and language code
        /// </summary>
        Task<GameDescription> GetByGameIdAndLanguageCodeAsync(int gameId, string languageCode);
    }
}"
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameExcludedByCountryRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for GameExcludedByCountry entities
    /// </summary>
    public interface IGameExcludedByCountryRepository : IBaseRepository<GameExcludedByCountry>
    {
        /// <summary>
        /// Gets game excluded by countries by game ID
        /// </summary>
        Task<IEnumerable<GameExcludedByCountry>> GetByGameIdAsync(int gameId);

        /// <summary>
        /// Gets game excluded by countries by country ID
        /// </summary>
        Task<IEnumerable<GameExcludedByCountry>> GetByCountryIdAsync(int countryId);

        /// <summary>
        /// Gets game excluded by country by game ID and country ID
        /// </summary>
        Task<GameExcludedByCountry> GetByGameIdAndCountryIdAsync(int gameId, int countryId);

        /// <summary>
        /// Checks if a game is excluded for a country
        /// </summary>
        Task<bool> IsGameExcludedForCountryAsync(int gameId, int countryId);
    }
}"
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameExcludedByJurisdictionRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for GameExcludedByJurisdiction entities
    /// </summary>
    public interface IGameExcludedByJurisdictionRepository : IBaseRepository<GameExcludedByJurisdiction>
    {
        /// <summary>
        /// Gets game excluded by jurisdictions by game ID
        /// </summary>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetByGameIdAsync(int gameId);

        /// <summary>
        /// Gets game excluded by jurisdictions by jurisdiction code
        /// </summary>
        Task<IEnumerable<GameExcludedByJurisdiction>> GetByJurisdictionCodeAsync(string jurisdictionCode);

        /// <summary>
        /// Gets game excluded by jurisdiction by game ID and jurisdiction code
        /// </summary>
        Task<GameExcludedByJurisdiction> GetByGameIdAndJurisdictionCodeAsync(int gameId, string jurisdictionCode);

        /// <summary>
        /// Checks if a game is excluded for a jurisdiction
        /// </summary>
        Task<bool> IsGameExcludedForJurisdictionAsync(int gameId, string jurisdictionCode);
    }
}"
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for Game entities
    /// </summary>
    public interface IGameRepository : IBaseRepository<Game>
    {
        /// <summary>
        /// Gets game by game ID
        /// </summary>
        Task<Game> GetByGameIdAsync(string gameId);

        /// <summary>
        /// Gets games by provider
        /// </summary>
        Task<IEnumerable<Game>> GetByProviderAsync(string provider);

        /// <summary>
        /// Gets games by active status
        /// </summary>
        Task<IEnumerable<Game>> GetByActiveStatusAsync(bool isActive);
    }
}"
    }
)

foreach ($interface in $interfaces) {
    Write-Host "Creating interface: $($interface.Path)"
    
    # Create the directory if it doesn't exist
    $directory = [System.IO.Path]::GetDirectoryName($interface.Path)
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Create the file
    Set-Content -Path $interface.Path -Value $interface.Content -Force
}

Write-Host "Interface creation complete!"
