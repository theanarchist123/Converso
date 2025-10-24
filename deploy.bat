@echo off
REM Docker Build and Deploy Script for SaaS App (Windows)
REM This script builds and deploys the application using Docker

setlocal enabledelayedexpansion

REM Configuration
set IMAGE_NAME=saas-app
set CONTAINER_NAME=saas-app-container
set PORT=3000

echo.
echo 🚀 Starting Docker deployment for SaaS App
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
    echo Required variables:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    echo - CLERK_SECRET_KEY
    echo.
    set /p "continue=Continue anyway? (y/n): "
    if /i not "!continue!"=="y" exit /b 1
)

REM Stop and remove existing container
echo ℹ️  Stopping existing container if running...
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

REM Remove existing image
echo ℹ️  Removing existing image if exists...
docker rmi %IMAGE_NAME% >nul 2>&1

REM Build the Docker image
echo ℹ️  Building Docker image...

REM Load env vars from .env.local for build args
for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
    set "%%a=%%b"
)

REM Build with build arguments for Next.js public env vars
docker build -t %IMAGE_NAME% ^
    --build-arg NEXT_PUBLIC_SUPABASE_URL=%NEXT_PUBLIC_SUPABASE_URL% ^
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=%NEXT_PUBLIC_SUPABASE_ANON_KEY% ^
    --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY% ^
    .

if errorlevel 1 (
    echo ❌ Failed to build Docker image
    pause
    exit /b 1
)

echo ✅ Docker image built successfully

REM Run the container
echo ℹ️  Starting container...
docker run -d --name %CONTAINER_NAME% -p %PORT%:3000 --env-file .env.local --restart unless-stopped %IMAGE_NAME%

if errorlevel 1 (
    echo ❌ Failed to start container
    pause
    exit /b 1
)

echo ✅ Container started successfully
echo ℹ️  Application is running at http://localhost:%PORT%

REM Wait a moment for the container to start
timeout /t 5 /nobreak >nul

REM Check container status
docker ps | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo ❌ Container failed to start
    pause
    exit /b 1
)

echo ✅ Container is running

REM Check health endpoint
echo ℹ️  Checking application health...
curl -f http://localhost:%PORT%/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Application may still be starting up. Check logs if needed.
) else (
    echo ✅ Application is healthy and responding
)

echo.
echo ✅ Deployment completed successfully! 🎉
echo.
echo ℹ️  Useful commands:
echo   View logs: docker logs %CONTAINER_NAME%
echo   Stop container: docker stop %CONTAINER_NAME%
echo   Restart container: docker restart %CONTAINER_NAME%
echo   Remove container: docker rm %CONTAINER_NAME%
echo   View running containers: docker ps
echo.
echo ℹ️  Access your application:
echo   Local: http://localhost:%PORT%
echo   Health check: http://localhost:%PORT%/api/health
echo.
pause