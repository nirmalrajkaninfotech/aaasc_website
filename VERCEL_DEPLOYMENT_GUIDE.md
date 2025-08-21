# Vercel Deployment Fix Guide

## Problem
Your deployed site at https://aaasc-website.vercel.app is getting errors because it's trying to connect to `localhost:5000` (admin server) which doesn't exist in production.

## Solution 1: Use Frontend-Only Mode (Recommended for now)

Since your admin server isn't deployed yet, your site will work with fallback data. The configuration has been updated to handle this automatically.

## Solution 2: Deploy Admin Server (Future)

If you want to deploy the admin server later, you can:
1. Deploy the admin server to a service like Railway, Render, or Heroku
2. Update the environment variables in Vercel to point to your deployed admin server

## Current Configuration

The site now automatically detects the environment:
- **Development**: Uses `http://localhost:5000/api` (admin server)
- **Production**: Uses `https://aaasc-website.vercel.app/api` (frontend with fallback)

## Steps to Fix Vercel Deployment

### 1. Redeploy with Updated Code
```bash
git add .
git commit -m "Fix production API configuration"
git push
```

Vercel will automatically redeploy with the updated configuration.

### 2. Verify Environment Variables in Vercel Dashboard
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Make sure you have:
   ```
   NEXT_PUBLIC_API_URL=https://aaasc-website.vercel.app
   NEXT_PUBLIC_BASE_URL=https://aaasc-website.vercel.app
   ```

### 3. Test the Deployment
After redeployment, your site should work with fallback data instead of trying to connect to the non-existent admin server.

## How It Works Now

1. **In Development**: Connects to local admin server for real data
2. **In Production**: Uses fallback data and doesn't try to connect to external servers
3. **Automatic Detection**: The config automatically detects the environment

## Next Steps

1. **Immediate**: Redeploy to fix the current error
2. **Future**: Deploy admin server if you need dynamic content management
3. **Optional**: Set up custom domain in Vercel

Your site will now work in production with the existing content and fallback data!
