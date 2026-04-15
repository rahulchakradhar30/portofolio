"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Menu, X, LogOut, Users, Activity, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import { firebaseLogout } from "@/app/lib/firebaseAuth";
import { adminAPI } from "@/app/lib/adminAPI";
import type { Project, Skill, ContactMessage, PortfolioContent, AdminUser } from "@/app/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth/me", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
          setIsHydrated(true);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!isHydrated || loading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  const handleLogout = async () => {
    await firebaseLogout();
    sessionStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  const adminTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Content", icon: Edit2 },
    { id: "projects", label: "Projects", icon: Plus },
    { id: "skills", label: "Skills", icon: Plus },
    { id: "messages", label: "Messages", icon: Plus },
    { id: "users", label: "Users", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
        initial={false}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
              RC
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Admin</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{tab.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="text-gray-800 font-medium">{adminUser?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "content" && <ContentTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [projectsRes, skillsRes, messagesRes] = await Promise.all([
          adminAPI.getProjects(),
          fetch('/api/admin/skills').then(r => r.json()),
          adminAPI.getMessages(),
        ]);
        setStats({
          projects: projectsRes.projects?.length || 0,
          skills: skillsRes.skills?.length || 0,
          messages: messagesRes.messages?.length || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Projects", value: stats.projects, color: "from-blue-500 to-blue-600" },
          { label: "Total Skills", value: stats.skills, color: "from-violet-500 to-violet-600" },
          { label: "Messages", value: stats.messages, color: "from-pink-500 to-pink-600" },
          { label: "Portfolio Views", value: "Live", color: "from-green-500 to-green-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl`}
          >
            <div className="text-4xl font-bold">{loading ? "..." : stat.value}</div>
            <div className="text-opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ContentTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setContent(res.content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) {
      alert('No content to save');
      return;
    }
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent(content as unknown as Record<string, unknown>);
      if (res.success) {
        alert('Content updated successfully!');
        setEditMode(false);
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Homepage Content</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            {editMode ? "Cancel" : "Edit"}
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
            <input
              type="text"
              value={content?.heroTitle || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroTitle: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content?.heroSubtitle || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroSubtitle: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About Text</label>
            <textarea
              rows={4}
              value={content?.aboutText || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), aboutText: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={content?.email || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), email: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={content?.location || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), location: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {editMode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech: "",
    github: "",
    demo: "",
    featured: false,
    category: "",
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await adminAPI.getProjects();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required");
      return;
    }

    const newProject = {
      title: formData.title,
      description: formData.description,
      tech: formData.tech.split(",").map((t) => t.trim()),
      github: formData.github,
      demo: formData.demo,
      featured: formData.featured,
      category: formData.category,
    };

    const res = await adminAPI.createProject(newProject);
    if (res.success) {
      alert("Project added successfully!");
      setFormData({ title: "", description: "", tech: "", github: "", demo: "", featured: false, category: "" });
      setShowForm(false);
      loadProjects();
    } else {
      alert("Failed to add project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const res = await adminAPI.deleteProject(projectId);
      if (res.success) {
        alert("Project deleted!");
        loadProjects();
      } else {
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <input
            type="text"
            placeholder="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Tech Stack (comma-separated)"
            value={formData.tech}
            onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="GitHub URL"
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Demo URL"
            value={formData.demo}
            onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span>Featured</span>
          </label>
          <button
            onClick={handleAddProject}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
          >
            Add Project
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          projects.map((project: Project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:border-violet-300"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.category}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>
                <button onClick={() => handleDeleteProject(project.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function SkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    proficiency: 75,
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await fetch('/api/admin/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!formData.title) {
      alert("Skill title is required");
      return;
    }

    const res = await adminAPI.createSkill(formData);
    if (res.success) {
      alert("Skill added successfully!");
      setFormData({ title: "", description: "", proficiency: 75 });
      setShowForm(false);
      loadSkills();
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (confirm("Delete this skill?")) {
      const res = await adminAPI.deleteSkill(skillId);
      if (res.success) {
        alert("Skill deleted!");
        loadSkills();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Skills</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Skill
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <input
            type="text"
            placeholder="Skill Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Skill Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Proficiency: {formData.proficiency}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.proficiency}
              onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <button
            onClick={handleAddSkill}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
          >
            Add Skill
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          skills.map((skill: Skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{skill.title}</h3>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:bg-gray-100 p-1 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-600 hover:bg-gray-100 p-1 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${skill.proficiency || 75}%` }}></div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await adminAPI.getMessages();
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm("Delete this message?")) {
      const res = await adminAPI.deleteMessage(messageId);
      if (res.success) {
        alert("Message deleted!");
        loadMessages();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Contact Messages</h2>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          messages.map((message: ContactMessage) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{message.subject}</h3>
                  <p className="text-sm text-gray-600">From: {message.email}</p>
                  <p className="text-sm text-gray-600 mt-2">{message.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Users</h2>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-800">{user.email}</td>
                  <td className="px-6 py-3 text-gray-600">{user.role || "admin"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActivityTab() {
  const [activities, setActivities] = useState<Array<{id: string; action: string; timestamp?: Record<string, unknown> | string}>>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Error loading activities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.timestamp ? new Date(String(activity.timestamp)).toLocaleString() : 'N/A'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              defaultValue="admin@portfolio.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio URL
            </label>
            <input
              type="text"
              defaultValue="https://yourportfolio.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-lg"
          >
            Save Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
