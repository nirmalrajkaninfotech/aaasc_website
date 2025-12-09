# How to Deploy to cPanel - Step by Step Guide

## 🎯 Choose Your Method First

**Method A: Node.js App** (if cPanel has Node.js support) ✅ Recommended
**Method B: Static Files** (if cPanel doesn't have Node.js)

---

## Method A: Deploy as Node.js Application

### Step 1: Build Your Application

```bash
cd /path/to/aaasc_website-28aug
npm run build
```

Wait for build to complete. You should see "✓ Compiled successfully"

### Step 2: Prepare Files

You need to upload these files/folders to cPanel:
- ✅ `out/` folder (entire folder)
- ✅ `server.js` file
- ✅ `package.json` file
- ✅ `data/` folder (if you have JSON data files)

### Step 3: Upload to cPanel

**Option 1: Using File Manager**
1. Login to cPanel
2. Open **File Manager**
3. Navigate to your domain's root (usually `public_html` or a subdomain folder)
4. Upload all files using **Upload** button
5. Extract if you uploaded a zip file

**Option 2: Using FTP/SFTP**
1. Use FileZilla or similar FTP client
2. Connect to your cPanel server
3. Upload files to the same location

### Step 4: Setup Node.js App in cPanel

1. In cPanel, find **"Node.js Selector"** or **"Setup Node.js App"**
   - If you don't see it, your hosting might not support Node.js (use Method B instead)

2. Click **"Create Application"** or **"Add Application"**

3. Fill in the form:
   - **Node.js version**: Select latest LTS (18.x or 20.x)
   - **Application root**: `/home/username/your-app-name`
   - **Application URL**: `/` (for main domain) or `/subdomain` (for subdomain)
   - **Application startup file**: `server.js`
   - **Application mode**: `Production`

4. Click **"Create"**

### Step 5: Install Dependencies

1. In the Node.js app settings, find **"Terminal"** or **"Run npm install"**
2. Or use SSH terminal:
   ```bash
   cd ~/your-app-name
   npm install --production
   ```

### Step 6: Set Environment Variables

In Node.js app settings, add these environment variables:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

Replace `https://yourdomain.com` with your actual domain.

### Step 7: Start the Application

1. In Node.js app settings, click **"Restart"** or **"Start"**
2. Wait for it to start (usually takes 30-60 seconds)
3. Check status - should show "Running"

### Step 8: Test Your Site

1. Visit your domain: `https://yourdomain.com`
2. Check if homepage loads
3. Test navigation links
4. Check browser console for errors (F12)

---

## Method B: Deploy as Static Files

### Step 1: Enable Static Export

Edit `next.config.js` and uncomment this line:

```javascript
output: 'export',  // Remove the // to enable
```

So it looks like:
```javascript
const nextConfig = {
  output: 'export',  // ✅ This should be uncommented
  distDir: 'out',
  // ... rest of config
};
```

### Step 2: Build Static Files

```bash
cd /path/to/aaasc_website-28aug
npm run build
```

Wait for build to complete.

### Step 3: Create .htaccess File

Create a file named `.htaccess` in the `out/` folder with this content:

```apache
RewriteEngine On

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1/index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

### Step 4: Upload to cPanel

1. Login to cPanel
2. Open **File Manager**
3. Navigate to `public_html/` (or your domain's root folder)
4. **Delete old files** (backup first if needed)
5. Upload **ALL contents** from the `out/` folder
   - Select all files in `out/` folder
   - Upload them to `public_html/`
   - Make sure `.htaccess` is included

### Step 5: Set File Permissions

1. In File Manager, select all files
2. Right-click → **Change Permissions**
3. Set:
   - **Files**: `644`
   - **Folders**: `755`
   - **.htaccess**: `644`

### Step 6: Test Your Site

1. Visit your domain: `https://yourdomain.com`
2. Test all pages
3. Check if routing works (try `/about`, `/contact`, etc.)

---

## 🔧 Common Issues & Fixes

### Issue: 404 Error on Pages

**Fix:**
- Make sure `.htaccess` is uploaded to root
- Check that `RewriteEngine On` is in `.htaccess`
- Verify file permissions are correct

### Issue: White Screen / Nothing Loads

**Fix:**
- Check browser console (F12) for errors
- Verify all files uploaded correctly
- Check file permissions
- For Node.js: Check if app is running in cPanel

### Issue: Images Not Showing

**Fix:**
- Check if `public/uploads/` folder exists
- Verify image paths are correct
- Check file permissions on image files

### Issue: API Routes Not Working (Static Method)

**Fix:**
- Static export doesn't support API routes
- You need to use external API server
- Or switch to Node.js method (Method A)

### Issue: Node.js App Won't Start

**Fix:**
- Check Node.js version (use 18.x or 20.x)
- Verify `server.js` is the startup file
- Check error logs in cPanel
- Make sure all dependencies installed (`npm install`)

---

## 📋 Quick Checklist

### Before Deployment:
- [ ] Build completed successfully
- [ ] Tested locally
- [ ] Backed up existing site (if updating)

### For Node.js Method:
- [ ] Files uploaded to cPanel
- [ ] Node.js app created
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] App started and running

### For Static Method:
- [ ] Static export enabled in config
- [ ] Build completed
- [ ] `.htaccess` file created
- [ ] All files uploaded to `public_html/`
- [ ] File permissions set correctly

### After Deployment:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Images display
- [ ] No console errors
- [ ] Mobile responsive

---

## 🚀 Quick Commands Reference

```bash
# Build the application
npm run build

# Build with more memory (if build fails)
npm run cpanel-build

# Test locally before deployment
npm run preview
```

---

## 📞 Need Help?

1. **Check logs**: cPanel → Error Logs
2. **Browser console**: Press F12 → Console tab
3. **File permissions**: Make sure files are 644, folders are 755
4. **.htaccess**: Must be in root directory
5. **Node.js**: Check if app is running in cPanel

---

## 💡 Pro Tips

1. **Always backup** before deploying
2. **Test locally first** using `npm run preview`
3. **Use SFTP** for faster uploads
4. **Check file sizes** - some hosts have limits
5. **Monitor resources** in cPanel after deployment

---

## 📝 File Structure After Deployment

### Node.js Method:
```
/home/username/your-app/
├── out/              ← Build output
├── server.js         ← Server file
├── package.json      ← Dependencies
├── node_modules/     ← Installed packages
└── data/             ← JSON data (optional)
```

### Static Method:
```
public_html/
├── index.html        ← Homepage
├── _next/            ← Next.js assets
├── about/            ← About page
├── contact/          ← Contact page
├── .htaccess         ← Routing rules
└── ... (all other files)
```

---

**That's it! Your site should now be live on cPanel.** 🎉


