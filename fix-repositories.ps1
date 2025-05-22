# Script to fix all repository implementations

# Define the repository folders to process
$repositoryFolders = @(
    "Backend\PP.DailyActionsDBService\Repositories\DailyActions",
    "Backend\PP.DailyActionsDBService\Repositories\Games",
    "Backend\PP.DailyActionsDBService\Repositories\Metadata",
    "Backend\PP.DailyActionsDBService\Repositories\Players",
    "Backend\PP.DailyActionsDBService\Repositories\Sports",
    "Backend\PP.DailyActionsDBService\Repositories\Transactions"
)

# Process each repository folder
foreach ($folder in $repositoryFolders) {
    Write-Host "Processing folder: $folder"
    
    # Get all repository implementation files (excluding interfaces)
    $files = Get-ChildItem -Path $folder -Filter "*.cs" -Exclude "I*.cs"
    
    foreach ($file in $files) {
        Write-Host "  Processing file: $($file.Name)"
        
        # Read the file content
        $content = Get-Content -Path $file.FullName -Raw
        
        # Replace all using statements with the correct ones
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Data;", "using PP.DailyActionsDBService.Data;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Extensions;", "using PP.DailyActionsDBService.Extensions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Interfaces;", "using PP.DailyActionsDBService.Repositories;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.DailyActions;", "using PP.DailyActionsDBService.Models.DailyActions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Games;", "using PP.DailyActionsDBService.Models.Games;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Metadata;", "using PP.DailyActionsDBService.Models.Metadata;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Players;", "using PP.DailyActionsDBService.Models.Players;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Sports;", "using PP.DailyActionsDBService.Models.Sports;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Transactions;", "using PP.DailyActionsDBService.Models.Transactions;"
        $content = $content -replace "using PPrePorter\.Core\.Interfaces;", "using PP.DailyActionsDBService.Interfaces;"
        $content = $content -replace "using PPrePorter\.Core", "using PP.DailyActionsDBService"
        
        # Replace namespace declarations
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories", "namespace PP.DailyActionsDBService.Repositories"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.DailyActions", "namespace PP.DailyActionsDBService.Repositories.DailyActions"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Games", "namespace PP.DailyActionsDBService.Repositories.Games"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Metadata", "namespace PP.DailyActionsDBService.Repositories.Metadata"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Players", "namespace PP.DailyActionsDBService.Repositories.Players"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Sports", "namespace PP.DailyActionsDBService.Repositories.Sports"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Transactions", "namespace PP.DailyActionsDBService.Repositories.Transactions"
        
        # Add missing using statements for repositories
        if ($content -notmatch "using PP\.DailyActionsDBService\.Repositories;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Data;", "using PP.DailyActionsDBService.Data;`r`nusing PP.DailyActionsDBService.Repositories;"
        }
        
        # Add missing using statements for specific repository interfaces
        $folderName = Split-Path -Leaf $folder
        if ($folderName -eq "DailyActions" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.DailyActions;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.DailyActions;"
        }
        elseif ($folderName -eq "Games" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.Games;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Games;"
        }
        elseif ($folderName -eq "Metadata" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.Metadata;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Metadata;"
        }
        elseif ($folderName -eq "Players" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.Players;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Players;"
        }
        elseif ($folderName -eq "Sports" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.Sports;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Sports;"
        }
        elseif ($folderName -eq "Transactions" -and $content -notmatch "using PP\.DailyActionsDBService\.Repositories\.Transactions;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Transactions;"
        }
        
        # Replace specific interface references
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.DailyActions\.IDailyActionRepository", "PP.DailyActionsDBService.Repositories.DailyActions.IDailyActionRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.DailyActions\.IDailyActionGameRepository", "PP.DailyActionsDBService.Repositories.DailyActions.IDailyActionGameRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Games\.IGameRepository", "PP.DailyActionsDBService.Repositories.Games.IGameRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Metadata\.ICountryRepository", "PP.DailyActionsDBService.Repositories.Metadata.ICountryRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Metadata\.ICurrencyRepository", "PP.DailyActionsDBService.Repositories.Metadata.ICurrencyRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Metadata\.IWhiteLabelRepository", "PP.DailyActionsDBService.Repositories.Metadata.IWhiteLabelRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Players\.IPlayerRepository", "PP.DailyActionsDBService.Repositories.Players.IPlayerRepository"
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.Transactions\.ITransactionRepository", "PP.DailyActionsDBService.Repositories.Transactions.ITransactionRepository"
        
        # Replace BaseRepository references
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Repositories\.BaseRepository", "PP.DailyActionsDBService.Repositories.BaseRepository"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
    }
}

# Now process the interface files
foreach ($folder in $repositoryFolders) {
    Write-Host "Processing interfaces in folder: $folder"
    
    # Get all interface files
    $files = Get-ChildItem -Path $folder -Filter "I*.cs"
    
    foreach ($file in $files) {
        Write-Host "  Processing interface file: $($file.Name)"
        
        # Read the file content
        $content = Get-Content -Path $file.FullName -Raw
        
        # Replace using statements
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.DailyActions;", "using PP.DailyActionsDBService.Models.DailyActions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Games;", "using PP.DailyActionsDBService.Models.Games;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Metadata;", "using PP.DailyActionsDBService.Models.Metadata;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Players;", "using PP.DailyActionsDBService.Models.Players;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Sports;", "using PP.DailyActionsDBService.Models.Sports;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Transactions;", "using PP.DailyActionsDBService.Models.Transactions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Repositories;", "using PP.DailyActionsDBService.Repositories;"
        
        # Replace namespace declarations
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.DailyActions", "namespace PP.DailyActionsDBService.Repositories.DailyActions"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.Games", "namespace PP.DailyActionsDBService.Repositories.Games"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.Metadata", "namespace PP.DailyActionsDBService.Repositories.Metadata"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.Players", "namespace PP.DailyActionsDBService.Repositories.Players"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.Sports", "namespace PP.DailyActionsDBService.Repositories.Sports"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.Transactions", "namespace PP.DailyActionsDBService.Repositories.Transactions"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces", "namespace PP.DailyActionsDBService.Repositories"
        
        # Replace IBaseRepository references
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.IBaseRepository", "PP.DailyActionsDBService.Repositories.IBaseRepository"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
    }
}

# Now let's create a script to update all the repository files directly
$repositoryFiles = Get-ChildItem -Path "Backend\PP.DailyActionsDBService\Repositories" -Filter "*.cs" -Recurse

foreach ($file in $repositoryFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace all occurrences of PPrePorter.DailyActionsDB with PP.DailyActionsDBService
    $content = $content -replace "PPrePorter\.DailyActionsDB", "PP.DailyActionsDBService"
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Repository update complete!"
