@echo off
REM Recovery Agent - Deployment Setup Script (Windows)

echo.
echo 🚀 Recovery Agent Deployment Setup
echo ====================================
echo.

REM Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed.
    echo Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected
echo.

REM Check deployment choice
echo Choose your deployment platform:
echo 1) Vercel (Recommended - Easy)
echo 2) Railway (Fast)
echo 3) Render (Free)
echo 4) Docker (Advanced)
echo 5) Local only (Development)
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo 📦 Setting up Vercel deployment...
    echo.
    
    where vercel > nul 2>&1
    if errorlevel 1 (
        echo Installing Vercel CLI...
        call npm install -g vercel
    )
    
    echo.
    echo 🔐 Vercel CLI is ready!
    echo.
    echo To deploy your app:
    echo 1. Run: vercel login
    echo 2. Configure project settings
    echo 3. Run: vercel --prod
    echo.
    echo For backend, deploy to Railway:
    echo 1. Visit https://railway.app
    echo 2. Connect your GitHub repository
    echo 3. Set up environment variables
    echo 4. Deploy
)

if "%choice%"=="2" (
    echo.
    echo 🚂 Setting up Railway deployment...
    echo.
    echo Visit https://railway.app
    echo.
    echo Steps:
    echo 1. Create account and login
    echo 2. Create new project
    echo 3. Connect GitHub repository
    echo 4. Configure environment variables:
    echo    - NODE_ENV=production
    echo    - JWT_SECRET
    echo 5. Deploy from railway.app dashboard
)

if "%choice%"=="3" (
    echo.
    echo 🎨 Setting up Render deployment...
    echo.
    echo Visit https://render.com
    echo.
    echo Steps:
    echo 1. Create account and login
    echo 2. Create new Web Service
    echo 3. Connect GitHub repository
    echo 4. Configure build and start commands
    echo 5. Add environment variables
    echo 6. Deploy from render.com dashboard
)

if "%choice%"=="4" (
    echo.
    echo 🐳 Setting up Docker deployment...
    echo.
    
    where docker > nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker is not installed.
        echo Please install Docker from https://www.docker.com/products/docker-desktop
        pause
        exit /b 1
    )
    
    for /f "tokens=*" %%i in ('docker -v') do set DOCKER_VERSION=%%i
    echo ✅ %DOCKER_VERSION% detected
    echo.
    echo To build and run with Docker:
    echo 1. docker-compose up -d
    echo.
    echo To deploy to cloud:
    echo - Push images to Docker Hub
    echo - Deploy to Kubernetes, Render, or Railway
)

if "%choice%"=="5" (
    echo.
    echo 🏠 Local development setup...
    echo.
    echo Installing dependencies...
    call npm install
    cd server
    call npm install
    cd ..
    echo.
    echo ✅ Dependencies installed!
    echo.
    echo To start development:
    echo Terminal 1: cd server ^&^& npm run dev
    echo Terminal 2: npx vite
    echo.
    echo Frontend: http://localhost:4176
    echo Backend: http://localhost:3001
)

echo.
echo ✅ Setup complete!
echo.
echo For more details, see DEPLOYMENT.md
echo.
pause
