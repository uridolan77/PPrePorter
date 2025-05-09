# PowerShell script to start the React application
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Starting PPreporter Client Application" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Navigate to the client directory
Set-Location -Path "C:\dev\PPrePorter\Frontend\ppreporter-client"
Write-Host "Current directory: $PWD" -ForegroundColor Yellow

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Set environment variables
$env:REACT_APP_API_URL = "https://localhost:7075/api"
Write-Host "API URL set to: $env:REACT_APP_API_URL" -ForegroundColor Green

# Start the React application
Write-Host "Starting React application..." -ForegroundColor Green
npm run start

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "React application started" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
