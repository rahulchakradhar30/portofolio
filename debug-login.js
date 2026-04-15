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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

async function debugLogin() {
  try {
    console.log('\n🔍 DEBUG LOGIN SYSTEM\n');

    const email = 'rahulchakradharperepogu@gmail.com';
    const password = 'Admin@123456';

    const db = admin.firestore();
    const usersRef = db.collection('admin_users');

    // 1. Get user from Firestore
    console.log('1️⃣ Looking up user in Firestore...');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('❌ ERROR: User not found in Firestore!');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log('✅ User found in Firestore');
    console.log('   ID:', userDoc.id);
    console.log('   Email:', userData.email);
    console.log('   Name:', userData.name);
    console.log('   Role:', userData.role);
    console.log('   Password Hash:', userData.password_hash ? userData.password_hash.substring(0, 30) + '...' : 'NOT FOUND');

    // 2. Verify password
    console.log('\n2️⃣ Verifying password...');
    console.log('   Input password:', password);
    console.log('   Stored hash:', userData.password_hash ? userData.password_hash.substring(0, 30) + '...' : 'NOT FOUND');

    const expectedHash = hashPassword(password);
    console.log('   Expected hash:', expectedHash.substring(0, 30) + '...');

    const matches = verifyPassword(password, userData.password_hash);
    console.log('   Match result:', matches);

    if (!matches) {
      console.log('\n❌ ERROR: Password does not match!');
      console.log('   This means:');
      console.log('   1. The stored hash is incorrect');
      console.log('   2. The hashing algorithm is different');
      process.exit(1);
    }

    console.log('\n✅ Password verification SUCCESS!');

    // 3. Summary
    console.log('\n3️⃣ Summary for login:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Hash Match:', matches ? 'YES ✅' : 'NO ❌');
    console.log('Status:', userData.status);
    console.log('OTP Enabled:', userData.otp_enabled);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ Backend login should work!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    process.exit(1);
  }
}

debugLogin();
