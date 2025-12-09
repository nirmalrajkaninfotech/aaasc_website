# What to Zip for cPanel Static Deployment

## 📦 Answer: Zip the CONTENTS of the `out/` folder

**Important:** Zip the **contents INSIDE** the `out/` folder, NOT the `out/` folder itself.

---

## 🚀 Quick Method: Use the Script

```bash
./zip-for-cpanel.sh
```

This script will:
- ✅ Create the zip file automatically
- ✅ Include .htaccess file
- ✅ Exclude unnecessary files
- ✅ Name it with timestamp

---

## 📋 Manual Method

### Step 1: Navigate to the `out/` folder

```bash
cd out
```

### Step 2: Select ALL files and folders inside

You need to zip:
- ✅ All `.html` files
- ✅ `server/` folder (contains your pages)
- ✅ `static/` folder (contains CSS, JS, images)
- ✅ All `.json` manifest files
- ✅ `.htaccess` file (create if missing)

### Step 3: Create the zip

**On Mac/Linux:**
```bash
cd out
zip -r ../cpanel-static.zip . -x "*.DS_Store" -x "cache/*" -x "diagnostics/*"
```

**On Windows:**
1. Open `out/` folder
2. Select ALL files and folders (Ctrl+A)
3. Right-click → Send to → Compressed (zipped) folder
4. Name it `cpanel-static.zip`

**What to EXCLUDE (don't zip these):**
- ❌ `cache/` folder
- ❌ `diagnostics/` folder  
- ❌ `trace` file
- ❌ `types/` folder
- ❌ `.DS_Store` files (Mac)

---

## 📁 What's Inside the Zip

Your zip should contain:
```
cpanel-static.zip
├── .htaccess                    ← Important for routing!
├── BUILD_ID
├── server/
│   └── app/                     ← Your HTML pages
│       ├── index.html
│       ├── about.html
│       ├── contact.html
│       └── ... (all pages)
├── static/                      ← CSS, JS, images
│   ├── chunks/
│   ├── css/
│   └── ...
├── *.json files                 ← Manifest files
└── ... (other required files)
```

---

## ✅ After Creating the Zip

1. **Upload** `cpanel-static.zip` to cPanel File Manager
2. **Navigate** to `public_html/` (or your domain root)
3. **Extract** the zip file
4. **Set permissions:**
   - Files: `644`
   - Folders: `755`
5. **Test** your website

---

## 🔧 Create .htaccess File

If `.htaccess` is missing, create it in the `out/` folder before zipping:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1/index.html [L]
```

The script (`zip-for-cpanel.sh`) creates this automatically.

---

## ⚠️ Important Notes

1. **Don't zip the `out/` folder itself** - zip what's INSIDE it
2. **Include `.htaccess`** - required for routing to work
3. **Extract to `public_html/`** - not in a subfolder
4. **Set correct permissions** after extraction

---

## 🎯 Summary

**What to zip:** Everything inside `out/` folder  
**Where to upload:** cPanel `public_html/`  
**What to extract:** All files directly to `public_html/` (not in a subfolder)

---

## 💡 Quick Command

```bash
# Run this from project root
./zip-for-cpanel.sh
```

This creates a ready-to-upload zip file! 🎉


