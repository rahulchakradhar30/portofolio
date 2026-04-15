/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: any = null;
let db: any = null;
let auth: any = null;

try {
  if (typeof window !== 'undefined') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Client helpers
const firebaseHelpers = {
  // User management
  getUserByEmail: async (email: string) => {
    if (!db) return null;
    try {
      const usersRef = collection(db, 'admin_users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const data = querySnapshot.docs[0].data();
      return { id: querySnapshot.docs[0].id, ...data };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  createUser: async (userData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const usersRef = collection(db, 'admin_users');
      const docRef = await addDoc(usersRef, {
        ...userData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const userRef = doc(db, 'admin_users', userId);
      await updateDoc(userRef, {
        ...userData,
        updated_at: serverTimestamp(),
      });
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // OTP management
  storeOTP: async (email: string, otp: string, expiresAt: Date, type: string = 'email_verification') => {
    if (!db) throw new Error('Database not initialized');
    try {
      const otpsRef = collection(db, 'email_otps');
      const docRef = await addDoc(otpsRef, {
        email,
        otp,
        type,
        expires_at: expiresAt,
        created_at: serverTimestamp(),
        verified: false,
      });
      return { id: docRef.id, email, otp, type, expires_at: expiresAt };
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
  },

  getLatestOTP: async (email: string, type: string = 'email_verification') => {
    if (!db) return null;
    try {
      const otpsRef = collection(db, 'email_otps');
      const q = query(
        otpsRef,
        where('email', '==', email),
        where('type', '==', type),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const data = querySnapshot.docs[0].data();
      return { id: querySnapshot.docs[0].id, ...data };
    } catch (error) {
      console.error('Error getting OTP:', error);
      return null;
    }
  },

  deleteOTP: async (otpId: string) => {
    if (!db) return;
    try {
      const otpRef = doc(db, 'email_otps', otpId);
      await deleteDoc(otpRef);
    } catch (error) {
      console.error('Error deleting OTP:', error);
    }
  },

  // Project management
  getAllProjects: async () => {
    if (!db) return [];
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  },

  getProjectById: async (projectId: string) => {
    if (!db) return null;
    try {
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(projectRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  },

  createProject: async (projectData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...projectData };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (projectId: string, projectData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updated_at: serverTimestamp(),
      });
      return { id: projectId, ...projectData };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Skills management
  getAllSkills: async () => {
    if (!db) return [];
    try {
      const skillsRef = collection(db, 'skills');
      const q = query(skillsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting skills:', error);
      return [];
    }
  },

  getSkillById: async (skillId: string) => {
    if (!db) return null;
    try {
      const skillRef = doc(db, 'skills', skillId);
      const docSnap = await getDoc(skillRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting skill:', error);
      return null;
    }
  },

  createSkill: async (skillData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const skillsRef = collection(db, 'skills');
      const docRef = await addDoc(skillsRef, {
        ...skillData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...skillData };
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  updateSkill: async (skillId: string, skillData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const skillRef = doc(db, 'skills', skillId);
      await updateDoc(skillRef, {
        ...skillData,
        updated_at: serverTimestamp(),
      });
      return { id: skillId, ...skillData };
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  deleteSkill: async (skillId: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const skillRef = doc(db, 'skills', skillId);
      await deleteDoc(skillRef);
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  },

  // Portfolio content
  getPortfolioContent: async () => {
    if (!db) return null;
    try {
      const contentRef = collection(db, 'portfolio_content');
      const querySnapshot = await getDocs(contentRef);
      if (querySnapshot.empty) return null;
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } catch (error) {
      console.error('Error getting portfolio content:', error);
      return null;
    }
  },

  updatePortfolioContent: async (contentData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const contentRef = collection(db, 'portfolio_content');
      const querySnapshot = await getDocs(contentRef);
      if (querySnapshot.empty) {
        const docRef = await addDoc(contentRef, {
          ...contentData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        return { id: docRef.id, ...contentData };
      }
      const docId = querySnapshot.docs[0].id;
      const contentDocRef = doc(db, 'portfolio_content', docId);
      await updateDoc(contentDocRef, {
        ...contentData,
        updated_at: serverTimestamp(),
      });
      return { id: docId, ...contentData };
    } catch (error) {
      console.error('Error updating portfolio content:', error);
      throw error;
    }
  },

  // Messages management
  getAllMessages: async (unreadOnly = false) => {
    if (!db) return [];
    try {
      const messagesRef = collection(db, 'contact_messages');
      const q = unreadOnly
        ? query(messagesRef, where('is_read', '==', false), orderBy('created_at', 'desc'))
        : query(messagesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  updateMessage: async (messageId: string, isRead: boolean) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, { is_read: isRead });
      return { id: messageId, is_read: isRead };
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  createMessage: async (messageData: Record<string, any>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const messagesRef = collection(db, 'contact_messages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        is_read: false,
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },
};

export default firebaseHelpers;
export { db, auth };
