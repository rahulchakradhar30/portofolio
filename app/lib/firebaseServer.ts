/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminDb, getAdminAuth } from './firebaseAdmin';

// Server-side Firebase helpers using Admin SDK
const serverFirebaseHelpers = {
  // User management
  getUserByEmail: async (email: string) => {
    try {
      console.log('Server: Looking up user by email:', email);
      const db = getAdminDb();
      const usersRef = db.collection('admin_users');
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (snapshot.empty) {
        console.log('Server: User not found in admin_users collection');
        return null;
      }
      
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      console.log('Server: User found:', data.email);
      return { id: docSnap.id, ...data };
    } catch (error) {
      console.error('Server: Error getting user by email:', error);
      throw error;
    }
  },

  createUser: async (userData: Record<string, any>) => {
    try {
      console.log('Server: Creating new user:', userData.email);
      const db = getAdminDb();
      const usersRef = db.collection('admin_users');
      const now = new Date();
      const docRef = await usersRef.add({
        ...userData,
        created_at: now.toISOString ? now.toISOString() : now,
        updated_at: now.toISOString ? now.toISOString() : now,
      });
      console.log('Server: User created with ID:', docRef.id);
      return { id: docRef.id, ...userData, created_at: now, updated_at: now };
    } catch (error) {
      console.error('Server: Error creating user:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Record<string, any>) => {
    try {
      console.log('Server: Updating user:', userId);
      const db = getAdminDb();
      const userRef = db.collection('admin_users').doc(userId);
      const now = new Date();
      await userRef.update({
        ...userData,
        updated_at: now.toISOString ? now.toISOString() : now,
      });
      console.log('Server: User updated');
      return { id: userId, ...userData, updated_at: now };
    } catch (error) {
      console.error('Server: Error updating user:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  // OTP management
  storeOTP: async (email: string, otp: string, expiresAt: Date, type: string = 'email_verification') => {
    try {
      console.log('Server: Storing OTP for:', email, 'Type:', type);
      const db = getAdminDb();
      const otpsRef = db.collection('email_otps');
      
      // Convert Date objects to timestamps for Firestore
      const now = new Date();
      const docRef = await otpsRef.add({
        email,
        otp,
        type,
        expires_at: expiresAt.toISOString ? expiresAt.toISOString() : expiresAt,
        created_at: now.toISOString ? now.toISOString() : now,
        verified: false,
      });
      console.log('Server: OTP stored with ID:', docRef.id);
      return { 
        id: docRef.id, 
        email, 
        otp, 
        type, 
        expires_at: expiresAt,
        created_at: now 
      };
    } catch (error) {
      console.error('Server: Error storing OTP:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  getLatestOTP: async (email: string, type: string = 'email_verification') => {
    try {
      console.log('Server: Getting latest OTP for:', email, 'Type:', type);
      const db = getAdminDb();
      const otpsRef = db.collection('email_otps');
      const snapshot = await otpsRef
        .where('email', '==', email)
        .where('type', '==', type)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log('Server: No OTP found');
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      console.log('Server: OTP found');
      return { id: docSnap.id, ...data };
    } catch (error) {
      console.error('Server: Error getting OTP:', error);
      throw error;
    }
  },

  markOTPVerified: async (otpId: string) => {
    try {
      console.log('Server: Marking OTP as verified:', otpId);
      const db = getAdminDb();
      const now = new Date();
      await db.collection('email_otps').doc(otpId).update({
        verified: true,
        verified_at: now.toISOString ? now.toISOString() : now,
      });
      console.log('Server: OTP marked as verified');
    } catch (error) {
      console.error('Server: Error marking OTP verified:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  deleteOTP: async (otpId: string) => {
    try {
      console.log('Server: Deleting OTP:', otpId);
      const db = getAdminDb();
      await db.collection('email_otps').doc(otpId).delete();
      console.log('Server: OTP deleted');
    } catch (error) {
      console.error('Server: Error deleting OTP:', error);
      throw error;
    }
  },

  // Activity logging
  logActivity: async (email: string, action: string, details: Record<string, any> = {}) => {
    try {
      console.log('Server: Logging activity:', action, 'for:', email);
      const db = getAdminDb();
      const now = new Date();
      await db.collection('activity_logs').add({
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
      console.log('Server: Getting all projects');
      const db = getAdminDb();
      const snapshot = await db.collection('projects').orderBy('created_at', 'desc').get();
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Server: Found', projects.length, 'projects');
      return projects;
    } catch (error) {
      console.error('Server: Error getting projects:', error);
      throw error;
    }
  },

  getProjectById: async (projectId: string) => {
    try {
      console.log('Server: Getting project:', projectId);
      const db = getAdminDb();
      const docSnap = await db.collection('projects').doc(projectId).get();
      if (!docSnap.exists) {
        console.log('Server: Project not found');
        return null;
      }
      console.log('Server: Project found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Server: Error getting project:', error);
      return null;
    }
  },

  createProject: async (projectData: Record<string, any>) => {
    try {
      console.log('Server: Creating project:', projectData.title);
      const db = getAdminDb();
      const now = new Date();
      const docRef = await db.collection('projects').add({
        ...projectData,
        created_at: now.toISOString ? now.toISOString() : now,
        updated_at: now.toISOString ? now.toISOString() : now,
      });
      console.log('Server: Project created with ID:', docRef.id);
      return { id: docRef.id, ...projectData, created_at: now, updated_at: now };
    } catch (error) {
      console.error('Server: Error creating project:', error);
      console.error('Server: Full error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  updateProject: async (projectId: string, projectData: Record<string, any>) => {
    try {
      console.log('Server: Updating project:', projectId);
      const db = getAdminDb();
      await db.collection('projects').doc(projectId).update({
        ...projectData,
        updated_at: new Date(),
      });
      console.log('Server: Project updated');
      return { id: projectId, ...projectData };
    } catch (error) {
      console.error('Server: Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      console.log('Server: Deleting project:', projectId);
      const db = getAdminDb();
      await db.collection('projects').doc(projectId).delete();
      console.log('Server: Project deleted');
    } catch (error) {
      console.error('Server: Error deleting project:', error);
      throw error;
    }
  },

  // Skills management
  getAllSkills: async () => {
    try {
      console.log('Server: Getting all skills');
      const db = getAdminDb();
      const snapshot = await db.collection('skills').orderBy('created_at', 'desc').get();
      const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Server: Found', skills.length, 'skills');
      return skills;
    } catch (error) {
      console.error('Server: Error getting skills:', error);
      throw error;
    }
  },

  getSkillById: async (skillId: string) => {
    try {
      console.log('Server: Getting skill:', skillId);
      const db = getAdminDb();
      const docSnap = await db.collection('skills').doc(skillId).get();
      if (!docSnap.exists) {
        console.log('Server: Skill not found');
        return null;
      }
      console.log('Server: Skill found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Server: Error getting skill:', error);
      return null;
    }
  },

  createSkill: async (skillData: Record<string, any>) => {
    try {
      console.log('Server: Creating skill:', skillData.name);
      const db = getAdminDb();
      const docRef = await db.collection('skills').add({
        ...skillData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('Server: Skill created with ID:', docRef.id);
      return { id: docRef.id, ...skillData };
    } catch (error) {
      console.error('Server: Error creating skill:', error);
      throw error;
    }
  },

  updateSkill: async (skillId: string, skillData: Record<string, any>) => {
    try {
      console.log('Server: Updating skill:', skillId);
      const db = getAdminDb();
      await db.collection('skills').doc(skillId).update({
        ...skillData,
        updated_at: new Date(),
      });
      console.log('Server: Skill updated');
      return { id: skillId, ...skillData };
    } catch (error) {
      console.error('Server: Error updating skill:', error);
      throw error;
    }
  },

  deleteSkill: async (skillId: string) => {
    try {
      console.log('Server: Deleting skill:', skillId);
      const db = getAdminDb();
      await db.collection('skills').doc(skillId).delete();
      console.log('Server: Skill deleted');
    } catch (error) {
      console.error('Server: Error deleting skill:', error);
      throw error;
    }
  },

  // Portfolio content
  getPortfolioContent: async () => {
    try {
      console.log('Server: Getting portfolio content');
      const db = getAdminDb();
      const snapshot = await db.collection('portfolio_content').limit(1).get();
      if (snapshot.empty) {
        console.log('Server: No portfolio content found');
        return null;
      }
      const doc = snapshot.docs[0];
      console.log('Server: Portfolio content found');
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Server: Error getting portfolio content:', error);
      return null;
    }
  },

  updatePortfolioContent: async (contentData: Record<string, any>) => {
    try {
      console.log('Server: Updating portfolio content');
      const db = getAdminDb();
      const snapshot = await db.collection('portfolio_content').limit(1).get();
      
      if (snapshot.empty) {
        // Create new document if doesn't exist
        const docRef = await db.collection('portfolio_content').add({
          ...contentData,
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log('Server: Portfolio content created');
        return { id: docRef.id, ...contentData };
      } else {
        // Update existing document
        const docId = snapshot.docs[0].id;
        await db.collection('portfolio_content').doc(docId).update({
          ...contentData,
          updated_at: new Date(),
        });
        console.log('Server: Portfolio content updated');
        return { id: docId, ...contentData };
      }
    } catch (error) {
      console.error('Server: Error updating portfolio content:', error);
      throw error;
    }
  },

  // Messages management
  getAllMessages: async (unreadOnly: boolean = false) => {
    try {
      console.log('Server: Getting messages, unreadOnly:', unreadOnly);
      const db = getAdminDb();
      let query: any = db.collection('contact_messages');
      
      if (unreadOnly) {
        query = query.where('read', '==', false);
      }
      
      const snapshot = await query.orderBy('created_at', 'desc').get();
      const messages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      console.log('Server: Found', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('Server: Error getting messages:', error);
      throw error;
    }
  },

  updateMessage: async (messageId: string, isRead: boolean) => {
    try {
      console.log('Server: Updating message:', messageId, 'isRead:', isRead);
      const db = getAdminDb();
      await db.collection('contact_messages').doc(messageId).update({
        read: isRead,
        updated_at: new Date(),
      });
      console.log('Server: Message updated');
    } catch (error) {
      console.error('Server: Error updating message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      console.log('Server: Deleting message:', messageId);
      const db = getAdminDb();
      await db.collection('contact_messages').doc(messageId).delete();
      console.log('Server: Message deleted');
    } catch (error) {
      console.error('Server: Error deleting message:', error);
      throw error;
    }
  },
};

export default serverFirebaseHelpers;
