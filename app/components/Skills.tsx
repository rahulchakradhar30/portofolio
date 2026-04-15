"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@/app/lib/types";

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/admin/skills');
        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-violet-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-3 md:opacity-5">
        <div className="absolute top-5 md:top-10 left-5 md:left-10 w-16 md:w-20 h-16 md:h-20 border border-violet-300 rounded-full"></div>
        <div className="absolute top-24 md:top-40 right-5 md:right-20 w-12 md:w-16 h-12 md:h-16 border border-pink-300 rounded-full"></div>
        <div className="absolute bottom-10 md:bottom-20 left-1/4 w-16 md:w-24 h-16 md:h-24 border border-green-300 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-4 md:mb-6">
            Skills & Expertise
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            A comprehensive toolkit of technologies and methodologies I use to bring ideas to life
          </p>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-4 md:mt-6"></div>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500 py-8 md:py-12">Loading skills...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {skills.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No skills found.</div>
            ) : (
              skills.map((skill, index) => (
                <motion.div
                  key={skill.id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white/80 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm"
                >
                  <div className="w-12 md:w-16 h-12 md:h-16 rounded-lg md:rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center mb-4 md:mb-6 shadow-lg flex-shrink-0">
                    <span className="text-xl md:text-2xl">{skill.icon || "📚"}</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">{skill.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{skill.description}</p>

                  {/* Progress bar */}
                  <div className="mt-4 md:mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency || 80}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        className="h-2 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full"
                      ></motion.div>
                    </div>
                    <div className="text-right text-xs md:text-sm text-gray-500 mt-1">{skill.proficiency || 80}%</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}