# Script to update repository implementations to use the new namespaces
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
        
        # Update constructor to use DailyActionsDbContext
        $content = $content -replace "DbContext dbContext", "DailyActionsDbContext dbContext"
        
        # Update base constructor call
        $content = $content -replace "base\(dbContext, logger, cache", "base(dbContext, logger, cache"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "Updated repository implementation in $($file.FullName)"
    }
}

Write-Host "Repository implementation update complete!"
