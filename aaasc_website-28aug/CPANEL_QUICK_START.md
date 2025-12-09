# cPanel Deployment - Quick Start Guide

## 🚀 Quick Deployment

### Option 1: Interactive Script (Recommended)

```bash
./prepare-cpanel.sh
```

This script will:
- Check if build exists
- Ask you to choose deployment method
- Prepare files and create deployment package
- Provide step-by-step instructions

### Option 2: Manual Deployment

See `CPANEL_DEPLOYMENT.md` for detailed instructions.

---

## 📋 Two Deployment Methods

### Method 1: Node.js Application
**Use if:** Your cPanel supports Node.js applications

**What to upload:**
- `out/` directory
- `server.js`
- `package.json`
- `data/` directory (optional)

**Steps:**
1. Upload files via FTP/SFTP
2. Create Node.js app in cPanel
3. Set startup file: `server.js`
4. Install dependencies: `npm install --production`
5. Set environment variables
6. Start application

### Method 2: Static Export
**Use if:** Your cPanel doesn't support Node.js

**What to upload:**
- All contents from `out/` directory
- `.htaccess` file

**Steps:**
1. Enable static export in `next.config.js` (uncomment `output: 'export'`)
2. Rebuild: `npm run build`
3. Upload all files from `out/` to `public_html/`
4. Upload `.htaccess` to `public_html/`
5. Set permissions (644 for files, 755 for directories)

⚠️ **Note:** Static export won't support API routes. Use external API server if needed.

---

## 🔧 Required Configuration

### .htaccess File

Create `.htaccess` in your `public_html/` root:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1/index.html [L]
```

See `htaccess-example` for full configuration with compression and caching.

### Environment Variables (Node.js Method)

Set in cPanel Node.js app settings:
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 📦 Build Commands

```bash
# Standard build
npm run build

# Build with increased memory (for cPanel)
npm run cpanel-build

# Build for static export
# (First enable 'output: export' in next.config.js)
npm run build
```

---

## ✅ Testing Checklist

After deployment, test:
- [ ] Home page loads
- [ ] All navigation links work
- [ ] Gallery pages display correctly
- [ ] Images load properly
- [ ] Contact form works (if applicable)
- [ ] No console errors
- [ ] Mobile responsive

---

## 🆘 Troubleshooting

**404 Errors:**
- Check `.htaccess` is uploaded and configured
- Verify `RewriteEngine` is enabled

**API Not Working:**
- Node.js method: Check server is running
- Static method: API routes won't work (use external API)

**Images Not Loading:**
- Check file paths
- Verify `public/uploads/` exists
- Check file permissions

---

## 📚 Full Documentation

For complete instructions, see: `CPANEL_DEPLOYMENT.md`

---

## 💡 Tips

1. **Backup first:** Always backup existing files before deployment
2. **Test locally:** Test the build locally before uploading
3. **Use SFTP:** Faster than FTP for large files
4. **Check logs:** Monitor cPanel error logs for issues
5. **File permissions:** Ensure correct permissions (644/755)

---

## 📞 Support

- Check `CPANEL_DEPLOYMENT.md` for detailed troubleshooting
- Review cPanel documentation from your hosting provider
- Check Next.js deployment documentation

