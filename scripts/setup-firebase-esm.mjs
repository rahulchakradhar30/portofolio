import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'firebase-credentials.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-credentials.json not found in project root');
  console.error('Please download it from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

let serviceAccount;
try {
  const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(rawData);
} catch (error) {
  console.error('❌ Error reading firebase-credentials.json:', error);
  process.exit(1);
}

// Initialize Firebase Admin only if not already initialized
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// ============================================
// SETUP FUNCTIONS
// ============================================

async function setupCollections() {
  console.log('\n📦 Creating Firestore Collections...\n');

  try {
    // 1. admin_users collection
    console.log('✓ Creating admin_users collection...');
    await db.collection('admin_users').doc('_sample').set({
      id: 'sample_admin_id',
      email: 'admin@example.com',
      name: 'Admin User',
      password_hash: 'hashed_password_here',
      otp_enabled: false,
      otp_secret: '',
      role: 'admin',
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
      last_login: null,
    });
    await db.collection('admin_users').doc('_sample').delete();
    console.log('  ✅ admin_users ready\n');

    // 2. email_otps collection
    console.log('✓ Creating email_otps collection...');
    await db.collection('email_otps').doc('_sample').set({
      email: 'user@example.com',
      otp: '123456',
      type: 'email_verification',
      created_at: admin.firestore.Timestamp.now(),
      expires_at: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 10 * 60 * 1000)
      ),
      verified: false,
    });
    await db.collection('email_otps').doc('_sample').delete();
    console.log('  ✅ email_otps ready\n');

    // 3. portfolio_content collection
    console.log('✓ Creating portfolio_content collection...');
    await db.collection('portfolio_content').doc('_default').set({
      title: 'Your Portfolio',
      bio: 'Your professional bio',
      email: 'contact@example.com',
      phone: '+1234567890',
      location: 'City, Country',
      socials: {
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        twitter: 'https://twitter.com/yourusername',
      },
      resume_url: 'https://example.com/resume.pdf',
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
    });
    console.log('  ✅ portfolio_content ready\n');

    // 4. projects collection
    console.log('✓ Creating projects collection...');
    await db.collection('projects').doc('_sample').set({
      title: 'Sample Project',
      description: 'A sample project to get started',
      image_url: 'https://example.com/project.jpg',
      tech_stack: ['React', 'Node.js', 'Firebase'],
      live_url: 'https://example.com',
      github_url: 'https://github.com/example',
      featured: true,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
      created_by: 'admin_user_id',
    });
    await db.collection('projects').doc('_sample').delete();
    console.log('  ✅ projects ready\n');

    // 5. skills collection
    console.log('✓ Creating skills collection...');
    await db.collection('skills').doc('_sample').set({
      name: 'React',
      category: 'Frontend',
      proficiency: 5,
      years: 3,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
      created_by: 'admin_user_id',
    });
    await db.collection('skills').doc('_sample').delete();
    console.log('  ✅ skills ready\n');

    // 6. contact_messages collection
    console.log('✓ Creating contact_messages collection...');
    await db.collection('contact_messages').doc('_sample').set({
      name: 'Visitor Name',
      email: 'visitor@example.com',
      phone: '+1234567890',
      subject: 'Message Subject',
      message: 'Message content',
      is_read: false,
      created_at: admin.firestore.Timestamp.now(),
      replied_at: null,
    });
    await db.collection('contact_messages').doc('_sample').delete();
    console.log('  ✅ contact_messages ready\n');

    // 7. activity_logs collection
    console.log('✓ Creating activity_logs collection...');
    await db.collection('activity_logs').doc('_sample').set({
      admin_id: 'admin_user_id',
      admin_email: 'admin@example.com',
      action: 'CREATE',
      resource: 'project',
      resource_id: 'project_123',
      resource_name: 'Project Name',
      changes: {
        before: {},
        after: { title: 'Project Name' },
      },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      timestamp: admin.firestore.Timestamp.now(),
    });
    await db.collection('activity_logs').doc('_sample').delete();
    console.log('  ✅ activity_logs ready\n');

    console.log('✅ All 7 collections created successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    return false;
  }
}

async function setupSecurityRules() {
  console.log('📋 Setting up Firestore Security Rules...\n');

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Admin Users Collection
    match /admin_users/{userId} {
      // Only authenticated users can read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;
      // Allow create for new registrations
      allow create: if isAuthenticated();
      // Allow update only to own data
      allow update: if isAuthenticated() && request.auth.uid == userId;
      // Only super admins can delete
      allow delete: if isAdmin() && request.auth.uid != userId;
    }
    
    // Email OTPs Collection
    match /email_otps/{document=**} {
      // Only allow creation (for password reset)
      allow create: if request.resource.data.expires_at > request.time;
      // Allow read, update if authenticated
      allow read, update: if isAuthenticated();
    }
    
    // Portfolio Content (Readable by public, writable by admins)
    match /portfolio_content/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Projects Collection (Readable by public, writable by admins)
    match /projects/{projectId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Skills Collection (Readable by public, writable by admins)
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Contact Messages (Readable by admins, writable by anyone)
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // Activity Logs (Readable by admins, writable by backend only)
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false;
    }
  }
}`;

  try {
    // Save rules to file
    fs.writeFileSync(
      path.join(process.cwd(), 'firestore.rules'),
      rules
    );
    console.log('✅ Security rules saved to firestore.rules');
    console.log('📝 Next step: Deploy rules with: firebase deploy --only firestore:rules\n');
    return true;
  } catch (error) {
    console.error('❌ Error saving security rules:', error);
    return false;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   🔥 Firebase Automatic Setup Script   ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Step 1: Create Collections
    const collectionsCreated = await setupCollections();
    if (!collectionsCreated) throw new Error('Failed to create collections');

    // Step 2: Setup Security Rules
    const rulesCreated = await setupSecurityRules();
    if (!rulesCreated) throw new Error('Failed to setup rules');

    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ Firebase Setup Complete!           ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. Review firestore.rules file');
    console.log('2. Run: firebase deploy --only firestore:rules');
    console.log('3. Go to http://localhost:3000/admin/login to test\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
