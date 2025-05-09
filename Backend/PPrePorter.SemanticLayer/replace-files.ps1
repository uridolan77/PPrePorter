# PowerShell script to replace files with new versions
$files = @(
    "QueryEntities.cs",
    "Metric.cs",
    "Dimension.cs",
    "Filter.cs",
    "TimeRange.cs",
    "Sort.cs"
)

$entitiesDir = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer\Models\Entities"

foreach ($file in $files) {
    $oldFile = Join-Path $entitiesDir $file
    $newFile = Join-Path $entitiesDir "$($file.Replace('.cs', '.new.cs'))"
    
    if (Test-Path $oldFile) {
        # Backup the old file
        Rename-Item -Path $oldFile -NewName "$file.bak" -Force
        Write-Host "Backed up $oldFile to $file.bak"
    }
    
    if (Test-Path $newFile) {
        # Rename new file to replace old file
        Rename-Item -Path $newFile -NewName $file -Force
        Write-Host "Renamed $newFile to $file"
    }
}

Write-Host "File replacement complete!" -ForegroundColor Green
