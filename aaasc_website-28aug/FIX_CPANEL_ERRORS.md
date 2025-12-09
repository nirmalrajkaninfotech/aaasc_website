# Fix cPanel Deployment Errors

## 🔍 Common Issues & Solutions

Based on your directory listing at `demoaasc.xesstechlink.com`, here are the likely issues:

---

## ❌ Issue 1: Missing .htaccess File

**Problem:** No `.htaccess` file visible in the directory listing.

**Solution:**
1. Create `.htaccess` file in the root directory
2. Add this content:

```apache
RewriteEngine On

# Handle Next.js static export routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /server/app/$1/index.html [L]

# If index.html exists, serve it
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ /server/app/index.html [L]

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
```

3. Upload `.htaccess` to the root directory
4. Set permissions to `644`

---

## ❌ Issue 2: Files in Wrong Location

**Problem:** Files might be in root instead of `public_html/`

**Solution:**
1. Check if you're in `public_html/` directory
2. If files are in root (`/`), move them to `public_html/`
3. In cPanel File Manager:
   - Select all files
   - Cut them
   - Navigate to `public_html/`
   - Paste them

---

## ❌ Issue 3: HTML Files in server/app/ Directory

**Problem:** Your HTML files are in `server/app/` but routing expects them in root.

**Solution A: Move HTML files to root (Recommended for static)**

1. In File Manager, go to `server/app/` folder
2. Select all `.html` files
3. Cut them
4. Go back to root (`public_html/`)
5. Paste them
6. Also move folders like `about/`, `contact/`, etc. to root

**Solution B: Update .htaccess to point to server/app/**

Use the `.htaccess` content above which routes to `server/app/`

---

## ❌ Issue 4: 404 Errors on Pages

**Problem:** Pages return 404 error

**Solution:**
1. Check if `.htaccess` exists and has correct content
2. Verify `RewriteEngine` is enabled (check with hosting provider)
3. Check file permissions (644 for files, 755 for folders)
4. Verify HTML files exist in correct location

---

## ❌ Issue 5: White Screen / Blank Page

**Problem:** Website shows blank page

**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Verify `static/` folder exists and has files
3. Check if CSS/JS files are loading (Network tab in F12)
4. Verify file paths are correct

---

## ❌ Issue 6: Images Not Loading

**Problem:** Images don't display

**Solution:**
1. Check if `static/` folder has image files
2. Verify image paths in HTML
3. Check file permissions on images (644)
4. Clear browser cache (Ctrl+F5)

---

## 🔧 Step-by-Step Fix

### Step 1: Create .htaccess File

1. In cPanel File Manager, go to root directory
2. Click **"New File"**
3. Name it: `.htaccess`
4. Paste the content from Issue 1 above
5. Save
6. Set permissions to `644`

### Step 2: Check File Structure

Your structure should be:
```
public_html/ (or root)
├── .htaccess          ← Must be here
├── server/
│   └── app/
│       ├── index.html
│       ├── about.html
│       └── ...
├── static/
│   ├── chunks/
│   └── css/
└── *.json files
```

### Step 3: Verify Permissions

1. Select all files
2. Right-click → Change Permissions
3. Files: `644`
4. Folders: `755`
5. Check "Recurse into subdirectories"

### Step 4: Test

1. Visit: `https://demoaasc.xesstechlink.com`
2. Check browser console (F12) for errors
3. Test navigation links

---

## 🎯 Quick Fix Script

If you have SSH access, run:

```bash
cd /path/to/your/website/root

# Create .htaccess
cat > .htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /server/app/$1/index.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ /server/app/index.html [L]
EOF

# Set permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 644 .htaccess
```

---

## 📋 Diagnostic Checklist

Run through these to identify the issue:

- [ ] `.htaccess` file exists in root
- [ ] `.htaccess` has `RewriteEngine On`
- [ ] Files are in `public_html/` (not root `/`)
- [ ] HTML files exist in `server/app/` or root
- [ ] File permissions: 644 (files), 755 (folders)
- [ ] `static/` folder exists with CSS/JS files
- [ ] Browser console shows no errors
- [ ] Network tab shows files loading (200 status)

---

## 🔍 Check Error Logs

1. In cPanel, go to **"Error Log"** or **"Metrics → Errors"**
2. Look for recent errors
3. Common errors:
   - `mod_rewrite not enabled` → Contact hosting
   - `Permission denied` → Fix file permissions
   - `File not found` → Check file paths

---

## 💡 Most Likely Fix

Based on your directory listing, you probably need:

1. **Create `.htaccess` file** in root with routing rules
2. **Verify files are in `public_html/`** not root `/`
3. **Set correct permissions** (644/755)

Try these first - they fix 90% of deployment issues!

---

## 📞 Still Not Working?

1. Check cPanel error logs
2. Check browser console (F12)
3. Verify with hosting provider that `mod_rewrite` is enabled
4. Test with a simple `index.html` file first


