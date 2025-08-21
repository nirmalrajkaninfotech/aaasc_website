# AAASC Website Startup Guide

## Problem
Your Next.js frontend is getting a `ECONNREFUSED` error because it's trying to connect to the admin server, which isn't running.

## Solution

### Option 1: Start Both Servers (Recommended)
1. Install the new dependency:
   ```bash
   npm install
   ```

2. Start both servers simultaneously:
   ```bash
   npm run dev:full
   ```

This will start:
- Frontend (Next.js) on http://localhost:3000
- Admin Server (Express.js) on http://localhost:5000

### Option 2: Start Servers Separately
1. **Terminal 1** - Start the admin server:
   ```bash
   cd admin-server
   npm install  # if you haven't already
   npm run dev
   ```

2. **Terminal 2** - Start the frontend:
   ```bash
   npm run dev
   ```

### Option 3: Use Public Endpoints Only
The frontend has been updated to use public endpoints and provide fallback data if the admin server is unavailable. You can run just the frontend:
```bash
npm run dev
```

## What Was Fixed

1. **Updated layout.tsx** to use the public API endpoint (`/api/site/public`) instead of the authenticated one
2. **Added fallback data** so the site works even when the admin server is down
3. **Added convenience scripts** to start both servers easily

## API Endpoints

- **Public endpoints** (no authentication required):
  - `/api/site/public` - Site settings
  - `/api/collages/public` - Collage information
  - `/api/academics/public` - Academic programs

- **Admin endpoints** (authentication required):
  - `/api/site` - Site settings management
  - `/api/collages` - Collage management
  - `/api/achievements` - Achievements management
  - And more...

## Environment Configuration

Make sure you have a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Troubleshooting

- **Port 5000 already in use**: Change the port in `admin-server/server.js` or kill the process using that port
- **Database errors**: Check that `admin-server/database/admin.db` exists and is accessible
- **CORS issues**: Verify the `FRONTEND_URL` in admin server environment matches your frontend URL
