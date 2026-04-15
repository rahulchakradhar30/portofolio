/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// Server-side stubs (exported for SSR)
const createServerStubs = () => ({
  getUserByEmail: async () => null,
  getLatestOTP: async () => null,
  deleteOTP: async () => {},
  createUser: async () => null,
  updateUser: async () => null,
  storeOTP: async () => null,
  getAllProjects: async () => [],
  getProjectById: async () => null,
  createProject: async () => null,
  updateProject: async () => null,
  deleteProject: async () => {},
  getAllSkills: async () => [],
  getSkillById: async () => null,
  createSkill: async () => null,
  updateSkill: async () => null,
  deleteSkill: async () => {},
  getPortfolioContent: async () => null,
  updatePortfolioContent: async () => null,
  getAllMessages: async () => [],
  updateMessage: async () => null,
  deleteMessage: async () => {},
  createMessage: async () => null,
});

// Firebase client initialization (only runs in browser)
let db: any = null;
let auth: any = null;
let initialized = false;

const initializeFirebase = async () => {
  if (initialized || typeof window === 'undefined') return;

  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    initialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

// Client-side helpers
const createClientHelpers = () => {
  return {
    async getUserByEmail(email: string) {
      if (!db) return null;
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const usersRef = collection(db, 'admin_users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const data = querySnapshot.docs[0].data();
      return { id: querySnapshot.docs[0].id, ...data };
    },

    async getLatestOTP(email: string, type: string = 'email_verification') {
      if (!db) return null;
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
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
    },

    async deleteOTP(otpId: string) {
      if (!db) return;
      const { doc, deleteDoc } = await import('firebase/firestore');
      const otpRef = doc(db, 'email_otps', otpId);
      await deleteDoc(otpRef);
    },

    async createUser(userData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const usersRef = collection(db, 'admin_users');
      const docRef = await addDoc(usersRef, {
        ...userData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...userData };
    },

    async updateUser(userId: string, userData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const userRef = doc(db, 'admin_users', userId);
      await updateDoc(userRef, {
        ...userData,
        updated_at: serverTimestamp(),
      });
      return { id: userId, ...userData };
    },

    async storeOTP(email: string, otp: string, expiresAt: Date, type: string = 'email_verification') {
      if (!db) throw new Error('Database not initialized');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
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

    async getAllProjects() {
      if (!db) return [];
      const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    },

    async getProjectById(projectId: string) {
      if (!db) return null;
      const { doc, getDoc } = await import('firebase/firestore');
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(projectRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    async createProject(projectData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...projectData };
    },

    async updateProject(projectId: string, projectData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updated_at: serverTimestamp(),
      });
      return { id: projectId, ...projectData };
    },

    async deleteProject(projectId: string) {
      if (!db) throw new Error('Database not initialized');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
    },

    async getAllSkills() {
      if (!db) return [];
      const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
      const skillsRef = collection(db, 'skills');
      const q = query(skillsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    },

    async getSkillById(skillId: string) {
      if (!db) return null;
      const { doc, getDoc } = await import('firebase/firestore');
      const skillRef = doc(db, 'skills', skillId);
      const docSnap = await getDoc(skillRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    async createSkill(skillData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const skillsRef = collection(db, 'skills');
      const docRef = await addDoc(skillsRef, {
        ...skillData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return { id: docRef.id, ...skillData };
    },

    async updateSkill(skillId: string, skillData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const skillRef = doc(db, 'skills', skillId);
      await updateDoc(skillRef, {
        ...skillData,
        updated_at: serverTimestamp(),
      });
      return { id: skillId, ...skillData };
    },

    async deleteSkill(skillId: string) {
      if (!db) throw new Error('Database not initialized');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const skillRef = doc(db, 'skills', skillId);
      await deleteDoc(skillRef);
    },

    async getPortfolioContent() {
      if (!db) return null;
      const { collection, getDocs } = await import('firebase/firestore');
      const contentRef = collection(db, 'portfolio_content');
      const querySnapshot = await getDocs(contentRef);
      if (querySnapshot.empty) return null;
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    },

    async updatePortfolioContent(contentData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
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
    },

    async getAllMessages(unreadOnly = false) {
      if (!db) return [];
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const messagesRef = collection(db, 'contact_messages');
      const q = unreadOnly
        ? query(messagesRef, where('is_read', '==', false), orderBy('created_at', 'desc'))
        : query(messagesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    },

    async updateMessage(messageId: string, isRead: boolean) {
      if (!db) throw new Error('Database not initialized');
      const { doc, updateDoc } = await import('firebase/firestore');
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, { is_read: isRead });
      return { id: messageId, is_read: isRead };
    },

    async deleteMessage(messageId: string) {
      if (!db) throw new Error('Database not initialized');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const messageRef = doc(db, 'contact_messages', messageId);
      await deleteDoc(messageRef);
    },

    async createMessage(messageData: Record<string, any>) {
      if (!db) throw new Error('Database not initialized');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const messagesRef = collection(db, 'contact_messages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        is_read: false,
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...messageData };
    },
  };
};

// Export appropriate helpers based on environment
const firebaseHelpers = typeof window === 'undefined' ? createServerStubs() : createClientHelpers();

export default firebaseHelpers;
export { db, auth, initializeFirebase };
