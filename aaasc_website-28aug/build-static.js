#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Build script for static export with API calls
async function buildStatic() {
  console.log('🚀 Starting static build with API integration...');
  
  // Ensure API base URL is set for build
  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apiaasc.veetusaapadu.in/';
  console.log(`📡 Using API URL: ${apiUrl}`);
  
  // Set environment variables for build
  const buildEnv = {
    ...process.env,
    NEXT_PUBLIC_BASE_URL: apiUrl,
    NODE_ENV: 'production'
  };
  
  try {
    // Run Next.js build
    console.log('🔨 Building Next.js application...');
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: buildEnv,
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Static build completed successfully!');
        console.log('📁 Output directory: ./out');
        console.log('🌐 Ready for deployment to static hosting');
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
buildStatic();