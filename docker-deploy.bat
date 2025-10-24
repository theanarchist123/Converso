@echo off
REM Docker Compose Deployment Script (Windows)

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Docker Compose deployment for SaaS App
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local file not found. Make sure to create it with your environment variables.
    pause
    exit /b 1
)

REM Stop existing services
echo ℹ️  Stopping existing services...
docker-compose down

REM Build and start services
echo ℹ️  Building and starting services...
docker-compose up --build -d

if errorlevel 1 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)

echo ✅ Services started successfully

REM Wait a moment for services to start
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps

echo.
echo ✅ Docker Compose deployment completed! 🎉
echo.
echo ℹ️  Useful commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo   View status: docker-compose ps
echo.
echo ℹ️  Access your application:
echo   Local: http://localhost:3000
echo   Health check: http://localhost:3000/api/health
echo.
pause