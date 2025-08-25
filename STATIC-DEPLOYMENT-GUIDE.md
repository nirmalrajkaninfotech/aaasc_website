# Static Site Deployment Guide

This guide will help you convert your dynamic Next.js website to static files and deploy them to cPanel.

## What Was Changed

### 1. Next.js Configuration
- Added `output: 'export'` to enable static export
- Configured `trailingSlash: true` for better hosting compatibility
- Set `images.unoptimized: true` for static hosting

### 2. Data Handling
- Created `src/lib/data.ts` to replace API calls with direct JSON imports
- Updated dynamic routes to use `generateStaticParams()` for static generation
- Converted async server components to regular components where possible

### 3. Dynamic Routes
Updated these dynamic routes for static generation:
- `/collage/[id]` - Gallery detail pages
- `/facilities/[id]` - Facility detail pages  
- `/faculty/[slug]` - Faculty detail pages

## Building Static Files

### Option 1: Using the Build Script
```bash
./build-static.sh
```

### Option 2: Manual Build
```bash
npm run build:static
```

## Deployment Steps

### 1. Build the Static Site
Run the build command to generate static files in the `out` directory.

### 2. Upload to cPanel
1. Access your cPanel File Manager
2. Navigate to `public_html` directory
3. Upload all contents from the `out` folder
4. Make sure the `.htaccess` file is uploaded for proper routing

### 3. Verify Deployment
- Visit your domain to check the homepage
- Test navigation to different pages
- Verify that images and assets load correctly

## Important Notes

### Limitations of Static Export
- **No API Routes**: All `/api/*` routes won't work in static export
- **No Server-Side Features**: No server-side rendering or API calls at runtime
- **Admin Panel**: The admin panel (`/admin/*`) won't work as it relies on API routes

### What Still Works
- All public pages (Home, About, Academics, etc.)
- Gallery and collage detail pages
- Faculty and facilities pages
- Static content and images
- Client-side navigation

### Data Updates
Since this is now a static site, to update content you'll need to:
1. Modify the JSON files in the `data/` folder
2. Rebuild the static site
3. Re-upload to cPanel

## File Structure After Build

```
out/
├── index.html              # Homepage
├── about/
│   └── index.html         # About page
├── academics/
│   └── index.html         # Academics page
├── collage/
│   ├── 2/
│   │   └── index.html     # Collage detail pages
│   ├── 3/
│   │   └── index.html
│   └── ...
├── _next/                 # Next.js static assets
├── uploads/               # Your uploaded images
└── .htaccess             # Server configuration
```

## Troubleshooting

### Images Not Loading
- Ensure all images in `/uploads/` and `/public/` are uploaded
- Check that image paths in JSON files are correct

### Pages Not Found (404)
- Verify `.htaccess` file is uploaded and configured correctly
- Check that all required HTML files are in the `out` directory

### Routing Issues
- Make sure trailing slashes are consistent
- Verify that the `.htaccess` rewrite rules are working

## Performance Tips

1. **Image Optimization**: Consider optimizing images before upload
2. **Caching**: The `.htaccess` file includes caching headers
3. **Compression**: Enable gzip compression on your server if possible

## Updating Content

To update your static site:

1. **Edit Data Files**: Modify JSON files in the `data/` folder
2. **Rebuild**: Run `./build-static.sh` or `npm run build:static`
3. **Re-upload**: Upload the new `out` folder contents to cPanel

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Verify all files uploaded correctly
3. Test locally first with `npx serve out`
4. Check cPanel error logs if available