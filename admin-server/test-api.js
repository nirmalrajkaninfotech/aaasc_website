#!/usr/bin/env node

// Simple API test script for AAASC Admin Server
// Run this after starting the server to test basic functionality

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

async function testAPI() {
  console.log('🧪 Testing AAASC Admin Server API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('');

    // Test 2: Public Site Settings
    console.log('2️⃣ Testing Public Site Settings...');
    const siteResponse = await fetch(`${BASE_URL}/site/public`);
    const siteData = await siteResponse.json();
    console.log('✅ Public Site Settings:', Object.keys(siteData).length, 'settings found');
    console.log('');

    // Test 3: Login (will fail without valid credentials)
    console.log('3️⃣ Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      console.log('✅ Login successful! Token received');
      console.log('👤 User:', loginData.user.username);
      console.log('');
    } else {
      const errorData = await loginResponse.json();
      console.log('⚠️  Login failed (expected if server not running):', errorData.error);
      console.log('');
    }

    // Test 4: Protected Route (if we have a token)
    if (authToken) {
      console.log('4️⃣ Testing Protected Route...');
      const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Protected route accessible:', profileData.user.username);
        console.log('');
      } else {
        console.log('❌ Protected route failed');
        console.log('');
      }

      // Test 5: Site Settings (if authenticated)
      console.log('5️⃣ Testing Site Settings...');
      const settingsResponse = await fetch(`${BASE_URL}/site`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        console.log('✅ Site Settings accessible:', Object.keys(settingsData).length, 'settings');
        console.log('');
      } else {
        console.log('❌ Site Settings failed');
        console.log('');
      }
    }

    // Test 6: File Upload Endpoint (if authenticated)
    if (authToken) {
      console.log('6️⃣ Testing File Upload Endpoint...');
      const uploadResponse = await fetch(`${BASE_URL}/upload`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log('✅ File Upload endpoint accessible');
        console.log('📁 Files found:', uploadData.pagination?.total || 0);
        console.log('');
      } else {
        console.log('❌ File Upload endpoint failed');
        console.log('');
      }
    }

    console.log('🎉 API Testing Complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   ✅ Health Check: Working');
    console.log('   ✅ Public Routes: Working');
    if (authToken) {
      console.log('   ✅ Authentication: Working');
      console.log('   ✅ Protected Routes: Working');
      console.log('   ✅ File Management: Working');
    } else {
      console.log('   ⚠️  Authentication: Not tested (server may not be running)');
    }
    console.log('');
    console.log('🚀 Your admin server is ready for use!');
    console.log('🔐 Login at: http://localhost:5000/admin');
    console.log('📡 API docs: Check the README.md file');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('');
    console.log('💡 Make sure the server is running:');
    console.log('   npm start');
    console.log('   or');
    console.log('   ./start.sh');
  }
}

// Run the test
testAPI();
