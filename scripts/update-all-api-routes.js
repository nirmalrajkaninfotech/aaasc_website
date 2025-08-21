const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const TEMPLATE_PATH = path.join(__dirname, 'api-route-template.ts');

// Read the template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Find all route files
function findRouteFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Check if this is a dynamic route (contains [param])
      if (item.name.startsWith('[') && item.name.endsWith(']')) {
        const routePath = path.join(fullPath, 'route.ts');
        if (fs.existsSync(routePath)) {
          results.push(routePath);
        }
      } else {
        results = results.concat(findRouteFiles(fullPath));
      }
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      results.push(fullPath);
    }
  }

  return results;
}

// Update API routes
function updateApiRoutes() {
  const routeFiles = findRouteFiles(API_ROUTES_DIR);
  
  console.log(`Found ${routeFiles.length} API route files to update`);
  
  for (const file of routeFiles) {
    // Skip alumni route as it's already updated
    if (file.includes('alumni/route.ts')) {
      console.log(`Skipping ${path.relative(process.cwd(), file)}`);
      continue;
    }
    
    console.log(`Updating ${path.relative(process.cwd(), file)}`);
    fs.writeFileSync(file, template, 'utf8');
  }
  
  console.log('\nAPI routes updated for static export');
  console.log('Note: You may need to manually update routes that require specific functionality');
}

// Run the update
updateApiRoutes();
