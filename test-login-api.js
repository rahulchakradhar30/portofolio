#!/usr/bin/env node

/**
 * Test script for admin login API
 * Run this AFTER starting the dev server: npm run dev
 * Then in another terminal: node test-login-api.js
 */

const http = require('http');

const credentials = {
  email: 'rahulchakradharperepogu@gmail.com',
  password: 'Admin@123456'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📡 RESPONSE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
  console.error('Make sure you ran: npm run dev');
});

console.log('\n🔐 Testing Login API');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Endpoint: http://localhost:3000/api/auth/login');
console.log('Email:', credentials.email);
console.log('Password:', credentials.password);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

req.write(JSON.stringify(credentials));
req.end();
