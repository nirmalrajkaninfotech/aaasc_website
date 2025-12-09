#!/bin/bash

# Build script for static export only (no server, no API routes)

echo "🔨 Building static site only (no server needed)..."
echo ""

# Check if we need to temporarily move API routes
if [ -d "src/app/api" ]; then
    echo "📦 Temporarily excluding API routes for static build..."
    mv src/app/api ../api-backup 2>/dev/null || true
fi

# Build the static site
echo "🚀 Running Next.js static build..."
npm run build

# Restore API routes
if [ -d "../api-backup" ]; then
    echo "📦 Restoring API routes..."
    mv ../api-backup src/app/api 2>/dev/null || true
fi

# Check if build was successful
if [ -d "out" ] && [ -f "out/index.html" ] || [ -d "out/_next" ]; then
    echo ""
    echo "✅ Static build completed successfully!"
    echo "📁 Output directory: ./out"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run: ./zip-for-cpanel.sh"
    echo "2. Upload zip to cPanel"
    echo "3. Extract in public_html/"
    echo "4. Add .htaccess file"
    echo ""
else
    echo ""
    echo "❌ Build may have failed. Check the output above."
    exit 1
fi

