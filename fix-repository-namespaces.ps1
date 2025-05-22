# Script to fix namespaces in repository implementations

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
        
        # Get the folder name (which is the namespace suffix)
        $folderName = Split-Path -Leaf $folder
        
        # Replace the namespace
        $content = $content -replace "namespace PP\.DailyActionsDBService\.Repositories(\s|\r|\n)+{", "namespace PP.DailyActionsDBService.Repositories.$folderName`r`n{"
        
        # Add missing using statements for interfaces
        if ($content -notmatch "using PP\.DailyActionsDBService\.Repositories\.$folderName;") {
            $content = $content -replace "using PP\.DailyActionsDBService\.Repositories;", "using PP.DailyActionsDBService.Repositories;`r`nusing PP.DailyActionsDBService.Repositories.$folderName;"
        }
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "    Updated namespace in $($file.Name)"
    }
}

Write-Host "Namespace update complete!"
