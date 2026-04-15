#!/usr/bin/env node
/**
 * Non-Interactive Environment Variables Uploader for Vercel
 * Set VERCEL_PROJECT_ID and VERCEL_API_TOKEN environment variables, then run this script
 * 
 * Usage:
 *   $env:VERCEL_PROJECT_ID = "prj_xxxxx"
 *   $env:VERCEL_API_TOKEN = "vercel_xxxxx"
 *   node upload-env-to-vercel-auto.js
 */

import fs from 'fs';

async function main() {
  console.log('\n🚀 Vercel Environment Variables Uploader (Auto Mode)');
  console.log('========================================\n');

  // Check environment variables
  const projectId = process.env.VERCEL_PROJECT_ID;
  const apiToken = process.env.VERCEL_API_TOKEN;

  if (!projectId || !apiToken) {
    console.error('❌ ERROR: Missing required environment variables!\n');
    console.error('Please set:');
    console.error('  VERCEL_PROJECT_ID - Your Vercel project ID (prj_xxxxx)');
    console.error('  VERCEL_API_TOKEN - Your Vercel API token (vercel_xxxxx)\n');
    console.error('PowerShell Example:');
    console.error('  $env:VERCEL_PROJECT_ID = "prj_xxxxxxxxxxxxx"');
    console.error('  $env:VERCEL_API_TOKEN = "vercel_xxxxxxxxxxxxx"');
    console.error('  node upload-env-to-vercel-auto.js\n');
    process.exit(1);
  }

  // Step 1: Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.error('❌ ERROR: .env.local file not found!');
    console.error('Make sure you\'re in the project directory\n');
    process.exit(1);
  }

  console.log('✅ Found .env.local file');

  // Step 2: Parse .env.local
  console.log('📝 Reading variables from .env.local...');
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = [];

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    if (key && value) {
      envVars.push({ key: key.trim(), value });
      console.log(`  • Found: ${key.trim()}`);
    }
  });

  console.log(`\n✅ Found ${envVars.length} environment variables`);
  console.log(`📤 Uploading to Vercel (Project: ${projectId})...\n`);

  // Step 3: Upload variables
  let uploadedCount = 0;
  let failedCount = 0;
  const failures = [];

  for (const envVar of envVars) {
    const { key, value } = envVar;
    process.stdout.write(`  ⏳ Uploading ${key}... `);

    try {
      // Determine if variable is plain (public) or sensitive (private)
      // - "plain" for public variables (NEXT_PUBLIC_*)
      // - "sensitive" for secret variables
      const type = key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'sensitive';

      const response = await fetch(`https://api.vercel.com/v8/projects/${projectId}/env`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          type,
          target: ['production', 'preview', 'development']
        })
      });

      if (response.ok) {
        console.log('✅');
        uploadedCount++;
      } else {
        const error = await response.json();
        console.log('❌');
        failures.push(`${key}: ${error.message || JSON.stringify(error)}`);
        failedCount++;
      }
    } catch (error) {
      console.log('❌');
      failures.push(`${key}: ${error.message}`);
      failedCount++;
    }
  }

  // Step 4: Summary
  console.log('\n========================================');
  console.log('📊 Upload Summary');
  console.log('========================================');
  console.log(`✅ Uploaded: ${uploadedCount} variables`);
  
  if (failedCount > 0) {
    console.log(`❌ Failed: ${failedCount} variables\n`);
    console.log('Failed variables:');
    failures.forEach(f => console.log(`  • ${f}`));
  }

  if (failedCount === 0 && uploadedCount > 0) {
    console.log('\n🎉 SUCCESS! All variables uploaded to Vercel\n');
    console.log('📋 Next Steps:');
    console.log('  1. Go to: https://vercel.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Settings → Environment Variables');
    console.log('  4. Verify all variables are there ✅');
    console.log('  5. Go to Deployments → Click last deployment → Redeploy');
    console.log('  6. Wait for build to complete (green ✅)');
    console.log('  7. Test your application!\n');
  } else if (failedCount > 0) {
    console.log('\n⚠️  Some variables failed to upload. See errors above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
