# How to Upload & Run Static Files in cPanel

## 📦 You Have: `cpanel-static-20251209-112006.zip`

Follow these steps to deploy it to cPanel:

---

## Step 1: Login to cPanel

1. Go to your hosting provider's cPanel login page
2. Enter your username and password
3. Click **Login**

---

## Step 2: Open File Manager

1. In cPanel dashboard, find **"File Manager"**
2. Click on it
3. It will open in a new window/tab

---

## Step 3: Navigate to Your Domain Root

1. In File Manager, look for `public_html/` folder
   - This is usually your main domain's root
   - If you have multiple domains, choose the correct one
2. **Double-click** on `public_html/` to open it

**Note:** If deploying to a subdomain, navigate to that subdomain's folder instead.

---

## Step 4: Backup Existing Files (If Any)

⚠️ **Important:** If you have an existing website:

1. Select all files in `public_html/`
2. Right-click → **Compress**
3. Name it `backup-$(date).zip`
4. Download the backup to your computer

---

## Step 5: Upload the Zip File

1. In `public_html/` folder, click **Upload** button (top menu)
2. Click **Select File** or drag and drop
3. Select your zip file: `cpanel-static-20251209-112006.zip`
4. Wait for upload to complete (may take a few minutes)
5. Click **Go Back** or close upload window

---

## Step 6: Extract the Zip File

1. In File Manager, you should see `cpanel-static-20251209-112006.zip`
2. **Right-click** on the zip file
3. Select **Extract** or **Extract All**
4. Choose extraction location: `public_html/`
5. Click **Extract Files**
6. Wait for extraction to complete

---

## Step 7: Move Files to Root (If Needed)

After extraction, check if files are in a subfolder:

**If files are in a subfolder:**
1. Open the extracted folder
2. Select **ALL files and folders** (Ctrl+A or Cmd+A)
3. **Cut** them (Ctrl+X or Cmd+X)
4. Go back to `public_html/`
5. **Paste** them (Ctrl+V or Cmd+V)
6. Delete the empty subfolder

**Files should be directly in `public_html/` like this:**
```
public_html/
├── .htaccess
├── BUILD_ID
├── server/
├── static/
├── index.html (or in server/app/)
└── ... (other files)
```

---

## Step 8: Set File Permissions

1. In `public_html/`, select **ALL files and folders**
2. Right-click → **Change Permissions**
3. Set permissions:
   - **Files**: `644` (read/write for owner, read for others)
   - **Folders/Directories**: `755` (read/write/execute for owner, read/execute for others)
4. Check **"Recurse into subdirectories"**
5. Click **Change Permissions**

**Quick way:**
- Files: `644`
- Folders: `755`

---

## Step 9: Verify .htaccess File

1. Make sure `.htaccess` file exists in `public_html/` root
2. If missing, create it with this content:

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

3. Save the file

---

## Step 10: Clean Up

1. Delete the zip file: `cpanel-static-20251209-112006.zip`
2. (Optional) Delete backup if everything works

---

## Step 11: Test Your Website

1. Open a new browser tab
2. Visit your domain: `https://yourdomain.com`
3. Check if homepage loads
4. Test navigation links:
   - `/about`
   - `/contact`
   - `/gallery`
   - etc.

---

## ✅ Verification Checklist

- [ ] Zip file uploaded
- [ ] Files extracted to `public_html/`
- [ ] Files are in root (not subfolder)
- [ ] `.htaccess` file exists
- [ ] Permissions set (644 for files, 755 for folders)
- [ ] Zip file deleted
- [ ] Website loads in browser
- [ ] All pages work correctly
- [ ] Images display properly
- [ ] No 404 errors

---

## 🔧 Troubleshooting

### Problem: 404 Error on Pages

**Solution:**
1. Check if `.htaccess` exists in root
2. Verify `RewriteEngine On` is in `.htaccess`
3. Check file permissions
4. Make sure files are in `public_html/` root, not subfolder

### Problem: White Screen / Nothing Loads

**Solution:**
1. Check browser console (F12) for errors
2. Verify all files uploaded correctly
3. Check file permissions
4. Make sure `server/` and `static/` folders exist

### Problem: Images Not Showing

**Solution:**
1. Check if `static/` folder exists
2. Verify image paths in browser console
3. Check file permissions on image files
4. Clear browser cache (Ctrl+F5)

### Problem: Files in Wrong Location

**Solution:**
1. If files are in subfolder, move them to `public_html/` root
2. Make sure structure is:
   ```
   public_html/
   ├── .htaccess
   ├── server/
   └── static/
   ```

---

## 📋 Quick Reference

**Upload Location:** `public_html/`  
**File Permissions:** 644 (files), 755 (folders)  
**Required File:** `.htaccess` in root  
**Test URL:** `https://yourdomain.com`

---

## 🎯 Summary

1. ✅ Login to cPanel
2. ✅ Open File Manager
3. ✅ Go to `public_html/`
4. ✅ Upload zip file
5. ✅ Extract zip file
6. ✅ Move files to root (if needed)
7. ✅ Set permissions (644/755)
8. ✅ Verify `.htaccess` exists
9. ✅ Delete zip file
10. ✅ Test website

**That's it! Your static site should now be live!** 🎉

---

## 💡 Pro Tips

1. **Always backup** before uploading
2. **Use SFTP** for faster uploads (FileZilla, WinSCP)
3. **Check file sizes** - some hosts have upload limits
4. **Test on mobile** after deployment
5. **Monitor error logs** in cPanel if issues occur

---

## 📞 Need Help?

- Check cPanel error logs: **cPanel → Errors**
- Check browser console: Press **F12**
- Verify file structure matches expected layout
- Contact hosting support if permissions don't work

