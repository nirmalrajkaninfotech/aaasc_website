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

// Pattern to match and replace
const patterns = [
  {
    // Matches: fetch(`http://localhost:3000/api/...`)
    // Or: fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/...`)
    regex: /(fetch\([`'"])[^\s`'"']*(?:(?:\.env\.NEXT_PUBLIC_BASE_URL\s*\|\|\s*['"]?http:\/\/localhost:3000['"]?)|(?:http:\/\/localhost:3000))?([^\s`'"']*\/api\/[^\s`'"']*[`'"])/g,
    replacement: (match, p1, p2) => {
      // If it's a template literal with a path, just keep the path
      if (p2) return `${p1}/api/${p2.split('/api/').pop()}`;
      // If it's a direct URL, convert to relative
      return p1 + '/api/' + match.split('/api/').pop();
    }
  },
  {
    // Matches: const response = await axios.get('http://localhost:3000/api/...')
    regex: /(axios\.(?:get|post|put|delete|patch|request)\([`'"])[^\s`'"']*(?:(?:\.env\.NEXT_PUBLIC_BASE_URL\s*\|\|\s*['"]?http:\/\/localhost:3000['"]?)|(?:http:\/\/localhost:3000))?([^\s`'"']*\/api\/[^\s`'"']*[`'"])/g,
    replacement: (match, p1, p2) => {
      if (p2) return `${p1}/api/${p2.split('/api/').pop()}`;
      return p1 + '/api/' + match.split('/api/').pop();
    }
  }
];

// Process each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
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
