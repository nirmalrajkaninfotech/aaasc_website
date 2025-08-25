#!/bin/bash

# Static Site Build Script for Next.js
echo "🚀 Building static site for cPanel deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Build the static site
echo "📦 Building Next.js static export..."
npm run build:static

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create a deployment-ready folder
    echo "📁 Preparing deployment folder..."
    
    # Copy static files to a deployment folder
    if [ -d "out" ]; then
        echo "📋 Static files generated in 'out' directory"
        echo "📊 Build statistics:"
        echo "   - Total files: $(find out -type f | wc -l)"
        echo "   - Total size: $(du -sh out | cut -f1)"
        
        # Create a zip file for easy upload
        echo "🗜️  Creating deployment zip..."
        zip -r "static-site-$(date +%Y%m%d-%H%M%S).zip" out/
        
        echo ""
        echo "🎉 Static site build complete!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Upload the contents of the 'out' folder to your cPanel public_html directory"
        echo "2. Or upload and extract the generated zip file"
        echo "3. Make sure your .htaccess file handles routing properly"
        echo ""
        echo "📁 Files ready for deployment in: ./out/"
        
    else
        echo "❌ No 'out' directory found. Build may have failed."
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi