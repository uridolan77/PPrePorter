# Script to fix namespaces in interface files

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
    
    # Get all interface files
    $files = Get-ChildItem -Path $folder -Filter "I*.cs"
    
    foreach ($file in $files) {
        Write-Host "  Processing file: $($file.Name)"
        
        # Read the file content
        $content = Get-Content -Path $file.FullName -Raw
        
        # Get the folder name (which is the namespace suffix)
        $folderName = Split-Path -Leaf $folder
        
        # Replace the namespace
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces\.$folderName", "namespace PP.DailyActionsDBService.Repositories.$folderName"
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Interfaces", "namespace PP.DailyActionsDBService.Repositories"
        
        # Replace using statements
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.DailyActions;", "using PP.DailyActionsDBService.Models.DailyActions;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Games;", "using PP.DailyActionsDBService.Models.Games;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Metadata;", "using PP.DailyActionsDBService.Models.Metadata;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Players;", "using PP.DailyActionsDBService.Models.Players;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Sports;", "using PP.DailyActionsDBService.Models.Sports;"
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models\.Transactions;", "using PP.DailyActionsDBService.Models.Transactions;"
        
        # Replace IBaseRepository references
        $content = $content -replace "PPrePorter\.DailyActionsDB\.Interfaces\.IBaseRepository", "PP.DailyActionsDBService.Repositories.IBaseRepository"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "    Updated namespace in $($file.Name)"
    }
}

Write-Host "Interface namespace update complete!"
