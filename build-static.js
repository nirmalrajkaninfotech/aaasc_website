#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build script for pure client-side SPA
async function buildStatic() {
  console.log('🚀 Starting pure client-side SPA build...');
  
  // Ensure API base URL is set for build
  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://serveraasc.veetusaapadu.in';
  console.log(`📡 Using API URL: ${apiUrl}`);
  
  // Set environment variables for build
  const buildEnv = {
    ...process.env,
    NEXT_PUBLIC_BASE_URL: apiUrl,
    NODE_ENV: 'production'
  };
  
  try {
    // Run Next.js build with static export
    console.log('🔨 Building Next.js application for static export...');
    const buildProcess = spawn('npx', ['next', 'build'], {
      stdio: 'inherit',
      env: buildEnv,
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('📦 Copying static files to out directory...');
        
        // Copy static files manually since Next.js 15 export isn't working as expected
        exec('mkdir -p out/_next && cp -r .next/server/app/* out/ && cp -r .next/static out/_next/', (error) => {
          if (error) {
            console.error('❌ Error copying files:', error);
            process.exit(1);
          }
          
          // Fix directory structure - copy index.html to subdirectories
          console.log('🔧 Fixing directory structure for proper routing...');
          
          const directories = ['about', 'academics', 'achievements', 'admin', 'admission-forms', 
                              'alumni-association', 'categories', 'contact', 'exam-cell', 
                              'facilities', 'faculty', 'gallery', 'iqac', 'login', 'others', 'placements'];
          
          directories.forEach(dir => {
            const dirPath = path.join(__dirname, 'out', dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
              // Copy main index.html to each directory as index.html
              const mainIndexPath = path.join(__dirname, 'out', 'index.html');
              const dirIndexPath = path.join(dirPath, 'index.html');
              if (fs.existsSync(mainIndexPath)) {
                fs.copyFileSync(mainIndexPath, dirIndexPath);
                console.log(`📄 Created index.html in /${dir}/`);
              }
            }
          });
          
          console.log('✅ Static SPA build completed successfully!');
          console.log('📁 Output directory: ./out');
          
          // Create a comprehensive .htaccess for client-side routing
          const htaccessContent = `
# Enable client-side routing for SPA
RewriteEngine On
RewriteBase /

# Set default index file
DirectoryIndex index.html

# Handle client-side routing - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/_next/
RewriteRule ^(.*)$ /index.html [L,QSA]

# Ensure index.html is served for directories
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^(.*)$ $1/index.html [L]

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
`;
          
          try {
            fs.writeFileSync(path.join(__dirname, 'out', '.htaccess'), htaccessContent.trim());
            console.log('📄 Created comprehensive .htaccess for client-side routing');
          } catch (error) {
            console.warn('⚠️  Could not create .htaccess file:', error.message);
          }
          
          // Create Netlify _redirects file
          const netlifyRedirects = `
# Netlify redirects for SPA
/*    /index.html   200
`;
          
          try {
            fs.writeFileSync(path.join(__dirname, 'out', '_redirects'), netlifyRedirects.trim());
            console.log('📄 Created _redirects file for Netlify');
          } catch (error) {
            console.warn('⚠️  Could not create _redirects file:', error.message);
          }
          
          console.log('🌐 Ready for deployment to static hosting (CDN, GitHub Pages, etc.)');
          console.log('💡 All API calls will be made from the browser to your backend');
          console.log('🔗 Navigation uses hash-based routing (#/about, #/contact, etc.)');
        });
      } else {
        console.error('❌ Build failed with code:', code);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Build error:', error);
    process.exit(1);
  }
}

// Run the build
buildStatic();