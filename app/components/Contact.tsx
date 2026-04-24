"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Camera, Code2, Link2, Mail, MapPin, Send, Clock3, ShieldCheck, Briefcase } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

const DEFAULT_CONTACT = {
  email: "rahulchakradharperepogu@gmail.com",
  location: "Bengaluru, Karnataka",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

export default function Contact() {
  const { reducedMotion } = useMotionPreferences();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [contactData, setContactData] = useState(DEFAULT_CONTACT);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [loadingContact, setLoadingContact] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load contact content');
        const data = await res.json();
        if (data.content) {
          setSiteCopy(getSiteCopy(data.content));
          setContactData({
            email: data.content.email || DEFAULT_CONTACT.email,
            location: data.content.location || DEFAULT_CONTACT.location,
            instagram: data.content.instagram || DEFAULT_CONTACT.instagram,
            linkedin: data.content.linkedin || DEFAULT_CONTACT.linkedin,
            github: data.content.github || DEFAULT_CONTACT.github,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load contact section'));
      } finally {
        setLoadingContact(false);
      }
    };

    fetchContactData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || siteCopy.contactSuccess,
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || siteCopy.contactError,
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: siteCopy.contactError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) throw error;
  if (loadingContact) {
    return (
      <section className="section-soft relative overflow-hidden px-4 py-16 md:py-24" id="contact">
        <LoadingSkeleton variant="contact" />
      </section>
    );
  }

  return (
    <section className="section-soft relative overflow-hidden px-4 py-16 md:py-24" id="contact">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:46px_46px]" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-0 sm:px-2 lg:px-6">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fast response, clear scope
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-white to-indigo-200 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            {siteCopy.contactHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-slate-300 sm:text-base md:text-xl">
            {siteCopy.contactSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-cyan-300 to-indigo-300 md:mt-6 md:w-24" />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-5 md:space-y-6"
          >
            <div className="premium-card rounded-[1.75rem] p-5 sm:p-6">
              <h3 className="text-2xl font-bold text-white md:text-3xl">{siteCopy.contactIntroTitle}</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">
                {siteCopy.contactIntroBody}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, label: "Response", value: "1-2 business days" },
                { icon: Briefcase, label: "Best for", value: "Product briefs" },
                { icon: ShieldCheck, label: "Approach", value: "Clear scope first" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="premium-card rounded-2xl p-4">
                    <Icon className="h-5 w-5 text-cyan-200" />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.01 }}
                className="premium-card flex items-center gap-3 rounded-2xl p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(34,211,238,0.22)_0%,rgba(99,102,241,0.22)_100%)]">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Email</div>
                  <div className="truncate text-sm text-slate-300">{contactData.email}</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.01 }}
                className="premium-card flex items-center gap-3 rounded-2xl p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(34,211,238,0.22)_0%,rgba(99,102,241,0.22)_100%)]">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Location</div>
                  <div className="text-sm text-slate-300">{contactData.location}</div>
                </div>
              </motion.div>
            </div>

            <div className="premium-card rounded-[1.75rem] p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{siteCopy.contactSocialPrompt}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                  title="Instagram"
                >
                  <Camera className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                  title="LinkedIn"
                >
                  <Link2 className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                  title="GitHub"
                >
                  <Code2 className="h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={reducedMotion ? false : { opacity: 0, x: 50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            onSubmit={handleSubmit}
            className="premium-card rounded-[1.75rem] p-5 text-white md:p-8"
          >
            <h3 className="text-xl font-bold text-white md:text-2xl">{siteCopy.contactFormTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Share the scope, goals, and timeline. I’ll reply with a clear next step.
            </p>

            {submitStatus && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -10 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                className={`mt-5 rounded-2xl border p-4 text-sm md:text-base ${
                  submitStatus.type === "success"
                    ? "border-cyan-300/20 bg-cyan-300/8 text-cyan-100"
                    : "border-rose-300/20 bg-rose-300/8 text-rose-100"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <div className="mt-6 space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/20"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/20"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/20"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/20"
                  placeholder="Project Discussion"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/20"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
                Your message goes straight to the inbox. No noise, no clutter.
              </div>

              <motion.button
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-300 px-6 py-4 font-semibold text-[#0b0f19] shadow-[0_18px_36px_rgba(34,211,238,0.18)] transition-all duration-300 hover:shadow-[0_22px_48px_rgba(34,211,238,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
