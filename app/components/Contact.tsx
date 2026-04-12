"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, Camera, Briefcase, Code } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
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
          message: result.message || "Message sent successfully! I''ll get back to you soon.",
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

  return (
    <section className="py-24 px-8 bg-gradient-to-br from-violet-50 to-pink-50 relative overflow-hidden" id="contact">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-violet-200 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to bring your ideas to life? Let&apos;s create something amazing together
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Let&apos;s Connect</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                I&apos;m always excited to discuss new opportunities, share ideas, or collaborate on innovative projects.
                Whether you have a question or just want to say hello, I&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 bg-white rounded-2xl shadow-lg border border-white/50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Email</div>
                  <div className="text-gray-600">rahulchakradharperepogu@gmail.com</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 bg-white rounded-2xl shadow-lg border border-white/50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Location</div>
                  <div className="text-gray-600">Bengaluru, Karnataka</div>
                </div>
              </motion.div>
            </div>

            <div className="pt-8">
              <p className="text-gray-600 mb-4">Follow me on social media</p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://www.instagram.com/rahul_chakradhar_30/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  title="Instagram: @rahul_chakradhar_30"
                >
                  <Camera className="w-6 h-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  title="LinkedIn: Perepogu Rahul Chakradhar"
                >
                  <Briefcase className="w-6 h-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://github.com/rahulchakradhar30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  title="GitHub: @rahulchakradhar30"
                >
                  <Code className="w-6 h-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-2xl border border-white/50"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h3>

            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 ${
                  submitStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
