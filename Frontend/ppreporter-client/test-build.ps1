Write-Host "Testing build process..." -ForegroundColor Cyan
Set-Location -Path "c:\dev\PPrePorter\Frontend\ppreporter-client"
Write-Host "Building application..." -ForegroundColor Yellow
npm run build
Write-Host "Build process completed." -ForegroundColor Green
