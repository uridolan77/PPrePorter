@echo off
echo ===================================
echo Starting PPreporter Client Application
echo ===================================

cd /d %~dp0
echo Current directory: %CD%

echo Installing dependencies...
call npm install

echo Setting environment variables...
set REACT_APP_API_URL=https://localhost:7075/api
echo API URL set to: %REACT_APP_API_URL%

echo Starting React application...
call npm run start

echo ===================================
echo React application started
echo ===================================
