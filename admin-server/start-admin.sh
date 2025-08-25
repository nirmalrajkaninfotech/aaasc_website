#!/bin/bash

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing admin server dependencies..."
    npm install
fi

# Start the admin server
echo "Starting admin API server..."
npm run dev