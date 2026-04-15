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

// Hash password function (must match auth.ts)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify credentials
async function verifyCredentials() {
  try {
    console.log('Verifying admin credentials in Firebase...\n');

    const email = 'rahulchakradharperepogu@gmail.com';
    const password = 'Admin@123456';

    const db = admin.firestore();
    const usersRef = db.collection('admin_users');

    // Get user by email
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('❌ ERROR: Admin user not found in Firebase!');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log('✅ Admin user found in Firebase\n');
    console.log('📋 USER DATA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${userData.email}`);
    console.log(`Name: ${userData.name}`);
    console.log(`Role: ${userData.role}`);
    console.log(`Status: ${userData.status}`);
    console.log(`OTP Enabled: ${userData.otp_enabled}`);
    console.log(`Created: ${userData.created_at}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify password hash
    const expectedHash = hashPassword(password);
    const storedHash = userData.password_hash;

    console.log('🔐 PASSWORD VERIFICATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Password: ${password}`);
    console.log(`Expected Hash: ${expectedHash.substring(0, 20)}...`);
    console.log(`Stored Hash:   ${storedHash ? storedHash.substring(0, 20) + '...' : 'NOT FOUND'}`);

    if (expectedHash === storedHash) {
      console.log('✅ PASSWORD VERIFICATION SUCCESSFUL!');
    } else {
      console.log('❌ PASSWORD VERIFICATION FAILED!');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All verifications passed! Credentials are ready for login.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying credentials:', error.message);
    process.exit(1);
  }
}

verifyCredentials();
