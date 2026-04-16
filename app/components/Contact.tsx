"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, Camera, Briefcase, Code } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";

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
  const [loadingContact, setLoadingContact] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load contact content');
        const data = await res.json();
        if (data.content) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          message: result.message || "Message sent successfully! I&apos;ll get back to you soon.",
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
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again later.",
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
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <div className="absolute top-10 md:top-20 right-10 md:right-20 w-24 md:w-32 h-24 md:h-32 bg-green-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-28 md:w-40 h-28 md:h-40 bg-violet-200 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-0 sm:px-2 lg:px-6">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="mb-4 bg-gradient-to-r from-[#0d1b2d] to-[#0f766e] bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            Get In Touch
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm text-slate-700 sm:text-base md:text-xl">
            Ready to bring your ideas to life? Let&apos;s create something amazing together
          </p>
          <div className="mx-auto mt-4 h-1 w-16 bg-gradient-to-r from-amber-300 to-cyan-300 md:mt-6 md:w-24"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-6 md:space-y-8"
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Let&apos;s Connect</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                I&apos;m always excited to discuss new opportunities, share ideas, or collaborate on innovative projects.
                Whether you have a question or just want to say hello, I&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                className="flex items-center rounded-xl border border-cyan-100/80 bg-white p-3 shadow-md transition-shadow hover:shadow-lg md:rounded-2xl md:p-4"
              >
                <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 md:mr-4 md:h-12 md:w-12 md:rounded-xl">
                  <Mail className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">Email</div>
                  <div className="text-gray-600 text-xs md:text-sm truncate">{contactData.email}</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                className="flex items-center rounded-xl border border-cyan-100/80 bg-white p-3 shadow-md transition-shadow hover:shadow-lg md:rounded-2xl md:p-4"
              >
                <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 md:mr-4 md:h-12 md:w-12 md:rounded-xl">
                  <MapPin className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm md:text-base">Location</div>
                  <div className="text-gray-600 text-xs md:text-sm">{contactData.location}</div>
                </div>
              </motion.div>
            </div>

            <div className="pt-6 md:pt-8">
              <p className="text-gray-600 text-sm md:text-base mb-4">Follow me on social media</p>
              <div className="flex gap-3 md:gap-4">
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.1, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                  href={contactData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl md:h-12 md:w-12 md:rounded-xl"
                  title="Instagram"
                >
                  <Camera className="w-5 md:w-6 h-5 md:h-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.1, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl md:h-12 md:w-12 md:rounded-xl"
                  title="LinkedIn"
                >
                  <Briefcase className="w-5 md:w-6 h-5 md:h-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { scale: 1.1, y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                  href={contactData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg transition-all duration-300 hover:shadow-xl md:h-12 md:w-12 md:rounded-xl"
                  title="GitHub"
                >
                  <Code className="w-5 md:w-6 h-5 md:h-6" />
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
            className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-lg md:rounded-3xl md:p-8 md:shadow-2xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Send a Message</h3>

            {submitStatus && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -10 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                className={`p-3 md:p-4 rounded-lg md:rounded-xl mb-4 md:mb-6 text-sm md:text-base ${
                  submitStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 md:rounded-xl md:px-4 md:py-3 md:text-base"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Project Discussion"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <motion.button
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
