# Hosting Solutions for SPA

## The Directory Listing Issue

If you're seeing directory listings instead of your SPA, it means the server isn't configured to serve `index.html` files properly. Here are solutions for different hosting services:

## ✅ Recommended: Hash-Based Routing (Current Setup)

Since your SPA uses hash-based routing (`#/about`, `#/contact`, etc.), you can avoid server configuration issues entirely:

### Test Locally:
```bash
npx serve out -s
# The -s flag enables SPA mode
```

### URLs to use:
- Home: `https://yoursite.com/`
- About: `https://yoursite.com/#/about`
- Contact: `https://yoursite.com/#/contact`

## 🚀 Hosting Service Solutions

### 1. Netlify (Recommended)
- Drag and drop the `out/` folder to Netlify
- The `_redirects` file will handle routing automatically
- Works perfectly with hash routing

### 2. Vercel
- Connect your GitHub repo
- Set build command: `npm run build`
- Set output directory: `out`
- Vercel automatically handles SPA routing

### 3. GitHub Pages
- Push `out/` contents to your GitHub Pages repo
- Enable GitHub Pages in settings
- Hash routing works without additional configuration

### 4. Traditional Web Hosting (cPanel, etc.)

#### Option A: Use Hash Routing (Easiest)
- Upload `out/` contents to your web root
- Use URLs like `https://yoursite.com/#/about`
- No server configuration needed

#### Option B: Fix .htaccess (If you want clean URLs)
If your hosting supports Apache `.htaccess`:

```apache
# Add this to your .htaccess (already included in build)
RewriteEngine On
DirectoryIndex index.html

# Redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/_next/
RewriteRule ^(.*)$ /index.html [L,QSA]
```

### 5. Nginx
Add this to your nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔧 Quick Fix for Current Issue

Since you're seeing directory listings, try these URLs instead:

1. **Direct index.html access:**
   - `https://demoaaasc.xesstechlink.com/index.html`
   - `https://demoaaasc.xesstechlink.com/about/index.html`

2. **Hash-based routing (recommended):**
   - `https://demoaaasc.xesstechlink.com/#/`
   - `https://demoaaasc.xesstechlink.com/#/about`
   - `https://demoaaasc.xesstechlink.com/#/contact`

## 🎯 Best Solution

**Use hash-based routing** - it works on any hosting service without server configuration:

```
https://yoursite.com/#/about
https://yoursite.com/#/contact  
https://yoursite.com/#/gallery
```

This is exactly what your SPA is designed for and will work perfectly!

## 📱 Update Your Navigation

Make sure all your navigation links use hash-based URLs:
- Internal links: `#/about`, `#/contact`, etc.
- External links to your site: `https://yoursite.com/#/about`

The hash-based routing ensures your SPA works on any hosting service without server-side configuration!