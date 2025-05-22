# Script to fix abstract method implementations in repositories

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
        
        # Check if the file contains NamedEntityRepository
        if ($content -match "NamedEntityRepository<(\w+)>") {
            $entityType = $matches[1]
            Write-Host "    Found NamedEntityRepository<$entityType>"
            
            # Check if GetByNameAsync is missing
            if ($content -notmatch "public\s+override\s+Task<$entityType>\s+GetByNameAsync") {
                Write-Host "    Adding GetByNameAsync implementation"
                
                # Add GetByNameAsync implementation
                $getByNameAsyncImpl = @"

        /// <summary>
        /// Gets entity by name
        /// </summary>
        public override async Task<$entityType> GetByNameAsync(string name)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Name == name);
        }
"@
                
                # Find the position to insert the implementation
                $lastMethodPos = $content.LastIndexOf("}")
                $content = $content.Insert($lastMethodPos, $getByNameAsyncImpl)
            }
            
            # Check if GetByCodeAsync is missing
            if ($content -notmatch "public\s+override\s+Task<$entityType>\s+GetByCodeAsync") {
                Write-Host "    Adding GetByCodeAsync implementation"
                
                # Add GetByCodeAsync implementation
                $getByCodeAsyncImpl = @"

        /// <summary>
        /// Gets entity by code
        /// </summary>
        public override async Task<$entityType> GetByCodeAsync(string code)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Code == code);
        }
"@
                
                # Find the position to insert the implementation
                $lastMethodPos = $content.LastIndexOf("}")
                $content = $content.Insert($lastMethodPos, $getByCodeAsyncImpl)
            }
            
            # Check if ApplyActiveFilter is missing
            if ($content -notmatch "protected\s+override\s+IQueryable<$entityType>\s+ApplyActiveFilter") {
                Write-Host "    Adding ApplyActiveFilter implementation"
                
                # Add ApplyActiveFilter implementation
                $applyActiveFilterImpl = @"

        /// <summary>
        /// Applies active filter to query
        /// </summary>
        protected override IQueryable<$entityType> ApplyActiveFilter(IQueryable<$entityType> query)
        {
            return query.Where(e => e.IsActive);
        }
"@
                
                # Find the position to insert the implementation
                $lastMethodPos = $content.LastIndexOf("}")
                $content = $content.Insert($lastMethodPos, $applyActiveFilterImpl)
            }
            
            # Write the updated content back to the file
            Set-Content -Path $file.FullName -Value $content
        }
    }
}

Write-Host "Abstract method implementation update complete!"
