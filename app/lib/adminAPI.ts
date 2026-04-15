// Admin API utilities for making authenticated requests

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export const adminAPI = {
  // Projects
  async getProjects() {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return { success: true, projects: data.projects || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async createProject(projectData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      return { success: true, project: data.project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updateProject(projectId: string, updateData: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update project');
      const data = await res.json();
      return { success: true, project: data.project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async deleteProject(projectId: string) {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Skills
  async getSkills() {
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch skills');
      const data = await res.json();
      return { success: true, skills: data.skills || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async createSkill(skillData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillData),
      });
      if (!res.ok) throw new Error('Failed to create skill');
      const data = await res.json();
      return { success: true, skill: data.skill };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updateSkill(skillId: string, updateData: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/skills/${skillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update skill');
      const data = await res.json();
      return { success: true, skill: data.skill };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async deleteSkill(skillId: string) {
    try {
      const res = await fetch(`/api/admin/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete skill');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Portfolio Content
  async getPortfolioContent() {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      return { success: true, content: data.content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updatePortfolioContent(contentData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      if (!res.ok) throw new Error('Failed to update content');
      const data = await res.json();
      return { success: true, content: data.content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Messages
  async getMessages() {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return { success: true, messages: data.messages || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async deleteMessage(messageId: string) {
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete message');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Certifications
  async getCertifications() {
    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch certifications');
      const data = await res.json();
      return { success: true, certifications: data.certifications || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async createCertification(certificationData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificationData),
      });
      if (!res.ok) throw new Error('Failed to create certification');
      const data = await res.json();
      return { success: true, certification: data.certification };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updateCertification(certificationId: string, updateData: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/certifications/${certificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update certification');
      const data = await res.json();
      return { success: true, certification: data.certification };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async deleteCertification(certificationId: string) {
    try {
      const res = await fetch(`/api/admin/certifications/${certificationId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete certification');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Image Upload to Cloudinary
  async uploadToCloudinary(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload to Cloudinary');
      const data = await res.json();
      return { success: true, imageUrl: data.imageUrl, publicId: data.publicId };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

