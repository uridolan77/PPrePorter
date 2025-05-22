# Script to update all repository implementations to use the new namespaces
$repositoryFolders = @(
    "Backend\PP.DailyActionsDBService\Repositories\DailyActions",
    "Backend\PP.DailyActionsDBService\Repositories\Games",
    "Backend\PP.DailyActionsDBService\Repositories\Metadata",
    "Backend\PP.DailyActionsDBService\Repositories\Players",
    "Backend\PP.DailyActionsDBService\Repositories\Sports",
    "Backend\PP.DailyActionsDBService\Repositories\Transactions"
)

foreach ($folder in $repositoryFolders) {
    $files = Get-ChildItem -Path $folder -Filter "*.cs" -Exclude "I*.cs"
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Replace using statements
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Data;", "using PP.DailyActionsDBService.Data;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Extensions;", "using PP.DailyActionsDBService.Extensions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Interfaces;", "using PP.DailyActionsDBService.Repositories;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.DailyActions;", "using PP.DailyActionsDBService.Models.DailyActions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Games;", "using PP.DailyActionsDBService.Models.Games;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Metadata;", "using PP.DailyActionsDBService.Models.Metadata;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Players;", "using PP.DailyActionsDBService.Models.Players;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Sports;", "using PP.DailyActionsDBService.Models.Sports;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Transactions;", "using PP.DailyActionsDBService.Models.Transactions;"
        $content = $content -replace "using PPrePorter\.Core", "using PP.DailyActionsDBService"
        
        # Replace namespace declaration
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories", "namespace PP.DailyActionsDBService.Repositories"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.DailyActions", "namespace PP.DailyActionsDBService.Repositories.DailyActions"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Games", "namespace PP.DailyActionsDBService.Repositories.Games"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Metadata", "namespace PP.DailyActionsDBService.Repositories.Metadata"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Players", "namespace PP.DailyActionsDBService.Repositories.Players"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Sports", "namespace PP.DailyActionsDBService.Repositories.Sports"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Transactions", "namespace PP.DailyActionsDBService.Repositories.Transactions"
        
        # Add missing using statements
        if ($content -notmatch "using PP\.DailyActionsDBService\.Repositories;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Data;", "using PP.DailyActionsDBService.Data;`r`nusing PP.DailyActionsDBService.Repositories;"
        }
        
        # Add missing using statements for interfaces
        $folderName = Split-Path -Leaf $folder
        if ($folderName -eq "DailyActions") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.DailyActions;"
        }
        elseif ($folderName -eq "Games") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Games;"
        }
        elseif ($folderName -eq "Metadata") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Metadata;"
        }
        elseif ($folderName -eq "Players") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Players;"
        }
        elseif ($folderName -eq "Sports") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Sports;"
        }
        elseif ($folderName -eq "Transactions") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Transactions;"
        }
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "Updated repository implementation in $($file.FullName)"
    }
}

# Now let's create a new file for each repository implementation
foreach ($folder in $repositoryFolders) {
    $files = Get-ChildItem -Path $folder -Filter "*.cs" -Exclude "I*.cs"
    
    foreach ($file in $files) {
        $fileName = $file.Name
        $newFilePath = "$folder\$fileName.new"
        
        # Create a new file with the same content
        $content = Get-Content -Path $file.FullName -Raw
        
        # Replace using statements
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Data;", "using PP.DailyActionsDBService.Data;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Extensions;", "using PP.DailyActionsDBService.Extensions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Interfaces;", "using PP.DailyActionsDBService.Repositories;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.DailyActions;", "using PP.DailyActionsDBService.Models.DailyActions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Games;", "using PP.DailyActionsDBService.Models.Games;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Metadata;", "using PP.DailyActionsDBService.Models.Metadata;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Players;", "using PP.DailyActionsDBService.Models.Players;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Sports;", "using PP.DailyActionsDBService.Models.Sports;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Transactions;", "using PP.DailyActionsDBService.Models.Transactions;"
        $content = $content -replace "using PPrePorter\.Core", "using PP.DailyActionsDBService"
        
        # Replace namespace declaration
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories", "namespace PP.DailyActionsDBService.Repositories"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.DailyActions", "namespace PP.DailyActionsDBService.Repositories.DailyActions"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Games", "namespace PP.DailyActionsDBService.Repositories.Games"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Metadata", "namespace PP.DailyActionsDBService.Repositories.Metadata"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Players", "namespace PP.DailyActionsDBService.Repositories.Players"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Sports", "namespace PP.DailyActionsDBService.Repositories.Sports"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Repositories\.Transactions", "namespace PP.DailyActionsDBService.Repositories.Transactions"
        
        # Add missing using statements
        if ($content -notmatch "using PP\.DailyActionsDBService\.Repositories;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Data;", "using PP.DailyActionsDBService.Data;`r`nusing PP.DailyActionsDBService.Repositories;"
        }
        
        # Add missing using statements for interfaces
        $folderName = Split-Path -Leaf $folder
        if ($folderName -eq "DailyActions") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.DailyActions;"
        }
        elseif ($folderName -eq "Games") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Games;"
        }
        elseif ($folderName -eq "Metadata") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Metadata;"
        }
        elseif ($folderName -eq "Players") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Players;"
        }
        elseif ($folderName -eq "Sports") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Sports;"
        }
        elseif ($folderName -eq "Transactions") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.Transactions;"
        }
        
        # Write the updated content to the new file
        Set-Content -Path $newFilePath -Value $content
        
        Write-Host "Created new file $newFilePath"
    }
}

Write-Host "Repository implementation update complete!"
