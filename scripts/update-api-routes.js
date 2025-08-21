const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = path.join(__dirname, '..', 'src', 'app', 'api');

// Common template for API routes
const API_ROUTE_TEMPLATE = `// This route is disabled for static export
// For static sites, we'll use client-side data fetching directly from JSON files

import { NextRequest, NextResponse } from 'next/server';

// This tells Next.js this route should be treated as static
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}`;;

// Find all API route files
function findRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Check if this is a dynamic route (contains [param])
      if (item.name.startsWith('[') && item.name.endsWith(']')) {
        const routePath = path.join(fullPath, 'route.ts');
        if (fs.existsSync(routePath)) {
          files.push(routePath);
        }
      } else {
        files.push(...findRouteFiles(fullPath));
      }
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      files.push(fullPath);
    }
  }

  return files;
}

// Update API routes for static export
function updateApiRoutes() {
  const routeFiles = findRouteFiles(API_ROUTES_DIR);
  
  console.log(`Found ${routeFiles.length} API route files to update`);
  
  for (const file of routeFiles) {
    console.log(`Updating ${path.relative(process.cwd(), file)}`);
    fs.writeFileSync(file, API_ROUTE_TEMPLATE, 'utf8');
  }
  
  console.log('\nAPI routes updated for static export');
  console.log('Note: You may need to manually update routes that require specific functionality');
}

// Run the update
updateApiRoutes();
