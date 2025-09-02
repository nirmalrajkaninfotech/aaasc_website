const fs = require('fs');
const path = require('path');

// List of all page files to update
const pageFiles = [
  'src/app/about/page.tsx',
  'src/app/academics/page.tsx',
  'src/app/achievements/page.tsx',
  'src/app/admin/academics/page.tsx',
  'src/app/admin/gallery/page.tsx',
  'src/app/admin/header/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/alumni-association/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/collage/[id]/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/exam-cell/page.tsx',
  'src/app/facilities/[id]/page.tsx',
  'src/app/facilities/page.tsx',
  'src/app/faculty/[slug]/page.tsx',
  'src/app/faculty/page.tsx',
  'src/app/gallery/page.tsx',
  'src/app/iqac/page.tsx',
  'src/app/login/page.tsx',
  'src/app/others/page.tsx',
  'src/app/page.tsx',
  'src/app/placements/page.tsx'
];

// The hook import to add
const hookImport = "import { useDisableRightClick } from '@/hooks/useDisableRightClick';\n";

// The hook usage code to add
const hookUsage = "  useDisableRightClick();\n";

// The client component directive
const clientDirective = "'use client';\n";

// Process each file
pageFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Check if file exists
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already has the hook
    if (content.includes('useDisableRightClick')) {
      console.log(`Skipping ${filePath} - already has the hook`);
      return;
    }
    
    // Add 'use client' directive and hook import
    if (content.includes("'use client'")) {
      // If already a client component, just add the hook import
      content = content.replace(
        /'use client';?\s*\n/, 
        "'use client';\n" + hookImport
      );
    } else {
      // For server components, add 'use client' and the hook import
      content = clientDirective + hookImport + '\n' + content;
    }
    
    // Add the hook usage at the beginning of the component
    // Handle different component formats
    let updated = false;
    
    // Case 1: export default function Component()
    const functionMatch = content.match(/export\s+default\s+function\s+([A-Z][a-zA-Z0-9_]*)\s*\(/);
    if (functionMatch) {
      const functionStart = functionMatch.index;
      const componentStart = content.indexOf('{', functionStart) + 1;
      content = 
        content.slice(0, componentStart) + 
        '\n  ' + hookUsage + 
        content.slice(componentStart);
      updated = true;
    } 
    // Case 2: const Component = () => {
    else {
      const arrowFunctionMatch = content.match(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\([^)]*\)\s*=>\s*{/);
      if (arrowFunctionMatch) {
        const arrowFunctionStart = arrowFunctionMatch.index;
        const arrowComponentStart = content.indexOf('{', arrowFunctionStart) + 1;
        content = 
          content.slice(0, arrowComponentStart) + 
          '\n  ' + hookUsage + 
          content.slice(arrowComponentStart);
        updated = true;
      }
    }
    
    // Save the file if we made updates
    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    } else {
    } else {
      console.log(`Skipping ${filePath} - could not find component function`);
    }
  } else {
    console.log(`Skipping ${filePath} - file not found`);
  }
});

console.log('All pages have been updated with right-click disable functionality.');
