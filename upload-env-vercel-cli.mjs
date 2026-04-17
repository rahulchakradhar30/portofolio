#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

const token = 'YOUR_VERCEL_TOKEN_HERE'; // Get from https://vercel.com/account/tokens
const projectId = 'YOUR_PROJECT_ID_HERE';

console.log('\n🚀 Uploading Environment Variables to Vercel\n');

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = [];

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').trim();
  
  if (key && value) {
    envVars.push({ key: key.trim(), value });
  }
});

console.log(`📋 Found ${envVars.length} variables to upload\n`);

let successCount = 0;
let failCount = 0;

for (const env of envVars) {
  const { key, value } = env;
  process.stdout.write(`  ⏳ ${key}... `);
  
  try {
    // Use vercel env add to add variable
    // The command format: vercel env add KEY VALUE --token TOKEN --projectId PROJECT_ID
    const cmd = `vercel env add ${key} --token ${token} --projectId ${projectId}`;
    
    // We need to pipe the value to stdin
    execSync(`echo "${value}" | ${cmd}`, { 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10
    });
    
    console.log('✅');
    successCount++;
  } catch (error) {
    console.log('❌');
    failCount++;
    console.log(`    Error: ${error.message}`);
  }
}

console.log(`\n✅ Uploaded: ${successCount} variables`);
console.log(`❌ Failed: ${failCount} variables`);

if (successCount > 0) {
  console.log('\n🎉 Environment variables uploaded to Vercel!');
  console.log('📝 Next: Go to Vercel dashboard → Deployments → Redeploy');
}
