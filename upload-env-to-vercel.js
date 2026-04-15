#!/usr/bin/env node
/**
 * Upload Environment Variables to Vercel
 * Reads from .env.local and uploads all variables automatically
 * 
 * Usage: node upload-env-to-vercel.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('\n🚀 Vercel Environment Variables Uploader');
  console.log('========================================\n');

  // Step 1: Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.error('❌ ERROR: .env.local file not found!');
    console.error('Make sure you\'re in the project directory and .env.local exists\n');
    process.exit(1);
  }

  console.log('✅ Found .env.local file');

  // Step 2: Parse .env.local
  console.log('📝 Reading variables from .env.local...');
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = [];

  envContent.split('\n').forEach(line => {
    line = line.trim();
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    if (key && value) {
      envVars.push({ key: key.trim(), value });
      console.log(`  • Found: ${key.trim()}`);
    }
  });

  console.log(`\n✅ Found ${envVars.length} environment variables\n`);

  // Step 3: Confirm before uploading
  console.log('⚠️  This will upload all variables to Vercel (Production, Preview, Development)');
  console.log('Variables to upload:');
  envVars.forEach(v => console.log(`  • ${v.key}`));
  console.log('');

  const confirm = await question('Continue? (type "yes" to confirm): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled\n');
    rl.close();
    process.exit(0);
  }

  // Step 4: Get Project ID
  let projectId = null;
  if (fs.existsSync('vercel.json')) {
    try {
      const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
      projectId = vercelJson.projectId;
    } catch (e) {
      // Continue without projectId from vercel.json
    }
  }

  if (!projectId) {
    console.log('\nℹ️  Need your Vercel Project ID');
    console.log('Find it at: https://vercel.com/dashboard → Select Project → Settings → General\n');
    projectId = await question('Enter Project ID: ');
  }

  // Step 5: Get API Token
  console.log('\nℹ️  Need your Vercel API Token');
  console.log('Create one at: https://vercel.com/account/tokens\n');
  const apiToken = await question('Enter API Token: ');

  rl.close();

  // Step 6: Upload variables
  console.log('\n📤 Uploading variables to Vercel...');
  let uploadedCount = 0;
  let failedCount = 0;

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
        console.log(`    Error: ${error.message || JSON.stringify(error)}`);
        failedCount++;
      }
    } catch (error) {
      console.log('❌');
      console.log(`    Error: ${error.message}`);
      failedCount++;
    }
  }

  // Step 7: Summary
  console.log('\n========================================');
  console.log('📊 Upload Summary');
  console.log('========================================');
  console.log(`✅ Uploaded: ${uploadedCount} variables`);
  
  if (failedCount > 0) {
    console.log(`❌ Failed: ${failedCount} variables`);
  }

  if (failedCount === 0 && uploadedCount > 0) {
    console.log('\n🎉 SUCCESS! All variables uploaded to Vercel\n');
    console.log('📋 Next Steps:');
    console.log('  1. Go to: https://vercel.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Go to Settings → Environment Variables');
    console.log('  4. Verify all variables are there ✅');
    console.log('  5. Go to Deployments → Click last deployment → Redeploy');
    console.log('  6. Wait for build to complete (green ✅)');
    console.log('  7. Test your application!\n');
  } else if (failedCount > 0) {
    console.log('\n⚠️  Some variables failed to upload. Check errors above.\n');
  }
}

main().catch(error => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
