import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, getDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Project, Skill, ContactMessage, PortfolioContent, AdminUser, OTPSchema } from './types';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch {
  console.warn('Firebase initialization in progress or not available');
}

export { db, auth };

// Helper functions for common database operations
export const firebaseHelpers = {
  // Users collection operations
  async getUserByEmail(email: string): Promise<AdminUser | null> {
    if (!db) return null;
    const usersRef = collection(db, 'admin_users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const data = querySnapshot.docs[0].data();
    return { id: querySnapshot.docs[0].id, ...data } as AdminUser;
  },

  async getLatestOTP(email: string, type: string = 'email_verification'): Promise<OTPSchema | null> {
    if (!db) return null;
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
    return { id: querySnapshot.docs[0].id, ...data } as OTPSchema;
  },

  async deleteOTP(otpId: string) {
    if (!db) return;
    const otpRef = doc(db, 'email_otps', otpId);
    await deleteDoc(otpRef);
  },

  async createUser(userData: Record<string, unknown>) {
    if (!db) throw new Error('Database not initialized');
    const usersRef = collection(db, 'admin_users');
    const docRef = await addDoc(usersRef, {
      ...userData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, ...userData } as AdminUser;
  },

  async updateUser(userId: string, userData: Partial<Record<string, unknown>>) {
    if (!db) throw new Error('Database not initialized');
    const userRef = doc(db, 'admin_users', userId);
    await updateDoc(userRef, {
      ...userData,
      updated_at: serverTimestamp(),
    });
    return { id: userId, ...userData } as Partial<AdminUser>;
  },

  // OTP operations
  async storeOTP(email: string, otp: string, expiresAt: Date, type: string = 'email_verification') {
    if (!db) throw new Error('Database not initialized');
    const otpsRef = collection(db, 'email_otps');
    const docRef = await addDoc(otpsRef, {
      email,
      otp,
      type,
      expires_at: expiresAt,
      created_at: serverTimestamp(),
    });
    return { id: docRef.id, email, otp, type, expires_at: expiresAt };
  },

  // Projects operations
  async getAllProjects() {
    if (!db) return [];
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getProjectById(projectId: string) {
    if (!db) return null;
    const projectRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(projectRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async createProject(projectData: Omit<Project, 'id'>) {
    if (!db) throw new Error('Database not initialized');
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      ...projectData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, ...projectData };
  },

  async updateProject(projectId: string, projectData: Partial<Omit<Project, 'id'>>) {
    if (!db) throw new Error('Database not initialized');
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updated_at: serverTimestamp(),
    });
    return { id: projectId, ...projectData };
  },

  async deleteProject(projectId: string) {
    if (!db) throw new Error('Database not initialized');
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  },

  // Skills operations
  async getAllSkills() {
    if (!db) return [];
    const skillsRef = collection(db, 'skills');
    const q = query(skillsRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getSkillById(skillId: string) {
    if (!db) return null;
    const skillRef = doc(db, 'skills', skillId);
    const docSnap = await getDoc(skillRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async createSkill(skillData: Omit<Skill, 'id'>) {
    if (!db) throw new Error('Database not initialized');
    const skillsRef = collection(db, 'skills');
    const docRef = await addDoc(skillsRef, {
      ...skillData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, ...skillData };
  },

  async updateSkill(skillId: string, skillData: Partial<Omit<Skill, 'id'>>) {
    if (!db) throw new Error('Database not initialized');
    const skillRef = doc(db, 'skills', skillId);
    await updateDoc(skillRef, {
      ...skillData,
      updated_at: serverTimestamp(),
    });
    return { id: skillId, ...skillData };
  },

  async deleteSkill(skillId: string) {
    if (!db) throw new Error('Database not initialized');
    const skillRef = doc(db, 'skills', skillId);
    await deleteDoc(skillRef);
  },

  // Portfolio content operations
  async getPortfolioContent() {
    if (!db) return null;
    const contentRef = collection(db, 'portfolio_content');
    const querySnapshot = await getDocs(contentRef);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  },

  async updatePortfolioContent(contentData: Partial<PortfolioContent>) {
    if (!db) throw new Error('Database not initialized');
    const contentRef = collection(db, 'portfolio_content');
    const querySnapshot = await getDocs(contentRef);
    if (querySnapshot.empty) {
      // Create new document if doesn't exist
      const docRef = await addDoc(contentRef, {
        ...contentData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...contentData };
    } else {
      // Update existing document
      const docId = querySnapshot.docs[0].id;
      const contentDocRef = doc(db, 'portfolio_content', docId);
      await updateDoc(contentDocRef, {
        ...contentData,
        updated_at: serverTimestamp(),
      });
      return { id: docId, ...contentData };
    }
  },

  // Contact messages operations
  async getAllMessages(unreadOnly: boolean = false) {
    if (!db) return [];
    const messagesRef = collection(db, 'contact_messages');
    let q;
    if (unreadOnly) {
      q = query(messagesRef, where('is_read', '==', false), orderBy('created_at', 'desc'));
    } else {
      q = query(messagesRef, orderBy('created_at', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateMessage(messageId: string, isRead: boolean) {
    if (!db) throw new Error('Database not initialized');
    const messageRef = doc(db, 'contact_messages', messageId);
    await updateDoc(messageRef, { is_read: isRead });
    return { id: messageId, is_read: isRead };
  },

  async deleteMessage(messageId: string) {
    if (!db) throw new Error('Database not initialized');
    const messageRef = doc(db, 'contact_messages', messageId);
    await deleteDoc(messageRef);
  },

  async createMessage(messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'read' | 'is_read'>) {
    if (!db) throw new Error('Database not initialized');
    const messagesRef = collection(db, 'contact_messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      is_read: false,
      created_at: serverTimestamp(),
    });
    return { id: docRef.id, ...messageData };
  },
};
