"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Skills() {
  const [skills, setSkills] = useState<any[]>([]);
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

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading skills...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No skills found.</div>
            ) : (
              skills.map((skill, index) => (
                <motion.div
                  key={skill.id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="bg-white/80 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl">{skill.icon || "📚"}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{skill.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{skill.description}</p>

                  {/* Progress bar */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency || 80}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        className="h-2 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full"
                      ></motion.div>
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">{skill.proficiency || 80}%</div>
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