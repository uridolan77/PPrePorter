# Script to fix remaining issues

# Define the files to recreate
$filesToRecreate = @(
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Games\IGameExcludedByLabelRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Games;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Games
{
    /// <summary>
    /// Repository interface for GameExcludedByLabel entities
    /// </summary>
    public interface IGameExcludedByLabelRepository : IBaseRepository<GameExcludedByLabel>
    {
        /// <summary>
        /// Gets game excluded by labels by game ID
        /// </summary>
        Task<IEnumerable<GameExcludedByLabel>> GetByGameIdAsync(int gameId);

        /// <summary>
        /// Gets game excluded by labels by white label ID
        /// </summary>
        Task<IEnumerable<GameExcludedByLabel>> GetByWhiteLabelIdAsync(int whiteLabelId);

        /// <summary>
        /// Gets game excluded by label by game ID and white label ID
        /// </summary>
        Task<GameExcludedByLabel> GetByGameIdAndWhiteLabelIdAsync(int gameId, int whiteLabelId);

        /// <summary>
        /// Checks if a game is excluded for a white label
        /// </summary>
        Task<bool> IsGameExcludedForWhiteLabelAsync(int gameId, int whiteLabelId);
    }
}"@
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Metadata\ICurrencyRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Metadata
{
    /// <summary>
    /// Repository interface for Currency entities
    /// </summary>
    public interface ICurrencyRepository : INamedEntityRepository<Currency>
    {
        /// <summary>
        /// Gets currency by code
        /// </summary>
        Task<Currency> GetByCodeAsync(string code);

        /// <summary>
        /// Gets all active currencies
        /// </summary>
        Task<IEnumerable<Currency>> GetAllActiveAsync();

        /// <summary>
        /// Gets currency by ID
        /// </summary>
        Task<Currency> GetByIdAsync(int id);

        /// <summary>
        /// Gets currency by name
        /// </summary>
        Task<Currency> GetByNameAsync(string name);
    }
}"@
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Sports\ISportCompetitionRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Sports;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Sports
{
    /// <summary>
    /// Repository interface for SportCompetition entities
    /// </summary>
    public interface ISportCompetitionRepository : INamedEntityRepository<SportCompetition>
    {
        /// <summary>
        /// Gets sport competition by code
        /// </summary>
        Task<SportCompetition> GetByCodeAsync(string code);

        /// <summary>
        /// Gets sport competition by name
        /// </summary>
        Task<SportCompetition> GetByNameAsync(string name);

        /// <summary>
        /// Gets sport competitions by sport ID
        /// </summary>
        Task<IEnumerable<SportCompetition>> GetBySportIdAsync(int sportId);

        /// <summary>
        /// Gets sport competitions by region ID
        /// </summary>
        Task<IEnumerable<SportCompetition>> GetByRegionIdAsync(int regionId);

        /// <summary>
        /// Gets sport competitions by sport ID and region ID
        /// </summary>
        Task<IEnumerable<SportCompetition>> GetBySportIdAndRegionIdAsync(int sportId, int regionId);
    }
}"@
    },
    @{
        Path = "Backend\PP.DailyActionsDBService\Repositories\Sports\ISportMatchRepository.cs"
        Content = @"using PP.DailyActionsDBService.Models.Sports;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.Sports
{
    /// <summary>
    /// Repository interface for SportMatch entities
    /// </summary>
    public interface ISportMatchRepository : IBaseRepository<SportMatch>
    {
        /// <summary>
        /// Gets sport match by match ID
        /// </summary>
        Task<SportMatch> GetByMatchIdAsync(string matchId);

        /// <summary>
        /// Gets sport matches by competition ID
        /// </summary>
        Task<IEnumerable<SportMatch>> GetByCompetitionIdAsync(int competitionId);

        /// <summary>
        /// Gets sport matches by date range
        /// </summary>
        Task<IEnumerable<SportMatch>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets sport matches by competition ID and date range
        /// </summary>
        Task<IEnumerable<SportMatch>> GetByCompetitionIdAndDateRangeAsync(int competitionId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets upcoming sport matches
        /// </summary>
        Task<IEnumerable<SportMatch>> GetUpcomingMatchesAsync(int limit = 100);

        /// <summary>
        /// Gets live sport matches
        /// </summary>
        Task<IEnumerable<SportMatch>> GetLiveMatchesAsync();
    }
}"@
    }
)

# Process each file
foreach ($file in $filesToRecreate) {
    Write-Host "Processing file: $($file.Path)"
    
    # Try to delete the file if it exists
    if (Test-Path $file.Path) {
        try {
            Remove-Item -Path $file.Path -Force
            Write-Host "  Deleted existing file"
        }
        catch {
            Write-Host "  Failed to delete file: $_"
        }
    }
    
    # Create the directory if it doesn't exist
    $directory = [System.IO.Path]::GetDirectoryName($file.Path)
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Create the file
    try {
        Set-Content -Path $file.Path -Value $file.Content
        Write-Host "  Created file"
    }
    catch {
        Write-Host "  Failed to create file: $_"
    }
}

Write-Host "File recreation complete!"
