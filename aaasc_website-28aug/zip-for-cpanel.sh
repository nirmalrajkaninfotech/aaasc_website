#!/bin/bash

# Script to create zip file for cPanel static deployment

echo "📦 Creating zip file for cPanel static deployment..."
echo ""

# Check if out directory exists
if [ ! -d "./out" ]; then
    echo "❌ Error: ./out directory not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

# Check if static export is enabled
if ! grep -q "output: 'export'" next.config.js 2>/dev/null && ! grep -q 'output: "export"' next.config.js 2>/dev/null; then
    echo "⚠️  WARNING: Static export is not enabled in next.config.js"
    echo "For static deployment, you should enable 'output: export' in next.config.js"
    echo ""
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
fi

# Create .htaccess if it doesn't exist in out folder
if [ ! -f "out/.htaccess" ]; then
    echo "📝 Creating .htaccess file..."
    cat > out/.htaccess << 'EOF'
RewriteEngine On

# Handle Next.js static export routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1/index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
EOF
    echo "✅ .htaccess created"
fi

# Create zip file name with timestamp
ZIP_NAME="cpanel-static-$(date +%Y%m%d-%H%M%S).zip"

echo "📦 Creating zip file: $ZIP_NAME"
echo "📁 Zipping contents of 'out/' folder..."

# Navigate to out directory and zip all contents
cd out
zip -r "../$ZIP_NAME" . -x "*.DS_Store" -x "__MACOSX/*" -x "cache/*" -x "diagnostics/*" -x "trace" -x "types/*"
cd ..

# Check if zip was created successfully
if [ -f "$ZIP_NAME" ]; then
    ZIP_SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    echo ""
    echo "✅ Zip file created successfully!"
    echo "📦 File: $ZIP_NAME"
    echo "📊 Size: $ZIP_SIZE"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload $ZIP_NAME to your cPanel File Manager"
    echo "2. Navigate to public_html/ (or your domain root)"
    echo "3. Extract the zip file"
    echo "4. Set file permissions:"
    echo "   - Files: 644"
    echo "   - Folders: 755"
    echo "5. Visit your domain to test"
    echo ""
else
    echo "❌ Error: Failed to create zip file"
    exit 1
fi


