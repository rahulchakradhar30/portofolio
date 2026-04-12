"use client";

import { motion } from "framer-motion";
import { Heart, Code, Link, Hash, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-violet-300 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border border-pink-300 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 border border-green-300 rounded-full"></div>
      </div>

      <div className="relative z-10 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-2"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-4">
                PEREPOGU RAHUL CHAKRADHAR
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Full Stack Developer & Creative Designer passionate about crafting exceptional digital experiences
                that blend innovation with functionality.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-violet-600 transition-colors duration-300"
                >
                  <Code className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Link className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors duration-300"
                >
                  <Hash className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="mailto:perepogu.rahul@gmail.com"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-300"
                >
                  <Mail className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-violet-400 transition-colors">About</a></li>
                <li><a href="#skills" className="text-gray-400 hover:text-violet-400 transition-colors">Skills</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-violet-400 transition-colors">Projects</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-violet-400 transition-colors">Contact</a></li>
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Web Development</span></li>
                <li><span className="text-gray-400">UI/UX Design</span></li>
                <li><span className="text-gray-400">Mobile Apps</span></li>
                <li><span className="text-gray-400">Consulting</span></li>
              </ul>
            </motion.div>
          </div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} PEREPOGU RAHUL CHAKRADHAR. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> and lots of coffee
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}