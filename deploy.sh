#!/bin/bash
# Recovery Agent - Deployment Setup Script

echo "🚀 Recovery Agent Deployment Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check deployment choice
echo "Choose your deployment platform:"
echo "1) Vercel (Recommended - Easy)"
echo "2) Railway (Fast)"
echo "3) Render (Free)"
echo "4) Docker (Advanced)"
echo "5) Local only (Development)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Setting up Vercel deployment..."
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo ""
        echo "🔐 Vercel CLI is ready!"
        echo ""
        echo "To deploy your app:"
        echo "1. Run: vercel login"
        echo "2. Configure project settings"
        echo "3. Run: vercel --prod"
        echo ""
        echo "For backend, deploy to Railway:"
        echo "1. Visit https://railway.app"
        echo "2. Connect your GitHub repository"
        echo "3. Set up environment variables"
        echo "4. Deploy"
        ;;
    
    2)
        echo ""
        echo "🚂 Setting up Railway deployment..."
        echo ""
        echo "Visit https://railway.app"
        echo ""
        echo "Steps:"
        echo "1. Create account and login"
        echo "2. Create new project"
        echo "3. Connect GitHub repository"
        echo "4. Configure environment variables:"
        echo "   - NODE_ENV=production"
        echo "   - JWT_[REDACTED_GENERIC_SECRET_3]"
        echo "5. Deploy from railway.app dashboard"
        ;;
    
    3)
        echo ""
        echo "🎨 Setting up Render deployment..."
        echo ""
        echo "Visit https://render.com"
        echo ""
        echo "Steps:"
        echo "1. Create account and login"
        echo "2. Create new Web Service"
        echo "3. Connect GitHub repository"
        echo "4. Configure build and start commands"
        echo "5. Add environment variables"
        echo "6. Deploy from render.com dashboard"
        ;;
    
    4)
        echo ""
        echo "🐳 Setting up Docker deployment..."
        echo ""
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker from https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        
        echo "✅ Docker $(docker -v) detected"
        echo ""
        echo "To build and run with Docker:"
        echo "1. docker-compose up -d"
        echo ""
        echo "To deploy to cloud:"
        echo "- Push images to Docker Hub"
        echo "- Deploy to Kubernetes, Render, or Railway"
        ;;
    
    5)
        echo ""
        echo "🏠 Local development setup..."
        echo ""
        echo "Installing dependencies..."
        npm install
        cd server && npm install && cd ..
        echo ""
        echo "✅ Dependencies installed!"
        echo ""
        echo "To start development:"
        echo "Terminal 1: cd server && npm run dev"
        echo "Terminal 2: npx vite"
        echo ""
        echo "Frontend: http://localhost:4176"
        echo "Backend: http://localhost:3001"
        ;;
    
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "For more details, see DEPLOYMENT.md"
