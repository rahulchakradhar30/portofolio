"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Menu, X, LogOut, MessageSquare, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth) {
      setIsAuth(true);
      setAdminName(JSON.parse(auth).name);
    }
  }, []);

  if (!isAuth) {
    return <AdminLogin onSuccess={(name) => {
      setAdminName(name);
      setIsAuth(true);
    }} />;
  }

  const adminTabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "content", label: "Content", icon: "✏️" },
    { id: "projects", label: "Projects", icon: "🎯" },
    { id: "skills", label: "Skills", icon: "⭐" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "settings", label: "Settings", icon: "⚙️" },
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
          {adminTabs.map((tab) => (
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
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </motion.button>
          ))}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("adminAuth");
            setIsAuth(false);
          }}
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
            <span className="text-gray-700 font-medium">Welcome, {adminName}!</span>
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
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// Admin Login Component
function AdminLogin({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Simple demo login (in production, use proper authentication)
    if (email === "admin@portfolio.com" && password === "admin123") {
      const authData = { name: "Admin", email };
      localStorage.setItem("adminAuth", JSON.stringify(authData));
      onSuccess("Admin");
    } else {
      setError("Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Admin Login
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="admin@portfolio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-lg"
          >
            Login
          </motion.button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Demo Credentials:<br />
            Email: admin@portfolio.com<br />
            Password: admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Projects", value: "6", color: "from-blue-500 to-blue-600" },
          { label: "Total Skills", value: "6", color: "from-violet-500 to-violet-600" },
          { label: "Messages", value: "12", color: "from-pink-500 to-pink-600" },
          { label: "Users Hired", value: "0", color: "from-green-500 to-green-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl`}
          >
            <div className="text-4xl font-bold">{stat.value}</div>
            <div className="text-opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ContentTab() {
  const [heroTitle, setHeroTitle] = useState("PEREPOGU RAHUL CHAKRADHAR");
  const [editMode, setEditMode] = useState(false);

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
            {editMode ? "Done" : "Edit"}
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Section Text
            </label>
            <textarea
              rows={4}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600 resize-none"
              defaultValue="I'm a passionate AI enthusiast..."
            />
          </div>

          {editMode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
            >
              Save Changes
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-800">Project {i}</h3>
              <p className="text-sm text-gray-600">Featured project</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit2 className="w-5 h-5 text-blue-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SkillsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Skills</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Skill
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["AI & Machine Learning", "Content Creation", "Full Stack Dev"].map((skill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{skill}</h3>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:bg-gray-100 p-1 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:bg-gray-100 p-1 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-violet-600 h-2 rounded-full w-4/5"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Contact Messages</h2>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Message {i}</h3>
                <p className="text-sm text-gray-600">From: user@example.com</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                  Unread
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
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
