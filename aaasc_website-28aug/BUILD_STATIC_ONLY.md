# Build Static Site Only (No Server)

## ✅ Step 1: Enable Static Export

I've already enabled static export in your config files. The `output: 'export'` is now uncommented.

---

## 🔨 Step 2: Build Static Files

Run this command:

```bash
npm run build
```

This will create a **pure static export** with:
- ✅ HTML files directly in `out/` folder
- ✅ No server needed
- ✅ Ready for cPanel static hosting

---

## 📦 Step 3: Create Zip for cPanel

After build completes, create zip:

```bash
./zip-for-cpanel.sh
```

Or manually:
1. Go into `out/` folder
2. Select ALL files
3. Create zip file
4. Name it `cpanel-static.zip`

---

## 📤 Step 4: Upload to cPanel

1. Login to cPanel
2. Open **File Manager**
3. Go to `public_html/`
4. Upload the zip file
5. Extract it
6. **Important:** Make sure files are directly in `public_html/`, not in a subfolder

---

## 🔧 Step 5: Create .htaccess for Static Files

Create `.htaccess` in `public_html/` with this content:

```apache
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
</IfModule>
```

---

## 📁 Expected File Structure (After Static Build)

```
out/
├── index.html          ← Homepage (not in server/app/)
├── about/
│   └── index.html
├── contact/
│   └── index.html
├── _next/
│   └── static/        ← CSS, JS, images
└── ... (other pages)
```

**NOT this (server build):**
```
out/
└── server/
    └── app/
        └── index.html  ← This is server build, not static
```

---

## ✅ Verification

After building, check:
- [ ] Files are directly in `out/` (not in `server/app/`)
- [ ] You see `index.html` in `out/` root
- [ ] You see `_next/` folder (not `static/` at root)
- [ ] No `server/` folder structure

---

## 🚀 Quick Commands

```bash
# 1. Build static export
npm run build

# 2. Create zip
./zip-for-cpanel.sh

# 3. Upload zip to cPanel and extract
```

---

## ⚠️ Important Notes

1. **Static export = No server needed**
   - Files are pure HTML/CSS/JS
   - No Node.js required
   - Works on any web hosting

2. **API routes won't work**
   - Static export doesn't support API routes
   - Use external API server if needed
   - Or use client-side API calls to external server

3. **File structure is different**
   - Static: Files in `out/` root
   - Server: Files in `out/server/app/`

---

## 🔄 If You Already Uploaded Server Build

If you already uploaded the server build:

1. **Delete old files** from `public_html/`
2. **Rebuild** with static export (steps above)
3. **Upload new static files**
4. **Create `.htaccess`** for static routing

---

## ✅ That's It!

After these steps, you'll have a **pure static site** that runs on cPanel without any server! 🎉



