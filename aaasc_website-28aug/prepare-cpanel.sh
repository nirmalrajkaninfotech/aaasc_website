#!/bin/bash

# cPanel Deployment Preparation Script
# This script prepares files for cPanel deployment

echo "🚀 AAASC Website - cPanel Deployment Preparation"
echo "================================================"
echo ""

# Check if build exists
if [ ! -d "./out" ]; then
    echo "❌ Error: ./out directory not found!"
    echo "📦 Building the application first..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Please fix errors and try again."
        exit 1
    fi
fi

echo "✅ Build found in ./out directory"
echo ""

# Ask for deployment method
echo "Select deployment method:"
echo "1) Node.js Application (cPanel with Node.js support)"
echo "2) Static Export (Basic cPanel without Node.js)"
read -p "Enter choice [1 or 2]: " choice

case $choice in
    1)
        echo ""
        echo "📋 Node.js Application Deployment"
        echo "================================="
        echo ""
        echo "Files to upload to cPanel:"
        echo "  ✓ out/ (entire directory)"
        echo "  ✓ server.js"
        echo "  ✓ package.json"
        echo "  ✓ data/ (if exists)"
        echo ""
        echo "Steps:"
        echo "1. Upload all files to your cPanel account"
        echo "2. In cPanel, go to 'Node.js Selector' or 'Setup Node.js App'"
        echo "3. Create new Node.js application:"
        echo "   - Application root: /home/username/your-app"
        echo "   - Application URL: / (or subdomain)"
        echo "   - Startup file: server.js"
        echo "   - Node.js version: 18.x or 20.x (LTS)"
        echo "4. Install dependencies: npm install --production"
        echo "5. Set environment variables:"
        echo "   NODE_ENV=production"
        echo "   PORT=3000"
        echo "   NEXT_PUBLIC_BASE_URL=https://yourdomain.com"
        echo "6. Start the application"
        echo ""
        echo "📁 Create deployment package? (y/n)"
        read -p "> " create_package
        if [ "$create_package" = "y" ] || [ "$create_package" = "Y" ]; then
            PACKAGE_NAME="cpanel-nodejs-$(date +%Y%m%d-%H%M%S).tar.gz"
            echo "📦 Creating package: $PACKAGE_NAME"
            tar -czf "$PACKAGE_NAME" out/ server.js package.json data/ 2>/dev/null
            echo "✅ Package created: $PACKAGE_NAME"
            echo "📤 Upload this file to cPanel and extract it"
        fi
        ;;
    2)
        echo ""
        echo "📋 Static Export Deployment"
        echo "============================"
        echo ""
        echo "⚠️  Note: Static export won't support API routes"
        echo ""
        
        # Check if static export is enabled
        if ! grep -q "output: 'export'" next.config.js 2>/dev/null && ! grep -q 'output: "export"' next.config.js 2>/dev/null; then
            echo "⚠️  Static export is not enabled in next.config.js"
            echo "📝 You need to uncomment 'output: export' in next.config.js"
            echo ""
            read -p "Do you want to enable it now? (y/n): " enable_export
            if [ "$enable_export" = "y" ] || [ "$enable_export" = "Y" ]; then
                # Backup config
                cp next.config.js next.config.js.backup
                # Enable export
                sed -i.bak "s|// output: 'export',|output: 'export',|g" next.config.js
                echo "✅ Enabled static export. Rebuilding..."
                npm run build
            fi
        fi
        
        echo ""
        echo "Files to upload to cPanel public_html/:"
        echo "  ✓ All contents from out/ directory"
        echo "  ✓ .htaccess file"
        echo ""
        echo "Steps:"
        echo "1. Upload all files from out/ to public_html/"
        echo "2. Upload .htaccess to public_html/"
        echo "3. Set file permissions:"
        echo "   - Files: 644"
        echo "   - Directories: 755"
        echo ""
        
        # Create .htaccess if it doesn't exist
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
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
EOF
            echo "✅ .htaccess created in out/ directory"
        fi
        
        echo ""
        echo "📁 Create deployment package? (y/n)"
        read -p "> " create_package
        if [ "$create_package" = "y" ] || [ "$create_package" = "Y" ]; then
            PACKAGE_NAME="cpanel-static-$(date +%Y%m%d-%H%M%S).tar.gz"
            echo "📦 Creating package: $PACKAGE_NAME"
            cd out && tar -czf "../$PACKAGE_NAME" . && cd ..
            echo "✅ Package created: $PACKAGE_NAME"
            echo "📤 Upload this file to cPanel public_html/ and extract it"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Preparation complete!"
echo ""
echo "📚 For detailed instructions, see: CPANEL_DEPLOYMENT.md"
echo ""


