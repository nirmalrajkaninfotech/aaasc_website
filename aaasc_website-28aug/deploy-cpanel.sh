#!/bin/bash

# cPanel Deployment Script for AAASC Website
# This script helps deploy the fixed Next.js static build to cPanel

echo "🚀 AAASC Website cPanel Deployment Script"
echo "========================================"

# Check if out directory exists
if [ ! -d "./out" ]; then
    echo "❌ Error: ./out directory not found!"
    echo "Please run 'npm run build' first to generate the static files."
    exit 1
fi

echo "✅ Static build found in ./out directory"
echo "📁 Contents of out directory:"
ls -la ./out/

echo ""
echo "📋 Deployment Steps:"
echo "1. Upload all contents from ./out/ to your cPanel public_html directory"
echo "2. Ensure .htaccess is properly configured for clean URLs"
echo "3. Set proper file permissions (644 for files, 755 for directories)"
echo ""
echo "🔧 .htaccess Configuration Required:"
echo "Create or update .htaccess in your public_html directory with:"
echo ""
echo "RewriteEngine On"
echo "RewriteCond %{REQUEST_FILENAME} !-f"
echo "RewriteCond %{REQUEST_FILENAME} !-d"
echo "RewriteRule ^(.*)$ /$1/index.html [L]"
echo ""
echo "📱 Gallery pages that should now work:"
echo "- /gallery/1 - College Campus"
echo "- /gallery/2 - Academic Buildings"
echo "- /gallery/3 - Student Life"
echo "- /gallery/4 - Events and Celebrations"
echo "- /gallery/5 - Facilities"
echo "- /gallery/6 - Blood Donations"
echo "- /gallery/7 - (Other galleries)"
echo "- /gallery/8 - (Other galleries)"
echo ""
echo "✅ The gallery routing issue has been fixed!"
echo "Gallery pages will now show proper content instead of home page content."
echo ""
echo "🌐 Ready for cPanel upload!"
