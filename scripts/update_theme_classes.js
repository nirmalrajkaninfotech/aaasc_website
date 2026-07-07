const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../src/components'),
  path.join(__dirname, '../src/app')
];

// Classes to replace
const replacements = [
  // Backgrounds
  { regex: /bg-gradient-to-br from-slate-50 via-white to-blue-50\/30/g, replacement: 'bg-[var(--theme-bg)]' },
  { regex: /bg-gradient-to-br from-blue-50 to-white/g, replacement: 'bg-[var(--theme-bg-secondary)]' },
  { regex: /bg-gray-100/g, replacement: 'bg-[var(--theme-bg-secondary)]' },
  { regex: /bg-slate-50/g, replacement: 'bg-[var(--theme-bg-secondary)]' },
  { regex: /bg-gray-50/g, replacement: 'bg-[var(--theme-bg-secondary)]' },
  { regex: /bg-white(?!\/)/g, replacement: 'bg-[var(--theme-bg-card)]' },
  { regex: /bg-white\/([0-9]+)/g, replacement: 'bg-[var(--theme-bg-card)]/$1' },
  
  // Texts
  { regex: /text-gray-900/g, replacement: 'text-[var(--theme-text)]' },
  { regex: /text-gray-800/g, replacement: 'text-[var(--theme-text)]' },
  { regex: /text-gray-700/g, replacement: 'text-[var(--theme-text)]' },
  { regex: /text-gray-600/g, replacement: 'text-[var(--theme-text-secondary)]' },
  { regex: /text-gray-500/g, replacement: 'text-[var(--theme-text-secondary)]' },
  
  // Borders
  { regex: /border-gray-200/g, replacement: 'border-[var(--theme-border)]' },
  { regex: /border-gray-300/g, replacement: 'border-[var(--theme-border)]' },
  { regex: /border-white\/20/g, replacement: 'border-[var(--theme-border)]' },
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Skip admin directory
    if (stat.isDirectory()) {
      if (file === 'admin') {
        console.log(`Skipping admin directory: ${fullPath}`);
        continue;
      }
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      // Process file
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const dir of targetDirs) {
  processDirectory(dir);
}
console.log('Theme class replacement complete.');
