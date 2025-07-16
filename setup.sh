#!/bin/bash

# GLOW Project Setup Script
# This script sets up both frontend and backend for development

echo "🚀 Setting up GLOW by Microsofties..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Setup Backend
echo ""
echo "📦 Setting up backend..."
cd glow-microsofties/backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please update .env with your database connection details"
fi

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."
cd ../../my-mvc-app

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "1. Backend:  cd glow-microsofties/backend && npm run dev"
echo "2. Frontend: cd my-mvc-app && npm run dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5050"
echo ""
echo "Don't forget to:"
echo "- Install and start MongoDB"
echo "- Update the .env file in backend directory"
