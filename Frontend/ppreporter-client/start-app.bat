@echo off
echo ===================================
echo Running PPreporter App
echo ===================================
cd c:\dev\PPrePorter\Frontend\ppreporter-client

echo Stopping any existing React processes...
taskkill /f /im node.exe >nul 2>&1

echo Installing dependencies...
call npm install

REM Set environment variables
set REACT_APP_API_URL=https://localhost:7075/api
echo Set API URL to: %REACT_APP_API_URL%

echo Starting the React application...
call npm start

echo ===================================
echo PPreporter App Started
echo ===================================
