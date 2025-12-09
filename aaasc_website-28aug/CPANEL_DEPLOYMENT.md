# cPanel Deployment Guide

This guide covers deploying the AAASC website to cPanel hosting.

## Prerequisites

- cPanel access
- FTP/SFTP access or File Manager access
- Node.js support (if using Node.js deployment method)
- Build completed (`npm run build`)

## Deployment Methods

### Method 1: Node.js Application (Recommended if cPanel supports Node.js)

If your cPanel hosting supports Node.js applications (cPanel Node.js Selector), use this method.

#### Step 1: Build the Application

```bash
npm run build
```

#### Step 2: Prepare Files for Upload

Upload the following to your cPanel account:

**Required Files:**
- `out/` - Entire build output directory
- `server.js` - Next.js server file
- `package.json` - Dependencies
- `node_modules/` - Or install via SSH/terminal

**Optional (if using admin server):**
- `admin-server/` - Admin server directory
- `data/` - JSON data files

#### Step 3: Configure Node.js in cPanel

1. Log into cPanel
2. Find **"Node.js Selector"** or **"Setup Node.js App"**
3. Create a new Node.js application:
   - **Node.js version**: Select latest LTS (18.x or 20.x)
   - **Application root**: `/home/username/your-app-name`
   - **Application URL**: `/` (or subdomain)
   - **Application startup file**: `server.js`
   - **Application mode**: Production

#### Step 4: Install Dependencies

In the Node.js terminal or via SSH:

```bash
cd ~/your-app-name
npm install --production
```

#### Step 5: Set Environment Variables

In cPanel Node.js app settings, add environment variables:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### Step 6: Start the Application

The Node.js app should auto-start. If not, restart it from cPanel.

---

### Method 2: Static Export (For Basic cPanel without Node.js)

⚠️ **Note**: This method won't support API routes or server-side features. Use only if you have a separate API server.

#### Step 1: Enable Static Export

Edit `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',  // Uncomment this line
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ... rest of config
};
```

#### Step 2: Build Static Export

```bash
npm run build
```

#### Step 3: Upload to cPanel

1. Log into cPanel File Manager
2. Navigate to `public_html/` (or your domain's root directory)
3. Upload **all contents** from the `out/` directory
4. Ensure `.htaccess` file is in the root

#### Step 4: Configure .htaccess

Create or update `.htaccess` in `public_html/`:

```apache
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
```

#### Step 5: Set File Permissions

Set proper permissions:
- **Files**: 644
- **Directories**: 755
- **.htaccess**: 644

---

## Quick Deployment Script

Use the provided deployment script:

```bash
chmod +x deploy-cpanel.sh
./deploy-cpanel.sh
```

This will:
1. Verify the build exists
2. Show deployment instructions
3. Display .htaccess configuration

---

## File Structure After Deployment

### For Node.js Method:
```
/home/username/your-app/
├── out/              # Build output
├── server.js         # Server file
├── package.json      # Dependencies
├── node_modules/     # Installed packages
└── data/             # JSON data files (optional)
```

### For Static Method:
```
public_html/
├── index.html
├── _next/
├── about/
├── contact/
├── .htaccess
└── ... (all static files)
```

---

## Troubleshooting

### Issue: 404 Errors on Routes

**Solution**: Ensure `.htaccess` is properly configured and `RewriteEngine` is enabled.

### Issue: API Routes Not Working

**Solution**: 
- For Node.js method: Ensure the server is running
- For static method: API routes won't work - use external API server

### Issue: Images Not Loading

**Solution**: 
- Check image paths are correct
- Ensure `public/uploads/` directory exists and has correct permissions
- Verify `images.unoptimized: true` in `next.config.js`

### Issue: Build Fails on cPanel

**Solution**: 
- Use `npm run cpanel-build` which has increased memory limits
- Or build locally and upload the `out/` directory

### Issue: Node.js App Won't Start

**Solution**:
- Check Node.js version compatibility
- Verify `server.js` is the startup file
- Check error logs in cPanel
- Ensure all dependencies are installed

---

## Environment Variables

If using Node.js method, set these in cPanel:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

For API configuration, update `src/config.ts` with your production API URL.

---

## Admin Server Deployment (Separate)

If you need the admin server running separately:

1. Upload `admin-server/` directory
2. Create a separate Node.js app for admin server
3. Configure it to run on a different port (e.g., 3001)
4. Update API URLs in frontend config

---

## Testing After Deployment

1. Visit your domain: `https://yourdomain.com`
2. Test all pages:
   - Home page
   - About page
   - Gallery pages
   - Contact page
3. Test API endpoints (if using Node.js method)
4. Check browser console for errors
5. Verify images load correctly

---

## Maintenance

### Updating the Site

1. Make changes locally
2. Run `npm run build`
3. Upload new `out/` directory contents
4. Restart Node.js app (if using Node.js method)

### Backing Up

Regularly backup:
- `data/` directory (JSON files)
- `public/uploads/` directory (images)
- Database (if using one)

---

## Support

For issues specific to:
- **Next.js**: Check Next.js documentation
- **cPanel**: Contact your hosting provider
- **Deployment**: Review this guide and error logs

---

## Additional Notes

- Some cPanel hosts may have file size limits for uploads
- Consider using Git deployment if available
- Use SFTP for faster file transfers
- Monitor server resources in cPanel

