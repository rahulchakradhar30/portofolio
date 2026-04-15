import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Track initialization state
let isInitializing = false;

// Initialize firebase admin with service account credentials (lazy initialization)
const initializeAdmin = () => {
  if (admin.apps.length > 0) {
    console.log('Firebase Admin already initialized, reusing existing instance');
    return admin.app();
  }

  if (isInitializing) {
    console.log('Firebase Admin initialization already in progress');
    return admin.app();
  }

  console.log('Initializing Firebase Admin...');
  isInitializing = true;
  
  try {
    // Try to load from firebase-credentials.json first
    const credentialsPath = path.join(process.cwd(), 'firebase-credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      console.log('Loading Firebase credentials from firebase-credentials.json');
      const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log('Firebase Admin initialized successfully from credentials file');
      return admin.app();
    }
    
    // Fallback to environment variables
    console.log('Loading Firebase credentials from environment variables');
    
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Missing Firebase credentials in environment variables and no credentials file found');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('Firebase Admin initialized successfully from environment variables');
    return admin.app();
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
};

// Lazy getters to avoid initialization issues during build
export const getAdminAuth = () => {
  try {
    // Initialize only when actually needed (runtime, not build time)
    if (admin.apps.length === 0) {
      initializeAdmin();
    }
    return admin.auth();
  } catch (error) {
    console.error('Error getting admin auth:', error);
    throw error;
  }
};

export const getAdminDb = () => {
  try {
    // Initialize only when actually needed (runtime, not build time)
    if (admin.apps.length === 0) {
      initializeAdmin();
    }
    return admin.firestore();
  } catch (error) {
    console.error('Error getting admin firestore:', error);
    throw error;
  }
};
