import * as admin from 'firebase-admin';

// Initialize firebase admin with environment variables
const initializeAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  return admin.app();
};

try {
  initializeAdmin();
} catch (error) {
  console.log('Firebase Admin already initialized');
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
