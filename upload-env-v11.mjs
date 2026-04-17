#!/usr/bin/env node

import fs from 'fs';
import fetch from 'node-fetch';

const token = 'YOUR_VERCEL_TOKEN_HERE'; // Get from https://vercel.com/account/tokens
const teamId = 'YOUR_TEAM_ID_HERE';
const projectId = 'portofolio'; // Use project name

console.log('\n🚀 Starting Environment Variable Upload to Vercel\n');

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
const failures = [];

(async () => {
  for (const env of envVars) {
    const { key, value } = env;
    process.stdout.write(`  ⏳ Uploading ${key}... `);
    
    try {
      // Determine type: public or sensitive
      const type = key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'sensitive';

      const response = await fetch(`https://api.vercel.com/v11/projects/${teamId}/env`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          type,
          target: ['production', 'preview', 'development'],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅');
        successCount++;
      } else {
        console.log('❌');
        failCount++;
        failures.push({
          key,
          error: result.error?.message || JSON.stringify(result)
        });
      }
    } catch (error) {
      console.log('❌');
      failCount++;
      failures.push({
        key,
        error: error.message
      });
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Successfully Uploaded: ${successCount} variables`);
  console.log(`❌ Failed to Upload: ${failCount} variables`);

  if (failures.length > 0) {
    console.log('\n⚠️  Failed Variables:');
    failures.forEach(f => {
      console.log(`  • ${f.key}: ${f.error}`);
    });
  }

  if (successCount > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Environment variables uploaded successfully!');
    console.log();
    console.log('📝 NEXT STEP: Redeploy on Vercel');
    console.log('   1. Go to: https://vercel.com/dashboard');
    console.log('   2. Click on "portofolio" project');
    console.log('   3. Go to "Deployments" tab');
    console.log('   4. Click on the latest deployment');
    console.log('   5. Click "Redeploy"');
    console.log('   6. Wait 2-3 minutes for deployment');
    console.log('   7. Visit: https://rahulchakradhar.vercel.app/admin/login');
    console.log();
  }
})();
