@echo off
echo Liberando porta 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Iniciando SAPA SaaS em http://localhost:3001
cd /d "%~dp0sapa-web"
set PORT=3001
npm run dev
