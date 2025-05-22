# Script to create all missing repository interface files

# Define the interface templates
$baseInterfaceTemplate = @"
using PP.DailyActionsDBService.Models.{0};
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PP.DailyActionsDBService.Repositories.{1}
{
    /// <summary>
    /// Repository interface for {2} entities
    /// </summary>
    public interface I{2}Repository : IBaseRepository<{2}>
    {
        // Add specific methods here if needed
    }
}
"@

# Define the interfaces to create
$interfaces = @(
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportBetType"},
    @{ModelNamespace = "Metadata"; RepoNamespace = "Metadata"; EntityName = "WhiteLabel"},
    @{ModelNamespace = "Transactions"; RepoNamespace = "Transactions"; EntityName = "Transaction"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportSport"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportRegion"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportOddsType"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportMatch"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportMarket"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportCompetition"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportBetState"},
    @{ModelNamespace = "Sports"; RepoNamespace = "Sports"; EntityName = "SportBetEnhanced"},
    @{ModelNamespace = "Players"; RepoNamespace = "Players"; EntityName = "Player"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "Game"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "GameExcludedByLabel"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "GameExcludedByJurisdiction"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "GameExcludedByCountry"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "GameDescription"},
    @{ModelNamespace = "Games"; RepoNamespace = "Games"; EntityName = "GameCasinoSession"},
    @{ModelNamespace = "Metadata"; RepoNamespace = "Metadata"; EntityName = "Currency"},
    @{ModelNamespace = "Metadata"; RepoNamespace = "Metadata"; EntityName = "CurrencyHistory"},
    @{ModelNamespace = "Metadata"; RepoNamespace = "Metadata"; EntityName = "Country"},
    @{ModelNamespace = "Transactions"; RepoNamespace = "Transactions"; EntityName = "Bonus"},
    @{ModelNamespace = "Transactions"; RepoNamespace = "Transactions"; EntityName = "BonusBalance"}
)

# Create each interface file
foreach ($interface in $interfaces) {
    $filePath = "Backend\PP.DailyActionsDBService\Repositories\$($interface.RepoNamespace)\I$($interface.EntityName)Repository.cs"
    
    # Check if file already exists
    if (Test-Path $filePath) {
        Write-Host "File already exists: $filePath"
        continue
    }
    
    # Create the interface content
    $content = $baseInterfaceTemplate -f $interface.ModelNamespace, $interface.RepoNamespace, $interface.EntityName
    
    # Create the directory if it doesn't exist
    $directory = [System.IO.Path]::GetDirectoryName($filePath)
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Write the interface file
    Set-Content -Path $filePath -Value $content
    
    Write-Host "Created interface file: $filePath"
}

Write-Host "Interface creation complete!"
