@echo off
title InvestIQ Launcher
echo ===================================================
echo           Starting InvestIQ Platform
echo ===================================================
echo.

set "PATH=C:\Users\saibh\AppData\Local\Programs\nodejs;%PATH%"

echo Starting Backend Server on port 8000...
start "InvestIQ Backend" cmd /k "cd /d C:\Users\saibh\.gemini\antigravity\scratch\investiq\backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Starting Frontend Web App on port 5173...
start "InvestIQ Frontend" cmd /k "cd /d C:\Users\saibh\.gemini\antigravity\scratch\investiq\frontend && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo InvestIQ is now running! Keep the backend and frontend terminal windows open.
pause
