"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="py-24 px-8 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-violet-400 to-green-400"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-600 leading-relaxed">
              I'm a passionate AI enthusiast, tech learner, content creator, and director who believes in creating innovative solutions for real-world problems. As a quick learner and innovative student, I explore all technologies and love building new solutions that benefit both companies and society.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              My focus lies in AI, technology, and content creation. I excel in problem-solving and logical reasoning, and I'm comfortable working across various fields - from software to hardware, irrespective of the domain. I prefer partnerships and entrepreneurship over traditional salaried jobs, seeking opportunities where I can generate revenue while doing what I love.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">AI Enthusiast</span>
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">Tech Learner</span>
              <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Content Creator</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Director</span>
              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Problem Solver</span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Innovator</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-violet-100 to-pink-100 p-8 rounded-3xl shadow-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-600 mb-2">3+</div>
                    <div className="text-sm text-gray-600">Major Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">600+</div>
                    <div className="text-sm text-gray-600">Students Led</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                    <div className="text-sm text-gray-600">Projects Organized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600 mb-2">90%</div>
                    <div className="text-sm text-gray-600">Cost Reduction</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}