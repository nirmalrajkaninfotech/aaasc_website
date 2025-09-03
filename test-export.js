const { execSync } = require('child_process');
const fs = require('fs');

console.log('Testing Next.js static export...');

try {
  // Clean build
  if (fs.existsSync('.next')) {
    console.log('Cleaning .next directory...');
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('out')) {
    console.log('Cleaning out directory...');
    execSync('rm -rf out', { stdio: 'inherit' });
  }
  
  // Build with verbose output
  console.log('Building with Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  
  // Check if out directory exists
  if (fs.existsSync('out')) {
    console.log('✅ out directory created successfully!');
    const files = fs.readdirSync('out');
    console.log('Files in out directory:', files);
  } else {
    console.log('❌ out directory not created');
    console.log('Checking .next directory...');
    if (fs.existsSync('.next')) {
      const nextFiles = fs.readdirSync('.next');
      console.log('Files in .next directory:', nextFiles);
    }
  }
  
} catch (error) {
  console.error('Error during build:', error.message);
}