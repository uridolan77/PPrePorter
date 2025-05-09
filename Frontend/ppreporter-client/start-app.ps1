# PowerShell script to start the PPreporter application
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Running PPreporter App" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Set-Location -Path "c:\dev\PPrePorter\Frontend\ppreporter-client"

Write-Host "Stopping any existing React processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Set environment variables
$env:REACT_APP_API_URL = "https://localhost:7075/api"
Write-Host "Set API URL to: $env:REACT_APP_API_URL" -ForegroundColor Green

Write-Host "Starting the React application..." -ForegroundColor Green
npm start

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "PPreporter App Started" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
