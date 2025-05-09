# PowerShell script to apply fixes to PPrePorter.SemanticLayer
# This script renames the problematic files to .bak and creates new versions

# Define paths
$projectRoot = "c:\dev\PPrePorter\Backend\PPrePorter.SemanticLayer"
$coreDir = Join-Path $projectRoot "Core"
$servicesDir = Join-Path $projectRoot "Services"
$modelsDir = Join-Path $projectRoot "Models"
$entitiesDir = Join-Path $modelsDir "Entities"
$translationDir = Join-Path $modelsDir "Translation"

# Backup problematic files
Write-Host "Backing up problematic files..." -ForegroundColor Cyan

# Interface files
$interfaceFiles = @(
    (Join-Path $coreDir "ISemanticLayerServices.cs"),
    (Join-Path $coreDir "ISqlTranslationService.cs")
)

foreach ($file in $interfaceFiles) {
    if (Test-Path $file) {
        $bakFile = "$file.bak"
        Copy-Item $file $bakFile -Force
        Write-Host "Backed up $file to $bakFile" -ForegroundColor Green
    }
}

# Model files with duplicates
$duplicateModelFiles = @(
    (Join-Path $entitiesDir "QueryEntities.cs"),
    (Join-Path $translationDir "QueryEntities.cs")
)

foreach ($file in $duplicateModelFiles) {
    if (Test-Path $file) {
        $bakFile = "$file.bak"
        Copy-Item $file $bakFile -Force
        Write-Host "Backed up $file to $bakFile" -ForegroundColor Green
    }
}

# Service files with implementation issues
$serviceFiles = @(
    (Join-Path $servicesDir "MemoryCacheService.cs"),
    (Join-Path $servicesDir "DataModelService.cs"),
    (Join-Path $servicesDir "EntityMappingService.cs")
)

foreach ($file in $serviceFiles) {
    if (Test-Path $file) {
        $bakFile = "$file.bak"
        Copy-Item $file $bakFile -Force
        Write-Host "Backed up $file to $bakFile" -ForegroundColor Green
    }
}

# Move fixed implementation files
Write-Host "Moving updated implementation files..." -ForegroundColor Cyan
$updatedFiles = Get-ChildItem -Path $projectRoot -Filter "Updated*.cs" -Recurse

foreach ($file in $updatedFiles) {
    $newName = $file.Name -replace "Updated", ""
    $targetPath = Join-Path $file.Directory.FullName $newName
    Move-Item $file.FullName $targetPath -Force
    Write-Host "Moved $($file.Name) to $newName" -ForegroundColor Green
}

Write-Host "Fix application complete!" -ForegroundColor Green
Write-Host "Please rebuild the project to verify all errors are resolved."
