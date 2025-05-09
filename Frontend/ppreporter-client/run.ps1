Write-Host "Starting PPreporter Client..." -ForegroundColor Cyan
Set-Location -Path "c:\dev\PPrePorter\Frontend\ppreporter-client"
Write-Host "Installing dependencies if necessary..." -ForegroundColor Yellow
npm install
Write-Host "Starting development server..." -ForegroundColor Green
npm start
