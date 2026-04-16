"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ComponentType, FormEvent } from "react";
import { ArrowLeft, Building2, Briefcase, CalendarDays, Mail, Phone, Globe, DollarSign, Users } from "lucide-react";

const PROJECT_TYPES = [
  "Website / Web App",
  "Brand / Marketing",
  "AI / Automation",
  "Portfolio / Personal Site",
  "Event / Campaign",
  "Consulting / Strategy",
  "Other",
];

const TIMELINES = ["ASAP", "1-2 weeks", "2-4 weeks", "1-2 months", "Flexible"];

export default function HirePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    projectType: PROJECT_TYPES[0],
    role: "",
    budget: "",
    timeline: TIMELINES[0],
    description: "",
    preferredContact: "email",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      setStatus({ type: 'success', message: data.message || 'Your hiring request has been sent.' });
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        website: '',
        projectType: PROJECT_TYPES[0],
        role: '',
        budget: '',
        timeline: TIMELINES[0],
        description: '',
        preferredContact: 'email',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(45,212,191,0.25)_0%,transparent_30%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.22)_0%,transparent_28%),linear-gradient(140deg,#09111b_0%,#102133_52%,#0d1623_100%)] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur transition hover:bg-white/15">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-cyan-100/20 bg-white/8 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <Users className="h-3.5 w-3.5" />
              Hire Request
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">Hire Rahul for your next project</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
              This page is designed for companies, founders, and individuals who want to hire for web development,
              AI, design, content-driven work, or strategic digital execution. Share the project scope and I&apos;ll
              review it directly from the admin inbox.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Building2, title: 'Company / Client', text: 'Add your organization details so the request is easy to track.' },
                { icon: Briefcase, title: 'Project Scope', text: 'Describe the work, expected outcome, and the type of collaboration.' },
                { icon: CalendarDays, title: 'Timeline', text: 'Let me know if the work is urgent, flexible, or planned.' },
                { icon: DollarSign, title: 'Budget Range', text: 'Sharing a range helps match the request to the right solution.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-cyan-100/10 bg-[#0e1a2a]/70 p-4 shadow-lg">
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="rounded-3xl border border-cyan-100/20 bg-white p-5 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Hire Form</h2>
                <p className="mt-1 text-sm text-slate-600">Fill in the fields below to submit a proper hiring request.</p>
              </div>
              <Mail className="h-10 w-10 rounded-2xl bg-cyan-50 p-2 text-cyan-700" />
            </div>

            {status && (
              <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                {status.message}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Full Name" icon={Users} value={formData.fullName} onChange={(v) => handleChange('fullName', v)} placeholder="Your name" required />
              <Field label="Company / Organization" icon={Building2} value={formData.companyName} onChange={(v) => handleChange('companyName', v)} placeholder="Company name" />
              <Field label="Email" icon={Mail} value={formData.email} onChange={(v) => handleChange('email', v)} placeholder="name@company.com" type="email" required />
              <Field label="Phone" icon={Phone} value={formData.phone} onChange={(v) => handleChange('phone', v)} placeholder="Optional phone number" />
              <Field label="Website" icon={Globe} value={formData.website} onChange={(v) => handleChange('website', v)} placeholder="https://..." />
              <Field label="Role / Title Needed" icon={Briefcase} value={formData.role} onChange={(v) => handleChange('role', v)} placeholder="E.g. Developer, Designer" />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleChange('projectType', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                >
                  {PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleChange('timeline', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                >
                  {TIMELINES.map((timeline) => <option key={timeline} value={timeline}>{timeline}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Budget Range</label>
                <input
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  placeholder="Example: ₹50,000 - ₹1,00,000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Tell me what you need built, the goals, audience, constraints, and any key features."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred Contact Method</label>
                <div className="flex flex-wrap gap-3">
                  {['email', 'phone', 'whatsapp'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleChange('preferredContact', method)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${formData.preferredContact === method ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending request...' : 'Submit Hiring Request'}
            </button>
          </motion.form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, type = 'text', required = false }: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
        />
      </div>
    </div>
  );
}
