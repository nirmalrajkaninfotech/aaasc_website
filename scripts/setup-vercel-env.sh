#!/bin/bash

# Exit on error
set -e

echo "🔧 Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel if not already logged in
if ! vercel whoami &> /dev/null; then
    echo "🔑 Please log in to Vercel..."
    vercel login
fi

# Get the Vercel project name
PROJECT_NAME="aaasc-website"

# Set environment variables
echo "🔄 Setting environment variables..."
vercel env add -y NEXT_PUBLIC_SITE_URL production <<< "https://${PROJECT_NAME}.vercel.app"
vercel env add -y NEXT_PUBLIC_API_URL production <<< "/api"
vercel env add -y ADMIN_EMAIL production <<< "aaascollege2021@gmail.com"

# Generate a secure random secret for auth
AUTH_SECRET=$(openssl rand -hex 32)
vercel env add -y AUTH_SECRET production <<< "${AUTH_SECRET}"

# Set the admin password (you'll be prompted for this)
echo "🔑 Please enter the admin password (or press Enter to use default):"
read -s ADMIN_PASSWORD

if [ -z "$ADMIN_PASSWORD" ]; then
    # Use default password
    ADMIN_PASSWORD="aaascollege@123@123"
    echo "⚠️  Using default admin password. Please change this in production!"
fi

# Hash the password
PASSWORD_HASH=$(echo -n "$ADMIN_PASSWORD" | shasum -a 256 | cut -d' ' -f1)
vercel env add -y ADMIN_PASSWORD_HASH production <<< "${PASSWORD_HASH}"

echo "✅ Environment variables set successfully!"
echo "🔗 Project URL: https://${PROJECT_NAME}.vercel.app"
echo "🔑 Admin email: aaascollege2021@gmail.com"
echo "🔑 Admin password: ${ADMIN_PASSWORD:-[default password]}"
echo "\n🚀 Deploy your project with: vercel --prod"
