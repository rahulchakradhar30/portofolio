"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Search,
  X,
  Save,
  ExternalLink,
} from "lucide-react";

import { adminAPI } from "@/app/lib/adminAPI";
import type { ProofExperience, Project, DemonstrationType, EvidenceLink, DemonstrationConfig } from "@/app/lib/types";
import {
  AdminCard,
  AdminTextInput,
  AdminTextarea,
  adminPrimaryButtonClassName,
  adminSubtleButtonClassName,
  adminFieldClassName,
} from "@/app/components/AdminUIComponents";
import InteractiveProofVisualizer from "@/app/components/InteractiveProofVisualizer";

const CAPABILITY_CATEGORIES = [
  "Engineering",
  "AI / ML",
  "Problem Solving",
  "Creative Technology",
  "Product Thinking",
];

const DEMO_TYPES: { type: DemonstrationType; label: string }[] = [
  { type: "architecture_visualizer", label: "Architecture Node Visualizer" },
  { type: "before_after", label: "Before / After Metrics Comparison" },
  { type: "decision_simulation", label: "Decision Tree Simulation" },
  { type: "system_flow", label: "System Flow Workflow" },
  { type: "interactive_demo", label: "Interactive Playground Demo" },
];

const DEFAULT_CONFIG_EXAMPLES: Record<DemonstrationType, DemonstrationConfig> = {
  architecture_visualizer: {
    nodes: [
      { id: "1", label: "API Gateway", description: "Handles authentication and routing", status: "active" },
      { id: "2", label: "Core Processing Engine", description: "Executes business logic and transformations", status: "active" },
      { id: "3", label: "Datastore Cluster", description: "Persists records with low latency", status: "active" },
    ],
    connections: [
      { from: "1", to: "2", label: "gRPC" },
      { from: "2", to: "3", label: "SQL Queries" },
    ],
  },
  before_after: {
    beforeLabel: "Legacy Pipeline",
    afterLabel: "New Architecture",
    beforeMetrics: [
      { label: "Latency", value: "450ms" },
      { label: "Throughput", value: "100 req/s" },
      { label: "Memory Usage", value: "1.2 GB" },
    ],
    afterMetrics: [
      { label: "Latency", value: "35ms" },
      { label: "Throughput", value: "3,500 req/s" },
      { label: "Memory Usage", value: "280 MB" },
    ],
  },
  decision_simulation: {
    decisionSteps: [
      {
        question: "How should high-traffic search queries be cached?",
        options: [
          { label: "Cache full HTML responses at CDN", outcome: "Fastest response time, but stale personalized content.", recommended: false },
          { label: "Tiered Redis caching with TTL invalidation", outcome: "Sub-5ms cache hits with real-time consistency.", recommended: true },
        ],
      },
    ],
  },
  system_flow: {
    flowSteps: [
      { step: 1, title: "Data Ingestion", detail: "Stream data from sources into message queue." },
      { step: 2, title: "Transformation", detail: "Parse, validate, and enrich incoming payloads." },
      { step: 3, title: "Indexing & Output", detail: "Index vector embeddings into search index." },
    ],
  },
  interactive_demo: {},
};

export default function ProofModeTab() {
  const [proofExperiences, setProofExperiences] = useState<ProofExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Form State
  const [editingExperience, setEditingExperience] = useState<Partial<ProofExperience> | null>(null);
  const [configJsonText, setConfigJsonText] = useState("");
  const [configJsonError, setConfigJsonError] = useState<string | null>(null);
  const [evidenceLinksText, setEvidenceLinksText] = useState("");

  // Preview State
  const [previewExperience, setPreviewExperience] = useState<ProofExperience | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Lock body scroll when modal is open to prevent background scroll conflicts
  useEffect(() => {
    if (!editingExperience && !previewExperience) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [editingExperience, previewExperience]);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [proofRes, projectsRes] = await Promise.all([
        adminAPI.getProofExperiences(true),
        adminAPI.getProjects(),
      ]);

      if (proofRes.success) {
        setProofExperiences(proofRes.proofExperiences || []);
      } else {
        setError(proofRes.error || "Failed to load proof experiences");
      }

      if (projectsRes.success) {
        setProjects(projectsRes.projects || []);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const initialConfig = DEFAULT_CONFIG_EXAMPLES.architecture_visualizer;
    setEditingExperience({
      title: "",
      category: "Engineering",
      shortDescription: "",
      projectId: "",
      problem: "",
      approach: "",
      technicalDetails: "",
      demonstrationType: "architecture_visualizer",
      demonstrationConfig: initialConfig,
      result: "",
      evidenceLinks: [],
      published: true,
      order: (proofExperiences.length || 0) + 1,
    });
    setConfigJsonText(JSON.stringify(initialConfig, null, 2));
    setConfigJsonError(null);
    setEvidenceLinksText("");
  };

  const handleOpenEdit = (exp: ProofExperience) => {
    setEditingExperience({ ...exp });
    setConfigJsonText(JSON.stringify(exp.demonstrationConfig || {}, null, 2));
    setConfigJsonError(null);
    setEvidenceLinksText(
      (exp.evidenceLinks || []).map((l) => `${l.label} | ${l.url} | ${l.type || "demo"}`).join("\n")
    );
  };

  const handleDemoTypeChange = (newType: DemonstrationType) => {
    if (!editingExperience) return;
    const sampleConfig = DEFAULT_CONFIG_EXAMPLES[newType] || {};
    setEditingExperience({
      ...editingExperience,
      demonstrationType: newType,
      demonstrationConfig: sampleConfig,
    });
    setConfigJsonText(JSON.stringify(sampleConfig, null, 2));
    setConfigJsonError(null);
  };

  const parseEvidenceLinks = (text: string): EvidenceLink[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        return {
          label: parts[0] || "Link",
          url: parts[1] || parts[0],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- type comes from free-text user input parsing
          type: (parts[2] as any) || "demo",
        };
      });
  };

  const handleSave = async () => {
    if (!editingExperience) return;
    setError(null);
    setSuccessMsg(null);

    // Validate config JSON
    let parsedConfig: DemonstrationConfig = {};
    if (configJsonText.trim()) {
      try {
        parsedConfig = JSON.parse(configJsonText);
        setConfigJsonError(null);
      } catch (_err) {
        setConfigJsonError("Invalid JSON structure in Demonstration Config");
        return;
      }
    }

    const payload = {
      ...editingExperience,
      demonstrationConfig: parsedConfig,
      evidenceLinks: parseEvidenceLinks(evidenceLinksText),
    };

    if (!payload.title || !payload.category || !payload.shortDescription || !payload.problem || !payload.approach || !payload.technicalDetails || !payload.result) {
      setError("Please fill in all required fields (Title, Category, Short Description, Problem, Approach, Technical Details, Result).");
      return;
    }

    try {
      if (editingExperience.id) {
        const res = await adminAPI.updateProofExperience(editingExperience.id, payload);
        if (res.success) {
          setSuccessMsg("Proof Experience updated successfully!");
          setEditingExperience(null);
          fetchData();
        } else {
          setError(res.error || "Failed to update Proof Experience");
        }
      } else {
        const res = await adminAPI.createProofExperience(payload);
        if (res.success) {
          setSuccessMsg("Proof Experience created successfully!");
          setEditingExperience(null);
          fetchData();
        } else {
          setError(res.error || "Failed to create Proof Experience");
        }
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Proof Experience?")) return;
    try {
      const res = await adminAPI.deleteProofExperience(id);
      if (res.success) {
        setSuccessMsg("Proof Experience deleted.");
        fetchData();
      } else {
        setError(res.error || "Failed to delete Proof Experience");
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleTogglePublish = async (exp: ProofExperience) => {
    try {
      const res = await adminAPI.updateProofExperience(exp.id, { published: !exp.published });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const filtered = proofExperiences.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--accent)]" /> Proof Mode Management
          </h2>
          <p className="text-sm text-[var(--foreground)]/70 mt-1">
            Create and publish interactive evidence experiences for visitors. No fake data.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className={`${adminPrimaryButtonClassName} gap-2`}
        >
          <Plus className="h-4 w-4" /> Create Proof Experience
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
          <input
            type="text"
            placeholder="Search proof experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${adminFieldClassName} pl-10`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["All", ...CAPABILITY_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`paper-chip px-3 py-1.5 whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-[var(--foreground)] text-[var(--surface)]"
                  : "bg-[var(--surface-soft)] text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List of Proof Experiences */}
      {loading ? (
        <div className="text-center py-12 text-[var(--foreground)]/60 font-medium">
          Loading proof experiences...
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard title="No Proof Experiences Found">
          <p className="text-sm text-[var(--foreground)]/70">
            {searchQuery || filterCategory !== "All"
              ? "No proof experiences match your search or filter."
              : "No proof experiences have been created yet. Click 'Create Proof Experience' above to add your first interactive evidence."}
          </p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const linkedProject = projects.find((p) => p.id === item.projectId);
            return (
              <AdminCard
                key={item.id}
                title={item.title}
                description={`${item.category} · Demo: ${item.demonstrationType.replace("_", " ")}`}
                actions={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewExperience(item)}
                      title="Preview experience"
                      className="p-2 rounded-lg border border-[var(--foreground)]/20 hover:bg-[var(--surface-soft)]"
                    >
                      <Eye className="h-4 w-4 text-[var(--foreground)]" />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`paper-chip text-[10px] font-mono uppercase ${
                        item.published
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg border border-[var(--foreground)]/20 hover:bg-[var(--surface-soft)]"
                    >
                      <Edit2 className="h-4 w-4 text-[var(--foreground)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                }
              >
                <div className="space-y-2 text-sm">
                  <p className="text-[var(--foreground)]/80 font-medium">{item.shortDescription}</p>
                  {linkedProject && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--surface-soft)] px-2.5 py-1 rounded-md border border-[var(--foreground)]/10">
                      <Layers className="h-3.5 w-3.5" /> Associated Project: {linkedProject.title}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--foreground)]/10">
                    <div>
                      <strong className="text-[var(--foreground)]">Problem:</strong> {item.problem}
                    </div>
                    <div>
                      <strong className="text-[var(--foreground)]">Result:</strong> {item.result}
                    </div>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {/* Edit / Create Form Modal */}
      <AnimatePresence>
        {editingExperience && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-6 text-center">
            <div className="fixed inset-0 pointer-events-auto" onClick={() => setEditingExperience(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative inline-block w-full max-w-3xl my-8 text-left align-middle paper-card p-6 sm:p-8 bg-[var(--surface)] shadow-[8px_8px_0_0_rgba(42,36,31,0.2)] space-y-6 pointer-events-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--foreground)]/15">

                <h3 className="text-xl font-black text-[var(--foreground)]">
                  {editingExperience.id ? "Edit Proof Experience" : "Create Proof Experience"}
                </h3>
                <button
                  onClick={() => setEditingExperience(null)}
                  className="p-2 rounded-full border border-[var(--foreground)]/20 hover:bg-[var(--surface-soft)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <AdminTextInput
                  label="Experience Title"
                  value={editingExperience.title || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, title: val })}
                  placeholder="e.g., High-Throughput Event Streaming Architecture"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                      Capability Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingExperience.category || "Engineering"}
                      onChange={(e) => setEditingExperience({ ...editingExperience, category: e.target.value })}
                      className={adminFieldClassName}
                    >
                      {CAPABILITY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                      Associated Portfolio Project
                    </label>
                    <select
                      value={editingExperience.projectId || ""}
                      onChange={(e) => setEditingExperience({ ...editingExperience, projectId: e.target.value })}
                      className={adminFieldClassName}
                    >
                      <option value="">None (Standalone Proof)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AdminTextInput
                  label="Short Summary"
                  value={editingExperience.shortDescription || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, shortDescription: val })}
                  placeholder="1-2 sentences summarizing this proof experience"
                  required
                />

                <AdminTextarea
                  label="Problem Statement (WHAT I BUILD)"
                  value={editingExperience.problem || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, problem: val })}
                  placeholder="Describe the challenge or engineering problem..."
                  required
                  rows={3}
                />

                <AdminTextarea
                  label="Strategic Approach (HOW I THINK)"
                  value={editingExperience.approach || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, approach: val })}
                  placeholder="Explain why this approach was chosen..."
                  required
                  rows={3}
                />

                <AdminTextarea
                  label="Technical Details & Architecture (HOW IT WORKS)"
                  value={editingExperience.technicalDetails || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, technicalDetails: val })}
                  placeholder="Explain internal pipeline, stack details, data flows..."
                  required
                  rows={4}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                    Demonstration Type (INTERACT WITH IT) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingExperience.demonstrationType || "architecture_visualizer"}
                    onChange={(e) => handleDemoTypeChange(e.target.value as DemonstrationType)}
                    className={adminFieldClassName}
                  >
                    {DEMO_TYPES.map((dt) => (
                      <option key={dt.type} value={dt.type}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                    Demonstration Configuration (JSON)
                  </label>
                  <textarea
                    rows={8}
                    value={configJsonText}
                    onChange={(e) => {
                      setConfigJsonText(e.target.value);
                      setConfigJsonError(null);
                    }}
                    className={`${adminFieldClassName} font-mono text-xs`}
                  />
                  {configJsonError && (
                    <p className="mt-1 text-xs font-semibold text-red-600">{configJsonError}</p>
                  )}
                </div>

                <AdminTextarea
                  label="Result & Quantified Impact (SEE THE RESULT)"
                  value={editingExperience.result || ""}
                  onChange={(val) => setEditingExperience({ ...editingExperience, result: val })}
                  placeholder="Quantifiable outcome, benchmarks, or user impact..."
                  required
                  rows={3}
                />

                <AdminTextarea
                  label="Evidence Links (One per line: Label | URL | type)"
                  value={evidenceLinksText}
                  onChange={(val) => setEvidenceLinksText(val)}
                  placeholder={"GitHub Repo | https://github.com/... | github\nLive Demo | https://demo.com | demo"}
                  rows={3}
                  helpText="Supported types: github, demo, paper, metrics"
                />

                <div className="flex items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingExperience.published)}
                      onChange={(e) => setEditingExperience({ ...editingExperience, published: e.target.checked })}
                      className="h-4 w-4 rounded accent-[var(--accent)]"
                    />
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      Publish publicly immediately
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[var(--foreground)]">Order:</label>
                    <input
                      type="number"
                      value={editingExperience.order || 1}
                      onChange={(e) => setEditingExperience({ ...editingExperience, order: parseInt(e.target.value) || 1 })}
                      className="w-20 rounded-xl border border-[var(--foreground)]/30 px-3 py-1 text-sm text-[var(--foreground)] font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--foreground)]/15">
                <button
                  type="button"
                  onClick={() => setEditingExperience(null)}
                  className={adminSubtleButtonClassName}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className={adminPrimaryButtonClassName}
                >
                  <Save className="h-4 w-4 mr-2" /> Save Proof Experience
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {previewExperience && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 text-center">
            <div className="fixed inset-0 pointer-events-auto" onClick={() => setPreviewExperience(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative inline-block w-full max-w-4xl my-8 text-left align-middle paper-card p-6 sm:p-10 bg-[var(--surface)] shadow-[8px_8px_0_0_rgba(42,36,31,0.2)] space-y-6 pointer-events-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--foreground)]/15">

                <div>
                  <span className="paper-chip text-[10px] uppercase font-mono bg-[var(--surface-strong)]">
                    Live Public Preview
                  </span>
                  <h3 className="text-2xl font-black text-[var(--foreground)] mt-1">
                    {previewExperience.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewExperience(null)}
                  className="p-2 rounded-full border border-[var(--foreground)]/20 hover:bg-[var(--surface-soft)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* WHAT I BUILD */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                  WHAT I BUILD
                </div>
                <p className="text-base font-semibold text-[var(--foreground)]/90">
                  {previewExperience.shortDescription}
                </p>
              </div>

              {/* HOW I THINK & HOW IT WORKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)] space-y-2">
                  <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--foreground)]/60">
                    HOW I THINK · Problem & Approach
                  </div>
                  <p className="text-xs text-[var(--foreground)]/80">
                    <strong>Challenge:</strong> {previewExperience.problem}
                  </p>
                  <p className="text-xs text-[var(--foreground)]/80">
                    <strong>Strategy:</strong> {previewExperience.approach}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)] space-y-2">
                  <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--foreground)]/60">
                    HOW IT WORKS · Technical Breakdown
                  </div>
                  <p className="text-xs text-[var(--foreground)]/80">
                    {previewExperience.technicalDetails}
                  </p>
                </div>
              </div>

              {/* INTERACT WITH IT */}
              <InteractiveProofVisualizer
                type={previewExperience.demonstrationType}
                config={previewExperience.demonstrationConfig}
                title={previewExperience.title}
              />

              {/* SEE THE RESULT */}
              <div className="p-5 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] space-y-3">
                <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                  SEE THE RESULT
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {previewExperience.result}
                </p>
                {previewExperience.evidenceLinks && previewExperience.evidenceLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--foreground)]/10">
                    {previewExperience.evidenceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-chip inline-flex items-center gap-1.5 hover:bg-[var(--foreground)] hover:text-[var(--surface)]"
                      >
                        <ExternalLink className="h-3 w-3" /> {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
