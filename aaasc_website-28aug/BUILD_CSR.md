# Client-Side Rendering (CSR) Build Guide

## ✅ What is CSR Build?

This build configuration creates a **Client-Side Rendered** static site where:
- ✅ All pages render in the browser (client-side)
- ✅ Data fetching happens in the browser using JavaScript
- ✅ Static HTML files are generated (minimal HTML shell)
- ✅ No server required - works on any static hosting
- ✅ Perfect for cPanel static hosting, Netlify, Vercel, etc.

---

## 🚀 Quick Start

### Build Command

```bash
npm run build:csr
```

Or use the standard build:

```bash
npm run build
```

Both commands will create a CSR static export in the `out/` directory.

---

## 📋 How It Works

### 1. **Client Components**
All pages are marked with `'use client'` directive, ensuring they render in the browser.

### 2. **Client-Side Data Fetching**
- Data is fetched using `useEffect` hooks in React components
- API calls happen in the browser after the page loads
- Uses `fetch()` API to call your backend API

### 3. **Static Export**
- Next.js generates static HTML files
- HTML contains minimal structure (loading states)
- JavaScript bundles handle all rendering
- All content is rendered after JavaScript loads

---

## 🔨 Build Process

1. **Run Build:**
   ```bash
   npm run build:csr
   ```

2. **Output:**
   - Static HTML files in `out/` directory
   - JavaScript bundles in `out/_next/static/`
   - CSS files in `out/_next/static/`
   - All assets ready for static hosting

3. **Deploy:**
   - Upload `out/` contents to your static hosting
   - No server configuration needed
   - Works on cPanel, Netlify, Vercel, GitHub Pages, etc.

---

## 📁 File Structure (After Build)

```
out/
├── index.html          ← Homepage (minimal HTML, renders on client)
├── about/
│   └── index.html     ← About page (client-rendered)
├── contact/
│   └── index.html     ← Contact page (client-rendered)
├── _next/
│   └── static/        ← JavaScript, CSS, images
└── ... (other pages)
```

---

## ⚙️ Configuration

### Next.js Config (`next.config.ts`)

```typescript
{
  output: 'export',        // Static export enabled
  distDir: 'out',          // Output directory
  images: {
    unoptimized: true      // Required for static export
  }
}
```

### Environment Variables

Set your API URL for client-side fetching:

```bash
NEXT_PUBLIC_BASE_URL=https://apiaasc.veetusaapadu.in/
```

---

## 🔄 Data Fetching Flow

### Before (Server-Side Rendering)
```
User Request → Server → Fetch Data → Render HTML → Send to Browser
```

### After (Client-Side Rendering)
```
User Request → Server → Send HTML Shell → Browser → Fetch Data → Render
```

### Example: Home Page

```typescript
'use client';

export default function Home() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch data in browser
    fetch('/api/site')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  if (!data) return <Loading />;
  return <Content data={data} />;
}
```

---

## ✅ Advantages of CSR

1. **No Server Required**
   - Works on any static hosting
   - No Node.js server needed
   - Lower hosting costs

2. **Fast Initial Load**
   - Minimal HTML sent to browser
   - JavaScript loads in parallel
   - Progressive rendering

3. **Dynamic Content**
   - Data fetched from external API
   - Content updates without rebuild
   - Real-time data possible

4. **SEO Considerations**
   - For better SEO, consider SSR or SSG
   - CSR is fine for authenticated/admin pages
   - Use meta tags for basic SEO

---

## ⚠️ Important Notes

### 1. **API Routes Don't Work**
- Static export doesn't support Next.js API routes
- Use external API server (separate backend)
- API calls must be to external URLs

### 2. **Loading States**
- Pages show loading indicators while fetching data
- Users see content after JavaScript loads
- Consider skeleton screens for better UX

### 3. **SEO Impact**
- Search engines may not see content immediately
- Use meta tags in HTML head
- Consider pre-rendering for public pages if SEO is critical

### 4. **CORS Configuration**
- Ensure your API server allows CORS
- Configure CORS headers on backend
- Test API calls from browser console

---

## 🚀 Deployment

### cPanel Static Hosting

1. **Build:**
   ```bash
   npm run build:csr
   ```

2. **Create Zip:**
   ```bash
   ./zip-for-cpanel.sh
   ```

3. **Upload:**
   - Upload zip to cPanel File Manager
   - Extract to `public_html/`
   - Create `.htaccess` for routing (see below)

### .htaccess for CSR

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

## 🔍 Verification

After building, check:

- [ ] Files are in `out/` directory (not `out/server/`)
- [ ] `index.html` exists in `out/` root
- [ ] `_next/static/` folder contains JavaScript bundles
- [ ] HTML files are minimal (just shell structure)
- [ ] No server-side code in output

---

## 🆚 CSR vs SSR vs SSG

| Feature | CSR | SSR | SSG |
|---------|-----|-----|-----|
| Rendering | Browser | Server | Build Time |
| Initial Load | Fast (minimal HTML) | Slower (full HTML) | Fast (full HTML) |
| Data Fetching | Browser | Server | Build Time |
| SEO | Limited | Excellent | Excellent |
| Server Required | No | Yes | No |
| Dynamic Content | Yes | Yes | No (rebuild needed) |

---

## 🎯 When to Use CSR

✅ **Use CSR when:**
- You need dynamic content without server
- SEO is not critical
- You have external API server
- You want simple static hosting
- Admin/authenticated pages

❌ **Don't use CSR when:**
- SEO is critical (use SSR/SSG)
- You need instant content (use SSG)
- No external API available
- Content must be visible without JavaScript

---

## 📝 Summary

**CSR Build = Static HTML + Client-Side JavaScript Rendering**

1. Build creates static HTML files
2. HTML contains minimal structure
3. JavaScript loads and fetches data
4. Content renders in browser
5. No server needed for hosting

**Perfect for:** Static hosting, dynamic content, external APIs, admin panels

---

## ✅ That's It!

Your site is now configured for Client-Side Rendering! 🎉

Run `npm run build:csr` to build your CSR static site.


