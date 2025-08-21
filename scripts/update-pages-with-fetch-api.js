const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'src/app/alumni-association/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/collage/[id]/page.tsx',
  'src/app/about/page.tsx',
  'src/app/academics/page.tsx',
  'src/app/achievements/page.tsx',
  'src/app/facilities/[id]/page.tsx',
  'src/app/facilities/page.tsx',
  'src/app/iqac/page.tsx',
  'src/app/placements/page.tsx'
];

// Pattern to match and replace fetch calls
const patterns = [
  {
    // Matches: fetch('/api/...', { ... })
    regex: /const\s+(\w+)\s*=\s*await\s+fetch\((['"]\/api\/[^'"\s]+['"]),\s*\{\s*(?:[^}]*?\n)?\s*headers:\s*\{\s*(?:[^}]*?\n)?\s*\},\s*\}\)\s*;?/g,
    replacement: 'const $1 = await fetchApi($2, { $3 });'
  },
  {
    // Matches: const res = await fetch('/api/...', { cache: 'no-store' });
    regex: /const\s+(\w+)\s*=\s*await\s+fetch\((['"]\/api\/[^'"\s]+['"]),\s*\{\s*cache:\s*['"]no-store['"],?\s*\}\)\s*;?/g,
    replacement: 'const $1 = await fetchApi($2, { cache: \'no-store\' });'
  },
  {
    // Matches: const res = await fetch('/api/...');
    regex: /const\s+(\w+)\s*=\s*await\s+fetch\((['"]\/api\/[^'"\s]+['"])\)\s*;?/g,
    replacement: 'const $1 = await fetchApi($2);'
  }
];

// Process each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    // Add import if not present
    if (!content.includes("from '@/lib/api'")) {
      content = content.replace(
        /import\s+.*\s+from\s+['"]@\/types['"];?/,
        match => `${match}\nimport { fetchApi } from '@/lib/api';`
      );
      updated = true;
    }
    
    // Apply patterns
    patterns.forEach(({ regex, replacement }) => {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } else {
    console.warn(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ All files processed. Please review the changes before committing.');
