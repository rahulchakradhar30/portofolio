#!/usr/bin/env node
/**
 * Delete all existing environment variables from Vercel, then upload fresh ones from .env.local
 * This ensures a clean slate - all old variables removed, all new ones uploaded
 * 
 * Usage: node update-env-to-vercel.js
 */

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('\n🚀 Vercel Environment Variables Update (Delete All + Upload Fresh)');
  console.log('====================================================================\n');

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

  console.log(`\n✅ Found ${envVars.length} environment variables\n`);

  // Step 3: Confirm action
  console.log('⚠️  WARNING: This will:');
  console.log('  1. DELETE ALL existing environment variables from Vercel');
  console.log('  2. UPLOAD all variables from .env.local as fresh ones');
  console.log('  3. Set all variables to Production, Preview, and Development');
  console.log('\nVariables to upload:');
  envVars.forEach(v => console.log(`  • ${v.key}`));
  console.log('');

  const confirm = await question('Are you sure? (type "DELETE AND UPLOAD" to confirm): ');
  
  if (confirm !== 'DELETE AND UPLOAD') {
    console.log('❌ Cancelled\n');
    rl.close();
    process.exit(0);
  }

  // Step 4: Get credentials
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

  console.log('\nℹ️  Need your Vercel API Token');
  console.log('Create one at: https://vercel.com/account/tokens\n');
  const apiToken = await question('Enter API Token: ');

  rl.close();

  // Step 5: Get all existing variables
  console.log('\n📋 Fetching existing variables from Vercel...');
  let existingVars = [];
  
  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      existingVars = data.envs || [];
      console.log(`✅ Found ${existingVars.length} existing variables\n`);
    } else {
      console.error('⚠️  Could not fetch existing variables (will skip deletion)\n');
    }
  } catch (error) {
    console.error(`⚠️  Error fetching variables: ${error.message}\n`);
  }

  // Step 6: Delete existing variables
  if (existingVars.length > 0) {
    console.log('🗑️  Deleting existing variables...');
    let deletedCount = 0;
    let deleteFailedCount = 0;

    for (const envVar of existingVars) {
      process.stdout.write(`  ⏳ Deleting ${envVar.key}... `);
      
      try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envVar.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('✅');
          deletedCount++;
        } else {
          console.log('❌');
          deleteFailedCount++;
        }
      } catch (error) {
        console.log('❌');
        deleteFailedCount++;
      }
    }

    console.log(`✅ Deleted: ${deletedCount} variables`);
    if (deleteFailedCount > 0) {
      console.log(`⚠️  Failed to delete: ${deleteFailedCount} variables`);
    }
  }

  // Step 7: Upload fresh variables
  console.log('\n📤 Uploading fresh variables to Vercel...');
  let uploadedCount = 0;
  let failedCount = 0;

  for (const envVar of envVars) {
    const { key, value } = envVar;
    process.stdout.write(`  ⏳ Uploading ${key}... `);

    try {
      // Determine if variable is plain (public) or sensitive (private)
      const type = key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'sensitive';
      
      // Sensitive variables can only be in production and preview, not development
      const target = type === 'sensitive' ? ['production', 'preview'] : ['production', 'preview', 'development'];

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
          target
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

  // Step 8: Summary
  console.log('\n========================================');
  console.log('📊 Update Summary');
  console.log('========================================');
  console.log(`✅ Uploaded: ${uploadedCount} variables`);
  
  if (failedCount > 0) {
    console.log(`❌ Failed: ${failedCount} variables`);
  }

  if (failedCount === 0 && uploadedCount > 0) {
    console.log('\n🎉 SUCCESS! All variables updated in Vercel\n');
    console.log('📋 Next Steps:');
    console.log('  1. Go to: https://vercel.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Settings → Environment Variables');
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
