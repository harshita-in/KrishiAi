@echo off
echo ===================================================
echo   KrishiAI Major Project - Initial Dependencies Setup
echo ===================================================
echo.
echo [1/3] Installing Backend Dependencies...
cd /d "%~dp0backend"
call npm install

echo.
echo [2/3] Installing Farmer Portal Dependencies...
cd /d "%~dp0frontend\farmer-portal"
call npm install

echo.
echo [3/3] Installing Wholesaler Portal Dependencies...
cd /d "%~dp0frontend\wholesaler-portal"
call npm install

echo.
echo ===================================================
echo   Setup Completed Successfully!
echo   Now run start-project.bat to launch the application.
echo ===================================================
pause
