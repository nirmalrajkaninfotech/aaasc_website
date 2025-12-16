#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Build script for Client-Side Rendering (CSR) static export
async function buildCSR() {
  console.log('🚀 Starting Client-Side Rendering (CSR) build...');
  console.log('📝 This build will create static HTML files that render on the client');
  
  // Ensure API base URL is set for build
  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apiaasc.veetusaapadu.in/';
  console.log(`📡 API URL for client-side fetching: ${apiUrl}`);
  
  // Set environment variables for build
  const buildEnv = {
    ...process.env,
    NEXT_PUBLIC_BASE_URL: apiUrl,
    NODE_ENV: 'production'
  };
  
  try {
    // Run Next.js build with static export
    console.log('🔨 Building Next.js application with CSR...');
    console.log('   - Pages will be client-rendered');
    console.log('   - Data fetching happens in the browser');
    console.log('   - Output: Static HTML files in ./out');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: buildEnv,
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ CSR build completed successfully!');
        console.log('📁 Output directory: ./out');
        console.log('🌐 Ready for deployment to static hosting');
        console.log('\n📋 Build Summary:');
        console.log('   ✓ All pages are client-rendered');
        console.log('   ✓ Data fetching happens in browser');
        console.log('   ✓ No server required');
        console.log('   ✓ Works on any static hosting (cPanel, Netlify, Vercel, etc.)');
      } else {
        console.error('❌ Build failed with code:', code);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Build error:', error);
    process.exit(1);
  }
}

// Run the build
buildCSR();


