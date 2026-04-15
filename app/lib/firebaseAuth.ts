'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs} from 'firebase/firestore';
import type { AdminUser } from './types';

// Lazy getters for Firebase instances
let cachedAuth: any = null;
let cachedDb: any = null;

const getAuth = async () => {
  if (!cachedAuth) {
    const { auth } = await import('./firebase');
    cachedAuth = auth;
  }
  return cachedAuth;
};

const getDb = async () => {
  if (!cachedDb) {
    const { db } = await import('./firebase');
    cachedDb = db;
  }
  return cachedDb;
};

// Generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Firebase
export const storeOTP = async (email: string, otp: string, type: string = 'email_verification') => {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const otpsRef = collection(db, 'email_otps');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
  
  await setDoc(doc(otpsRef), {
    email,
    otp,
    type,
    created_at: new Date(),
    expires_at: expiresAt,
    verified: false,
  });
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string, type: string = 'email_verification') => {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const otpsRef = collection(db, 'email_otps');
  const q = query(
    otpsRef,
    where('email', '==', email),
    where('type', '==', type),
    where('otp', '==', otp)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const otpDoc = querySnapshot.docs[0];
  const otpData = otpDoc.data();
  
  if (otpData.expires_at.toDate() < new Date()) {
    return null; // OTP expired
  }
  
  return otpDoc;
};

// Firebase Login
export const firebaseLogin = async (email: string, password: string) => {
  try {
    const auth = await getAuth();
    if (!auth) throw new Error('Auth not initialized');
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Firebase login error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Firebase Register
export const firebaseRegister = async (email: string, password: string, name: string) => {
  try {
    const auth = await getAuth();
    const db = await getDb();
    if (!auth || !db) throw new Error('Auth or Database not initialized');
    await setPersistence(auth, browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store admin user in Firestore
    const adminUser: AdminUser = {
      id: result.user.uid,
      email,
      name,
      password_hash: 'hashed_via_firebase', // Firebase handles this
      otp_enabled: false,
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      last_login: new Date(),
    };
    
    await setDoc(doc(db, 'admin_users', result.user.uid), adminUser);
    
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Firebase register error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Firebase Logout
export const firebaseLogout = async () => {
  try {
    const auth = await getAuth();
    if (!auth) throw new Error('Auth not initialized');
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Firebase logout error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Get current user session
export const getCurrentAdminUser = async (callback: (user: unknown) => void) => {
  const auth = await getAuth();
  const firebaseHelpers = await import('./firebase').then((m) => m.default);
  
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const adminUser = await firebaseHelpers.getUserByEmail(firebaseUser.email || '');
      callback(adminUser);
    } else {
      callback(null);
    }
  });
};
