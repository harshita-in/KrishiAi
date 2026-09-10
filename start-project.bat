@echo off
echo ===================================================
echo   Starting KrishiAI Major Project (Dual Portals + API)
echo ===================================================
echo.
echo [1/3] Launching Backend Server on port 5000...
start "KrishiAI Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm start"

echo [2/3] Launching Farmer Portal on port 3000...
start "KrishiAI Farmer Portal (Port 3000)" cmd /k "cd /d "%~dp0frontend\farmer-portal" && npm start"

echo [3/3] Launching Wholesaler Portal on port 3001...
start "KrishiAI Wholesaler Portal (Port 3001)" cmd /k "cd /d "%~dp0frontend\wholesaler-portal" && set PORT=3001&& npm start"

echo.
echo ===================================================
echo   All 3 services are launching in background!
echo   - Backend Server:    http://localhost:5000
echo   - Farmer Portal:     http://localhost:3000
echo   - Wholesaler Portal: http://localhost:3001
echo ===================================================
timeout /t 5
