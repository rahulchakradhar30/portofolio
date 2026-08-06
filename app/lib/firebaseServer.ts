/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminDb } from './firebaseAdmin';

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedValues(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, removeUndefinedValues(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

// Server-side Firebase helpers using Admin SDK
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const serverFirebaseHelpers = {
  // User management
  getUserByEmail: async (email: string) => {
    try {
      debugLog('Server: Looking up user by email:', email);
      const db = getAdminDb();
      const usersRef = db.collection('admin_users');
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (snapshot.empty) {
        debugLog('Server: User not found in admin_users collection');
        return null;
      }
      
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      debugLog('Server: User found:', data.email);
      return { id: docSnap.id, ...data };
    } catch (error) {
      console.error('Server: Error getting user by email:', error);
      throw error;
    }
  },

  createUser: async (userData: Record<string, any>) => {
    try {
      debugLog('Server: Creating new user:', userData.email);
      const db = getAdminDb();
      const usersRef = db.collection('admin_users');
      const now = new Date();
      const createdAtStr = now.toISOString ? now.toISOString() : now;
      const docRef = await usersRef.add({
        ...userData,
        created_at: createdAtStr,
        updated_at: createdAtStr,
      });
      debugLog('Server: User created with ID:', docRef.id);
      return { id: docRef.id, ...userData, created_at: createdAtStr, updated_at: createdAtStr };
    } catch (error) {
      console.error('Server: Error creating user:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Record<string, any>) => {
    try {
      debugLog('Server: Updating user:', userId);
      const db = getAdminDb();
      const userRef = db.collection('admin_users').doc(userId);
      const now = new Date();
      const updatedAtStr = now.toISOString ? now.toISOString() : now;
      await userRef.update({
        ...userData,
        updated_at: updatedAtStr,
      });
      debugLog('Server: User updated');
      return { id: userId, ...userData, updated_at: updatedAtStr };
    } catch (error) {
      console.error('Server: Error updating user:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  // OTP management
  storeOTP: async (email: string, otp: string, expiresAt: Date, type: string = 'email_verification') => {
    try {
      debugLog('Server: Storing OTP for:', email, 'Type:', type);
      const db = getAdminDb();
      const otpsRef = db.collection('email_otps');
      
      // Convert Date objects to timestamps for Firestore
      const now = new Date();
      const expiresAtStr = expiresAt.toISOString ? expiresAt.toISOString() : expiresAt;
      const createdAtStr = now.toISOString ? now.toISOString() : now;
      
      const docRef = await otpsRef.add({
        email,
        otp,
        type,
        expires_at: expiresAtStr,
        created_at: createdAtStr,
        verified: false,
      });
      debugLog('Server: OTP stored with ID:', docRef.id);
      return { 
        id: docRef.id, 
        email, 
        otp, 
        type, 
        expires_at: expiresAtStr,
        created_at: createdAtStr
      };
    } catch (error) {
      console.error('Server: Error storing OTP:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  getLatestOTP: async (email: string, type: string = 'email_verification') => {
    try {
      debugLog('Server: Getting latest OTP for:', email, 'Type:', type);
      const db = getAdminDb();
      const otpsRef = db.collection('email_otps');
      const snapshot = await otpsRef
        .where('email', '==', email)
        .where('type', '==', type)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        debugLog('Server: No OTP found');
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      debugLog('Server: OTP found');
      return { id: docSnap.id, ...data };
    } catch (error) {
      console.error('Server: Error getting OTP:', error);
      throw error;
    }
  },

  markOTPVerified: async (otpId: string) => {
    try {
      debugLog('Server: Marking OTP as verified:', otpId);
      const db = getAdminDb();
      const now = new Date();
      await db.collection('email_otps').doc(otpId).update({
        verified: true,
        verified_at: now.toISOString ? now.toISOString() : now,
      });
      debugLog('Server: OTP marked as verified');
    } catch (error) {
      console.error('Server: Error marking OTP verified:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  deleteOTP: async (otpId: string) => {
    try {
      debugLog('Server: Deleting OTP:', otpId);
      const db = getAdminDb();
      await db.collection('email_otps').doc(otpId).delete();
      debugLog('Server: OTP deleted');
    } catch (error) {
      console.error('Server: Error deleting OTP:', error);
      throw error;
    }
  },

  // Activity logging
  logActivity: async (email: string, action: string, details: Record<string, any> = {}) => {
    try {
      debugLog('Server: Logging activity:', action, 'for:', email);
      const db = getAdminDb();
      const now = new Date();
      await db.collection('admin_activity_logs').add({
        email,
        action,
        details,
        timestamp: now.toISOString ? now.toISOString() : now,
        ip: details.ip || 'unknown',
      });
    } catch (error) {
      console.error('Server: Error logging activity:', error);
      // Don't throw - logging should not break the main flow
    }
  },

  // Projects management
  getAllProjects: async () => {
    try {
      debugLog('Server: Getting all projects');
      const db = getAdminDb();
      const snapshot = await db.collection('projects').orderBy('created_at', 'desc').get();
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      debugLog('Server: Found', projects.length, 'projects');
      return projects;
    } catch (error) {
      console.error('Server: Error getting projects:', error);
      throw error;
    }
  },

  getProjectById: async (projectId: string) => {
    try {
      debugLog('Server: Getting project:', projectId);
      const db = getAdminDb();
      const docSnap = await db.collection('projects').doc(projectId).get();
      if (!docSnap.exists) {
        debugLog('Server: Project not found');
        return null;
      }
      debugLog('Server: Project found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Server: Error getting project:', error);
      return null;
    }
  },

  createProject: async (projectData: Record<string, any>) => {
    try {
      debugLog('Server: Creating project:', projectData.title);
      const db = getAdminDb();
      const now = new Date();
      const createdAtStr = now.toISOString ? now.toISOString() : now;
      const docRef = await db.collection('projects').add({
        ...projectData,
        created_at: createdAtStr,
        updated_at: createdAtStr,
      });
      debugLog('Server: Project created with ID:', docRef.id);
      return { id: docRef.id, ...projectData, created_at: createdAtStr, updated_at: createdAtStr };
    } catch (error) {
      console.error('Server: Error creating project:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  updateProject: async (projectId: string, projectData: Record<string, any>) => {
    try {
      debugLog('Server: Updating project:', projectId);
      const db = getAdminDb();
      const now = new Date();
      const updatedAtStr = now.toISOString ? now.toISOString() : now;
      const safeProjectData = removeUndefinedValues(projectData);
      await db.collection('projects').doc(projectId).update({
        ...safeProjectData,
        updated_at: updatedAtStr,
      });
      debugLog('Server: Project updated');
      return { id: projectId, ...safeProjectData, updated_at: updatedAtStr };
    } catch (error) {
      console.error('Server: Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      debugLog('Server: Deleting project:', projectId);
      const db = getAdminDb();
      await db.collection('projects').doc(projectId).delete();
      debugLog('Server: Project deleted');
    } catch (error) {
      console.error('Server: Error deleting project:', error);
      throw error;
    }
  },

  // Skills management
  getAllSkills: async () => {
    try {
      debugLog('Server: Getting all skills');
      const db = getAdminDb();
      const snapshot = await db.collection('skills').orderBy('created_at', 'desc').get();
      const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      debugLog('Server: Found', skills.length, 'skills');
      return skills;
    } catch (error) {
      console.error('Server: Error getting skills:', error);
      throw error;
    }
  },

  getSkillById: async (skillId: string) => {
    try {
      debugLog('Server: Getting skill:', skillId);
      const db = getAdminDb();
      const docSnap = await db.collection('skills').doc(skillId).get();
      if (!docSnap.exists) {
        debugLog('Server: Skill not found');
        return null;
      }
      debugLog('Server: Skill found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Server: Error getting skill:', error);
      return null;
    }
  },

  createSkill: async (skillData: Record<string, any>) => {
    try {
      debugLog('Server: Creating skill:', skillData.name);
      const db = getAdminDb();
      const docRef = await db.collection('skills').add({
        ...skillData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      debugLog('Server: Skill created with ID:', docRef.id);
      return { id: docRef.id, ...skillData };
    } catch (error) {
      console.error('Server: Error creating skill:', error);
      throw error;
    }
  },

  updateSkill: async (skillId: string, skillData: Record<string, any>) => {
    try {
      debugLog('Server: Updating skill:', skillId);
      const db = getAdminDb();
      const safeSkillData = removeUndefinedValues(skillData);
      await db.collection('skills').doc(skillId).update({
        ...safeSkillData,
        updated_at: new Date(),
      });
      debugLog('Server: Skill updated');
      return { id: skillId, ...safeSkillData };
    } catch (error) {
      console.error('Server: Error updating skill:', error);
      throw error;
    }
  },

  deleteSkill: async (skillId: string) => {
    try {
      debugLog('Server: Deleting skill:', skillId);
      const db = getAdminDb();
      await db.collection('skills').doc(skillId).delete();
      debugLog('Server: Skill deleted');
    } catch (error) {
      console.error('Server: Error deleting skill:', error);
      throw error;
    }
  },

  // Portfolio content
  getPortfolioContent: async () => {
    try {
      debugLog('Server: Getting portfolio content');
      const db = getAdminDb();
      const snapshot = await db.collection('portfolio_content').limit(1).get();
      if (snapshot.empty) {
        debugLog('Server: No portfolio content found');
        return null;
      }
      const doc = snapshot.docs[0];
      debugLog('Server: Portfolio content found');
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Server: Error getting portfolio content:', error);
      return null;
    }
  },

  updatePortfolioContent: async (contentData: Record<string, any>) => {
    try {
      debugLog('Server: Updating portfolio content');
      const db = getAdminDb();
      const snapshot = await db.collection('portfolio_content').limit(1).get();
      const safeContentData = removeUndefinedValues(contentData);
      
      if (snapshot.empty) {
        // Create new document if doesn't exist
        const docRef = await db.collection('portfolio_content').add({
          ...safeContentData,
          created_at: new Date(),
          updated_at: new Date(),
        });
        debugLog('Server: Portfolio content created');
        return { id: docRef.id, ...safeContentData };
      } else {
        // Update existing document
        const docId = snapshot.docs[0].id;
        await db.collection('portfolio_content').doc(docId).update({
          ...safeContentData,
          updated_at: new Date(),
        });
        debugLog('Server: Portfolio content updated');
        return { id: docId, ...safeContentData };
      }
    } catch (error) {
      console.error('Server: Error updating portfolio content:', error);
      throw error;
    }
  },

  // Messages management
  createContactMessage: async (messageData: Record<string, any>) => {
    try {
      debugLog('Server: Creating contact message');
      const db = getAdminDb();
      const now = new Date();
      const createdAtStr = now.toISOString();

      const docRef = await db.collection('contact_messages').add({
        ...messageData,
        created_at: createdAtStr,
        updated_at: createdAtStr,
        createdAt: createdAtStr,
      });

      debugLog('Server: Contact message created with ID:', docRef.id);
      return { id: docRef.id, ...messageData, created_at: createdAtStr, updated_at: createdAtStr, createdAt: createdAtStr };
    } catch (error) {
      console.error('Server: Error creating contact message:', error);
      throw error;
    }
  },

  createHireRequest: async (requestData: Record<string, any>) => {
    try {
      debugLog('Server: Creating hire request');
      const db = getAdminDb();
      const now = new Date();
      const createdAtStr = now.toISOString();

      const docRef = await db.collection('hire_requests').add({
        ...requestData,
        read: false,
        status: requestData.status || 'new',
        created_at: createdAtStr,
        updated_at: createdAtStr,
        createdAt: createdAtStr,
      });

      debugLog('Server: Hire request created with ID:', docRef.id);
      return { id: docRef.id, ...requestData, read: false, status: requestData.status || 'new', created_at: createdAtStr, updated_at: createdAtStr, createdAt: createdAtStr };
    } catch (error) {
      console.error('Server: Error creating hire request:', error);
      throw error;
    }
  },

  getAllMessages: async (unreadOnly: boolean = false) => {
    try {
      debugLog('Server: Getting messages, unreadOnly:', unreadOnly);
      const db = getAdminDb();
      let query: any = db.collection('contact_messages');
      
      if (unreadOnly) {
        query = query.where('read', '==', false);
      }
      
      const snapshot = await query.orderBy('created_at', 'desc').get();
      const messages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      debugLog('Server: Found', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('Server: Error getting messages:', error);
      throw error;
    }
  },

  updateMessage: async (messageId: string, isRead: boolean) => {
    try {
      debugLog('Server: Updating message:', messageId, 'isRead:', isRead);
      const db = getAdminDb();
      await db.collection('contact_messages').doc(messageId).update({
        read: isRead,
        updated_at: new Date(),
      });
      debugLog('Server: Message updated');
    } catch (error) {
      console.error('Server: Error updating message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      debugLog('Server: Deleting message:', messageId);
      const db = getAdminDb();
      await db.collection('contact_messages').doc(messageId).delete();
      debugLog('Server: Message deleted');
    } catch (error) {
      console.error('Server: Error deleting message:', error);
      throw error;
    }
  },

  getAllHireRequests: async (unreadOnly: boolean = false) => {
    try {
      debugLog('Server: Getting hire requests, unreadOnly:', unreadOnly);
      const db = getAdminDb();
      let query: any = db.collection('hire_requests');

      if (unreadOnly) {
        query = query.where('read', '==', false);
      }

      const snapshot = await query.orderBy('created_at', 'desc').get();
      const requests = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      debugLog('Server: Found', requests.length, 'hire requests');
      return requests;
    } catch (error) {
      console.error('Server: Error getting hire requests:', error);
      throw error;
    }
  },

  updateHireRequest: async (requestId: string, isRead: boolean) => {
    try {
      debugLog('Server: Updating hire request:', requestId, 'isRead:', isRead);
      const db = getAdminDb();
      await db.collection('hire_requests').doc(requestId).update({
        read: isRead,
        updated_at: new Date(),
      });
      debugLog('Server: Hire request updated');
    } catch (error) {
      console.error('Server: Error updating hire request:', error);
      throw error;
    }
  },

  deleteHireRequest: async (requestId: string) => {
    try {
      debugLog('Server: Deleting hire request:', requestId);
      const db = getAdminDb();
      await db.collection('hire_requests').doc(requestId).delete();
      debugLog('Server: Hire request deleted');
    } catch (error) {
      console.error('Server: Error deleting hire request:', error);
      throw error;
    }
  },

  // Certifications management
  getAllCertifications: async () => {
    try {
      debugLog('Server: Getting all certifications');
      const db = getAdminDb();
      const snapshot = await db.collection('certifications').orderBy('created_at', 'desc').get();
      const certifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      debugLog('Server: Found', certifications.length, 'certifications');
      return certifications;
    } catch (error) {
      console.error('Server: Error getting certifications:', error);
      throw error;
    }
  },

  getCertificationById: async (certificationId: string) => {
    try {
      debugLog('Server: Getting certification:', certificationId);
      const db = getAdminDb();
      const docSnap = await db.collection('certifications').doc(certificationId).get();
      if (!docSnap.exists) {
        debugLog('Server: Certification not found');
        return null;
      }
      debugLog('Server: Certification found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Server: Error getting certification:', error);
      return null;
    }
  },

  createCertification: async (certificationData: Record<string, any>) => {
    try {
      debugLog('Server: Creating certification:', certificationData.title);
      const db = getAdminDb();
      const now = new Date();
      const createdAtStr = now.toISOString ? now.toISOString() : now;
      const docRef = await db.collection('certifications').add({
        ...certificationData,
        created_at: createdAtStr,
        updated_at: createdAtStr,
      });
      debugLog('Server: Certification created with ID:', docRef.id);
      return { id: docRef.id, ...certificationData, created_at: createdAtStr, updated_at: createdAtStr };
    } catch (error) {
      console.error('Server: Error creating certification:', error);
      throw error;
    }
  },

  updateCertification: async (certificationId: string, certificationData: Record<string, any>) => {
    try {
      debugLog('Server: Updating certification:', certificationId);
      const db = getAdminDb();
      const now = new Date();
      const updatedAtStr = now.toISOString ? now.toISOString() : now;
      const safeCertificationData = removeUndefinedValues(certificationData);
      await db.collection('certifications').doc(certificationId).update({
        ...safeCertificationData,
        updated_at: updatedAtStr,
      });
      debugLog('Server: Certification updated');
      return { id: certificationId, ...safeCertificationData, updated_at: updatedAtStr };
    } catch (error) {
      console.error('Server: Error updating certification:', error);
      throw error;
    }
  },

  deleteCertification: async (certificationId: string) => {
    try {
      debugLog('Server: Deleting certification:', certificationId);
      const db = getAdminDb();
      await db.collection('certifications').doc(certificationId).delete();
      debugLog('Server: Certification deleted');
    } catch (error) {
      console.error('Server: Error deleting certification:', error);
      throw error;
    }
  },
};

function serializeDbDoc<T>(doc: T): T {
  if (doc === null || doc === undefined) return doc;

  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDbDoc(item)) as unknown as T;
  }

  if (typeof doc === 'object') {
    // If it's a Firestore Timestamp (has toDate or _seconds)
    if (typeof (doc as any).toDate === 'function') {
      return (doc as any).toDate().toISOString() as unknown as T;
    }
    if ('_seconds' in (doc as any) && '_nanoseconds' in (doc as any)) {
      return new Date((doc as any)._seconds * 1000).toISOString() as unknown as T;
    }
    if (doc instanceof Date) {
      return doc.toISOString() as unknown as T;
    }

    const entries = Object.entries(doc as Record<string, unknown>).map(([k, v]) => [
      k,
      serializeDbDoc(v),
    ]);
    return Object.fromEntries(entries) as unknown as T;
  }

  return doc;
}

const wrappedHelpers: any = {};
for (const [key, fn] of Object.entries(serverFirebaseHelpers)) {
  if (typeof fn === 'function') {
    wrappedHelpers[key] = async (...args: any[]) => {
      const result = await (fn as any)(...args);
      return serializeDbDoc(result);
    };
  } else {
    wrappedHelpers[key] = fn;
  }
}

export default wrappedHelpers as typeof serverFirebaseHelpers;
