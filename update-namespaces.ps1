# Script to update namespaces in all model files
$modelFolders = @(
    "Backend\PP.DailyActionsDBService\Models\DailyActions",
    "Backend\PP.DailyActionsDBService\Models\Games",
    "Backend\PP.DailyActionsDBService\Models\Metadata",
    "Backend\PP.DailyActionsDBService\Models\Players",
    "Backend\PP.DailyActionsDBService\Models\Sports",
    "Backend\PP.DailyActionsDBService\Models\Transactions"
)

foreach ($folder in $modelFolders) {
    $files = Get-ChildItem -Path $folder -Filter "*.cs"
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Replace namespace
        $content = $content -replace "namespace PPrePorter\.DailyActionsDB\.Models", "namespace PP.DailyActionsDBService.Models"
        
        # Replace using statements
        $content = $content -replace "using PPrePorter\.DailyActionsDB\.Models", "using PP.DailyActionsDBService.Models"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "Updated namespace in $($file.FullName)"
    }
}

Write-Host "Namespace update complete!"
