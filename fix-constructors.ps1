# Script to fix constructor parameters in repositories

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
        
        # Fix constructor parameters
        $content = $content -replace "base\(dbContext, logger, cache, enableCaching, cacheExpirationMinutes\)", "base(dbContext, logger, cache)"
        
        # Fix constructor declaration
        $content = $content -replace "(\s+public \w+Repository\(\s+DailyActionsDbContext dbContext,\s+ILogger<\w+> logger,\s+IMemoryCache cache,\s+bool enableCaching = true,\s+int cacheExpirationMinutes = 30\))", "`$1"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $content
    }
}

Write-Host "Constructor parameter update complete!"
