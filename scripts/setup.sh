#!/bin/bash

# Impression3D - Development Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Impression3D development environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in project root
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "${BLUE}Step 1: Checking dependencies...${NC}"

# Check for Node.js
if command -v node &> /dev/null; then
    echo "${GREEN}✓${NC} Node.js $(node --version) found"
else
    echo "${YELLOW}⚠${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check for Python
if command -v python3 &> /dev/null; then
    echo "${GREEN}✓${NC} Python $(python3 --version) found"
else
    echo "${YELLOW}⚠${NC} Python not found. Please install Python 3.10+"
    exit 1
fi

# Check for Docker
if command -v docker &> /dev/null; then
    echo "${GREEN}✓${NC} Docker $(docker --version) found"
else
    echo "${YELLOW}⚠${NC} Docker not found (optional, but recommended)"
fi

# Check for Redis
if command -v redis-server &> /dev/null; then
    echo "${GREEN}✓${NC} Redis found"
else
    echo "${YELLOW}⚠${NC} Redis not found (optional if using Docker)"
fi

echo ""
echo "${BLUE}Step 2: Setting up Frontend...${NC}"

cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "${GREEN}✓${NC} Frontend setup complete"

cd ..

echo ""
echo "${BLUE}Step 3: Setting up Backend...${NC}"

cd backend

if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "${GREEN}✓${NC} Backend setup complete"

cd ..

echo ""
echo "${BLUE}Step 4: Creating environment files...${NC}"

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local..."
    cp frontend/.env.local.example frontend/.env.local
    echo "${GREEN}✓${NC} Created frontend/.env.local"
else
    echo "${YELLOW}⚠${NC} frontend/.env.local already exists"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo "${GREEN}✓${NC} Created backend/.env"
else
    echo "${YELLOW}⚠${NC} backend/.env already exists"
fi

echo ""
echo "${BLUE}Step 5: Creating required directories...${NC}"

mkdir -p backend/logs
mkdir -p backend/models
mkdir -p backend/uploads
mkdir -p backend/generated

echo "${GREEN}✓${NC} Directories created"

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo ""
echo "  1. Start services with Docker:"
echo "     ${BLUE}cd infrastructure && docker-compose up${NC}"
echo ""
echo "  2. Or start services manually:"
echo "     Terminal 1: ${BLUE}cd backend && source venv/bin/activate && uvicorn main:app --reload${NC}"
echo "     Terminal 2: ${BLUE}cd backend && source venv/bin/activate && celery -A celery_app worker --loglevel=info${NC}"
echo "     Terminal 3: ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "  3. Access the application:"
echo "     Frontend: ${BLUE}http://localhost:3000${NC}"
echo "     Backend API: ${BLUE}http://localhost:8000/docs${NC}"
echo "     Flower (Celery): ${BLUE}http://localhost:5555${NC}"
echo ""
echo "  4. Download ML models (when ready):"
echo "     ${BLUE}./scripts/download_models.sh${NC}"
echo ""
echo "Happy coding! 🎉"
