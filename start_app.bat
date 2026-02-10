localhost@echo off
echo Starting SmartKart...

start "SmartKart Backend" cmd /k "cd backend && npm run dev"
start "SmartKart Frontend" cmd /k "cd frontend && npm run dev"

echo Servers launched in new windows!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
pause
