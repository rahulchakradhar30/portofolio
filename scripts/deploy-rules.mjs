import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'firebase-credentials.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-credentials.json not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const rulesPath = path.join(process.cwd(), 'firestore.rules');

if (!fs.existsSync(rulesPath)) {
  console.error('❌ Error: firestore.rules file not found');
  process.exit(1);
}

const rulesContent = fs.readFileSync(rulesPath, 'utf8');

async function deployRules() {
  try {
    console.log('\n🔐 Deploying Firestore Security Rules...\n');

    // Get ID token from service account
    const credential = admin.credential.cert(serviceAccount);
    const { access_token } = await credential.getAccessToken();

    const projectId = serviceAccount.project_id;
    const rulesUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;

    console.log(`📤 Uploading rules to ${projectId}...\n`);

    // Step 1: Create ruleset
    const createRulesetResponse = await fetch(rulesUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent,
            },
          ],
        },
      }),
    });

    if (!createRulesetResponse.ok) {
      const error = await createRulesetResponse.text();
      console.error('❌ Failed to create ruleset:', error);
      throw new Error(error);
    }

    const rulesetData = await createRulesetResponse.json();
    const rulesetName = rulesetData.name;
    console.log(`✅ Ruleset created: ${rulesetName}`);

    // Step 2: Release ruleset
    const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;
    const releaseResponse = await fetch(releaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `projects/${projectId}/releases/cloud.firestore`,
        rulesetName: rulesetName,
      }),
    });

    if (!releaseResponse.ok) {
      const error = await releaseResponse.text();
      console.error('❌ Failed to release rules:', error);
      throw new Error(error);
    }

    const releaseData = await releaseResponse.json();
    console.log(`✅ Rules released: ${releaseData.name}\n`);

    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ Security Rules Deployed!           ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Your Firebase is now fully configured!\n');
    console.log('Next: npm run dev');
    console.log('Then: http://localhost:3000/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment error:', error);
    console.error('\n📝 Manual option:');
    console.error('1. Run: firebase login');
    console.error('2. Run: firebase deploy --only firestore:rules --project rahul-portofolio\n');
    process.exit(1);
  }
}

deployRules();
