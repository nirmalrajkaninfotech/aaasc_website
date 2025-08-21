#!/bin/bash

# AAASC Admin Server Startup Script

echo "🚀 Starting AAASC Admin Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ .env file created from template"
        echo "⚠️  Please edit .env file with your configuration before continuing"
        echo "   Press Enter to continue or Ctrl+C to edit .env first..."
        read
    else
        echo "❌ env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p database
echo "✅ Directories created"

# Start the server
echo "🚀 Starting server..."
echo "📊 Server will be available at: http://localhost:5000"
echo "🔐 Admin panel: http://localhost:5000/admin"
echo "📡 API endpoints: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
