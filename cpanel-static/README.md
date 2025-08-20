# 🌐 cPanel Deployment Guide (No Node.js Required)

## 📁 What's in this folder:

- `index.html` - Main landing page
- `static/` - CSS, JavaScript, and other assets
- `uploads/` - Your uploaded images
- `img/` - Static images

## 🚀 How to deploy to cPanel:

### Step 1: Upload to cPanel
1. Log into your cPanel
2. Go to **File Manager**
3. Navigate to `public_html/` (or your domain's root folder)
4. Upload **ALL** files from this `cpanel-static` folder

### Step 2: Set permissions
- Set folders to **755**
- Set files to **644**

### Step 3: Test your site
- Visit your domain
- You should see the AAASC landing page

## ⚠️ Important Notes:

- **No Node.js needed** - This is pure HTML/CSS/JS
- **Static hosting only** - Admin features won't work
- **Images will display** - All your uploaded images are included
- **Responsive design** - Works on mobile and desktop

## 🔧 To add more pages:

1. Create new HTML files in the root
2. Link them in your navigation
3. Upload to cPanel

## 📞 Need the full website?

For the complete Next.js website with admin features, you'll need:
- Node.js hosting (Vercel, Netlify, etc.)
- Or cPanel with Node.js support

## 🎨 Customization:

Edit `index.html` to:
- Change colors
- Add more content
- Update contact information
- Modify the design

---
**Created for AAASC College Website**
