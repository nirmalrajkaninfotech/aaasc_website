# SPA Deployment Guide

This document outlines the deployment process for the AAASC website as a pure client-side Single Page Application (SPA).

## Overview

The website has been converted from a Next.js SSR application to a pure client-side SPA that can be deployed to any static hosting service (CDN, GitHub Pages, Netlify, etc.).

## Key Changes Made

### 1. Static Export Configuration
- Enabled `output: 'export'` in `next.config.ts`
- Configured for pure client-side rendering
- All pages are pre-built as static HTML files

### 2. Client-Side Routing
- Implemented hash-based routing (`#/about`, `#/contact`, etc.)
- Created `HashRouter` component for client-side navigation
- Updated all navigation links to use hash-based routing
- Navigation works without server-side routing configuration

### 3. API Configuration
- All API calls are made from the browser to the external backend
- API base URL: `https://serveraasc.veetusaapadu.in`
- No server-side API routes in the static build

### 4. Page Components
- Converted all pages to client-side components
- Located in `src/components/pages/`
- Each page handles its own data fetching

## Build Process

```bash
npm run build
```

This creates a `out/` directory with all static files ready for deployment.

## Testing Locally

To test the SPA locally, you can use any static file server:

```bash
# Using Python (if installed)
cd out && python -m http.server 8000

# Using Node.js serve package
npx serve out

# Using PHP (if installed)
cd out && php -S localhost:8000
```

Then visit `http://localhost:8000` and test navigation using hash routes like `http://localhost:8000#/about`

## Deployment

### Option 1: CDN/Static Hosting
1. Upload the entire `out/` directory to your hosting service
2. The `.htaccess` file is included for Apache servers (optional, not required for hash routing)
3. No server configuration needed - works with any static hosting

### Option 2: GitHub Pages
1. Push the `out/` directory contents to your GitHub Pages repository
2. Enable GitHub Pages in repository settings
3. The site will be available at `https://username.github.io/repository-name`

### Option 3: Netlify
1. Drag and drop the `out/` directory to Netlify
2. Or connect your GitHub repository and set build command to `npm run build`
3. Set publish directory to `out`

### Option 4: Vercel/Cloudflare Pages
1. Connect your repository
2. Set build command to `npm run build`
3. Set output directory to `out`

## Navigation

The SPA uses hash-based routing (no server configuration required):
- Home: `#/` or just the base URL
- About: `#/about`
- Contact: `#/contact`
- Gallery: `#/gallery`
- Academics: `#/academics`
- Faculty: `#/faculty`
- Facilities: `#/facilities`
- Placements: `#/placements`
- Achievements: `#/achievements`
- Admin: `#/admin`

## API Integration

All API calls are made from the browser to:
```
https://serveraasc.veetusaapadu.in
```

The application will work entirely client-side, fetching data as needed from the backend API.

## Browser Compatibility

The SPA works in all modern browsers that support:
- ES6+ JavaScript
- Fetch API
- Hash-based routing
- CSS Grid and Flexbox

## Performance

- Initial load includes all necessary JavaScript
- Subsequent navigation is instant (no page reloads)
- Images and assets are loaded on demand
- API data is cached in browser memory during the session
- Hash-based routing eliminates need for server-side routing configuration

## Advantages of Hash-Based Routing

1. **No Server Configuration**: Works on any static hosting without special routing rules
2. **Instant Navigation**: No page reloads, smooth transitions
3. **SEO Friendly**: Modern search engines can index hash-based SPAs
4. **Bookmarkable**: Users can bookmark specific pages
5. **Browser History**: Back/forward buttons work correctly

## Ready for Production

The SPA is now ready for deployment to any static hosting service. The hash-based routing ensures it will work correctly without any server-side configuration.