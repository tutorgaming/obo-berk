@echo off
REM OBO-Berk Startup Script for Windows
REM Simplifies starting the application in different modes

title OBO-Berk (โอโบ-เบิก) - Expense Tracking System

echo ========================================
echo   OBO-Berk (โอโบ-เบิก)
echo   Expense Tracking System - Obodroid
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    echo Please install Docker from https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo Error: Docker Compose is not installed
        echo Please install Docker Compose from https://docs.docker.com/compose/install/
        pause
        exit /b 1
    )
)

:menu
cls
echo ========================================
echo   OBO-Berk Management Menu
echo ========================================
echo.
echo 1) Start Production (http://localhost)
echo 2) Start Development (http://localhost:5173)
echo 3) View Logs
echo 4) Stop Services
echo 5) Clean Everything
echo 6) Backup Data
echo 7) Show Running Containers
echo 8) Rebuild Images
echo 9) Help
echo 0) Exit
echo.
set /p choice="Enter choice [0-9]: "

if "%choice%"=="1" goto production
if "%choice%"=="2" goto development
if "%choice%"=="3" goto logs
if "%choice%"=="4" goto stop
if "%choice%"=="5" goto clean
if "%choice%"=="6" goto backup
if "%choice%"=="7" goto containers
if "%choice%"=="8" goto rebuild
if "%choice%"=="9" goto help
if "%choice%"=="0" goto exit
echo Invalid option
pause
goto menu

:production
echo Starting production environment...
docker-compose up -d
echo.
echo Application started successfully!
echo.
echo Access the application at:
echo   Frontend:    http://localhost
echo   Backend API: http://localhost:3001/api
echo.
echo To view logs, run: docker-compose logs -f
pause
goto menu

:development
echo Starting development environment...
echo Note: This will run with live logs
echo Press Ctrl+C to stop
echo.
timeout /t 2 /nobreak >nul
docker-compose -f docker-compose.dev.yml up
pause
goto menu

:logs
echo Viewing logs (Press Ctrl+C to exit)...
docker-compose logs -f
pause
goto menu

:stop
echo Stopping services...
docker-compose down
echo Services stopped
pause
goto menu

:clean
echo WARNING: This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    echo Cleaning up...
    docker-compose down -v --rmi all
    echo Cleanup complete
) else (
    echo Cancelled
)
pause
goto menu

:backup
echo Creating backup...
set BACKUP_DIR=backups\%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul
docker-compose exec -T mongodb mongodump --db obo-berk --archive > "%BACKUP_DIR%\mongodb.archive"
docker cp obo-berk-backend:/app/uploads "%BACKUP_DIR%\uploads"
echo Backup created: %BACKUP_DIR%
pause
goto menu

:containers
echo Running containers:
docker-compose ps
pause
goto menu

:rebuild
echo Rebuilding images without cache...
docker-compose build --no-cache
echo Images rebuilt
pause
goto menu

:help
echo OBO-Berk Help
echo.
echo Quick Start:
echo   start.bat          - Interactive menu
echo   start.bat prod     - Start production
echo   start.bat dev      - Start development
echo   start.bat stop     - Stop services
echo.
echo For detailed documentation, see:
echo   - README.md for general information
echo   - DOCKER.md for Docker-specific instructions
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0
