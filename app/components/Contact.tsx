"use client";

import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Camera, Code2, Link2, Mail, MapPin, Send, Clock3, ShieldCheck, Briefcase } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

const DEFAULT_CONTACT = {
  email: "rahulchakradharperepogu@gmail.com",
  location: "Bengaluru, Karnataka",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

import { usePortfolioContent } from "./PortfolioContentProvider";

export default function Contact() {
  const { content, loading: contentLoading, error: _contentError } = usePortfolioContent();
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

  const contactData = useMemo(() => {
    if (!content) return DEFAULT_CONTACT;
    return {
      email: content.email || DEFAULT_CONTACT.email,
      location: content.location || DEFAULT_CONTACT.location,
      instagram: content.instagram || DEFAULT_CONTACT.instagram,
      linkedin: content.linkedin || DEFAULT_CONTACT.linkedin,
      github: content.github || DEFAULT_CONTACT.github,
    };
  }, [content]);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.contact !== false : true;

  const sanitizeContactText = (value: string) => value
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u200D\uFE0F]/g, "");

  if (contentLoading && isVisible) {
    return (
      <section className="relative px-4 py-24 sm:px-6 lg:px-10">
        <LoadingSkeleton variant="contact" />
      </section>
    );
  }
  if (!isVisible) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: sanitizeContactText(value),
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

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-32 lg:px-10" id="contact">
      <div className="relative z-10 mx-auto max-w-[1600px] px-0 sm:px-2 lg:px-6">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em] gap-2">
            <ShieldCheck className="h-4 w-4" />
            Fast response, clear scope
          </div>
          <h2 className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            {siteCopy.contactHeading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium">
            {siteCopy.contactSubtitle}
          </p>
          <div className="mx-auto mt-8 h-1 w-24 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        <ExpandableSection collapsedMaxHeightPx={850}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -30 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="paper-card p-6 sm:p-8 border-none bg-transparent shadow-none">
              <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tight">{siteCopy.contactIntroTitle}</h3>
              <p className="mt-4 text-lg font-medium leading-relaxed">
                {siteCopy.contactIntroBody}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock3, label: "Response", value: "1-2 business days" },
                { icon: Briefcase, label: "Best for", value: "Product briefs" },
                { icon: ShieldCheck, label: "Approach", value: "Clear scope first" },
              ].map((item, _idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    whileHover={reducedMotion ? undefined : { y: -4, scale: 1.02 }}
                    className="paper-card p-5 transition-transform"
                  >
                    <Icon className="h-6 w-6 text-[var(--foreground)] mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{item.label}</p>
                    <p className="mt-1 text-base font-black text-[var(--foreground)]">{item.value}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                className="paper-card flex items-center gap-4 p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--foreground)] rounded bg-[var(--surface-soft)]">
                  <Mail className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Email</div>
                  <div className="truncate text-base font-black text-[var(--foreground)]">{contactData.email}</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                className="paper-card flex items-center gap-4 p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--foreground)] rounded bg-[var(--surface-soft)]">
                  <MapPin className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Location</div>
                  <div className="text-base font-black text-[var(--foreground)]">{contactData.location}</div>
                </div>
              </motion.div>
            </div>

            <div className="paper-card p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{siteCopy.contactSocialPrompt}</p>
              <div className="mt-5 flex flex-wrap gap-4">
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button inline-flex h-12 w-12 items-center justify-center p-0"
                  title="Instagram"
                >
                  <Camera className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button inline-flex h-12 w-12 items-center justify-center p-0"
                  title="LinkedIn"
                >
                  <Link2 className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  href={contactData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button inline-flex h-12 w-12 items-center justify-center p-0"
                  title="GitHub"
                >
                  <Code2 className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={reducedMotion ? false : { opacity: 0, x: 30 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            onSubmit={handleSubmit}
            className="paper-card p-6 md:p-10"
          >
            <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">{siteCopy.contactFormTitle}</h3>
            <p className="mt-3 text-base font-medium">
              Share the scope, goals, and timeline. I’ll reply with a clear next step.
            </p>

            {submitStatus && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -10 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                className={`mt-6 p-5 text-sm md:text-base font-bold uppercase tracking-widest editorial-border ${
                  submitStatus.type === "success"
                    ? "bg-[var(--surface-soft)] text-[var(--foreground)]"
                    : "bg-red-50 text-red-900 border-red-900"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-[var(--foreground)] bg-white px-5 py-4 text-base font-bold text-[var(--foreground)] placeholder-gray-400 transition-colors focus:bg-[var(--surface-soft)] focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-[var(--foreground)] bg-white px-5 py-4 text-base font-bold text-[var(--foreground)] placeholder-gray-400 transition-colors focus:bg-[var(--surface-soft)] focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-[var(--foreground)] bg-white px-5 py-4 text-base font-bold text-[var(--foreground)] placeholder-gray-400 transition-colors focus:bg-[var(--surface-soft)] focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-[var(--foreground)] bg-white px-5 py-4 text-base font-bold text-[var(--foreground)] placeholder-gray-400 transition-colors focus:bg-[var(--surface-soft)] focus:outline-none"
                  placeholder="Project Discussion"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full resize-none border-2 border-[var(--foreground)] bg-white px-5 py-4 text-base font-bold text-[var(--foreground)] placeholder-gray-400 transition-colors focus:bg-[var(--surface-soft)] focus:outline-none"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 border-2 border-[var(--foreground)] bg-[var(--surface-strong)] p-4 text-sm font-bold text-[var(--foreground)]">
                <ShieldCheck className="h-5 w-5 text-[var(--foreground)]" />
                Your message goes straight to the inbox. No noise, no clutter.
              </div>

              <motion.button
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="paper-button-primary w-full justify-center px-8 py-5 text-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="mr-3 h-5 w-5" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </motion.form>
          </div>
        </ExpandableSection>
      </div>
    </section>
  );
}
