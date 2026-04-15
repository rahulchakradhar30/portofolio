#!/usr/bin/env node

import admin from 'firebase-admin';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials
const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

// Hash password function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Setup admin user
async function setupAdmin() {
  try {
    console.log('Setting up admin credentials...\n');

    // Admin credentials
    const email = 'rahulchakradharperepogu@gmail.com';
    const password = 'Admin@123456'; // Default password - user will change after login
    const name = 'Rahul Chakradhar';

    const passwordHash = hashPassword(password);

    // Create admin user in Firestore
    const db = admin.firestore();
    const usersRef = db.collection('admin_users');

    // Check if user already exists
    const existingUser = await usersRef.where('email', '==', email).get();
    
    if (!existingUser.empty) {
      console.log('❌ User already exists. Deleting old user...');
      const docId = existingUser.docs[0].id;
      await usersRef.doc(docId).delete();
      console.log('✅ Old user deleted');
    }

    // Add new admin user
    const docRef = await usersRef.add({
      email,
      name,
      password_hash: passwordHash,
      otp_enabled: false,
      otp_secret: null,
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 IMPORTANT:');
    console.log('1. Go to: https://yourdomain.vercel.app/admin/login');
    console.log('2. Enter the credentials above');
    console.log('3. Click Login');
    console.log('4. Change your password immediately after login\n');
    console.log('Document ID:', docRef.id);
    console.log('Email:', email);
    console.log('Password Hash:', passwordHash.substring(0, 16) + '...');
    console.log('\n✅ Setup complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
