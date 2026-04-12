"use client";

import { motion } from "framer-motion";
import { Code, Palette, Database, Smartphone, Cloud, Zap } from "lucide-react";

const skills = [
  {
    icon: Code,
    title: "AI & Machine Learning",
    description: "Exploring AI technologies, building intelligent solutions, and creating AI-powered content",
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-blue-50"
  },
  {
    icon: Palette,
    title: "Content Creation",
    description: "Video production, filmmaking, digital content creation, and creative direction",
    color: "from-pink-400 to-rose-400",
    bgColor: "bg-pink-50"
  },
  {
    icon: Database,
    title: "Full Stack Development",
    description: "Building scalable web applications, OTT platforms, and digital solutions",
    color: "from-green-400 to-emerald-400",
    bgColor: "bg-green-50"
  },
  {
    icon: Smartphone,
    title: "IoT & Hardware",
    description: "Weather monitoring stations, hardware prototyping, and embedded systems",
    color: "from-violet-400 to-purple-400",
    bgColor: "bg-violet-50"
  },
  {
    icon: Cloud,
    title: "Tech Entrepreneurship",
    description: "Building partnerships, creating revenue-generating solutions, and innovative ventures",
    color: "from-orange-400 to-red-400",
    bgColor: "bg-orange-50"
  },
  {
    icon: Zap,
    title: "Problem Solving",
    description: "Logical reasoning, innovative solutions, and tackling complex challenges",
    color: "from-yellow-400 to-amber-400",
    bgColor: "bg-yellow-50"
  },
];

export default function Skills() {
  return (
    <section className="py-24 px-8 bg-gradient-to-br from-gray-50 to-violet-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-violet-300 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-pink-300 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border border-green-300 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
            Skills & Expertise
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive toolkit of technologies and methodologies I use to bring ideas to life
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className={`${skill.bgColor} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-6 shadow-lg`}>
                <skill.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{skill.title}</h3>
              <p className="text-gray-600 leading-relaxed">{skill.description}</p>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="w-full bg-white/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "85%" }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    className={`h-2 bg-gradient-to-r ${skill.color} rounded-full`}
                  ></motion.div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">85%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}