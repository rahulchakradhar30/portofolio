"use client";

import { motion } from "framer-motion";
import { ExternalLink, Code, Eye, Star } from "lucide-react";

const projects = [
  {
    title: "WEATHER_X_GITAM",
    description: "A low-cost weather monitoring station built for just ₹4,000 (vs ₹40,000 market cost). Designed for rural areas and farmers, providing pinpoint location weather data for agricultural decision-making.",
    tech: ["IoT", "Hardware", "Sensors", "Embedded Systems"],
    github: "#",
    demo: "#",
    image: "/api/placeholder/400/300",
    featured: true,
    category: "IoT/Hardware"
  },
  {
    title: "EESHAN - THE PROTECTOR",
    description: "A zero-budget mythological sci-fi cinematic experiment. An AI-assisted film blending ancient mythology with futuristic science fiction, exploring themes of Dharma, Order, and cosmic balance.",
    tech: ["AI Tools", "Filmmaking", "Visual Effects", "Sound Design"],
    github: "#",
    demo: "#",
    image: "/api/placeholder/400/300",
    featured: true,
    category: "Film/AI"
  },
  {
    title: "Chakradhar OTT Platform",
    description: "Full-stack OTT platform with live premiere events. Features movie streaming, ticket-based live events, admin-controlled ecosystem, and integrated payment system.",
    tech: ["Next.js", "Firebase", "Razorpay", "Real-time Chat"],
    github: "#",
    demo: "#",
    image: "/api/placeholder/400/300",
    featured: true,
    category: "Web Development"
  },
  {
    title: "TEPE EXPO'25",
    description: "Led organization of Technology Exploration and Product Engineering Expo. Managed 600+ students, 100+ projects, and 20+ volunteers. Successfully executed large-scale technical event.",
    tech: ["Event Management", "Leadership", "Project Coordination"],
    github: "#",
    demo: "#",
    image: "/api/placeholder/400/300",
    featured: false,
    category: "Leadership"
  },
  {
    title: "AI Content Creation",
    description: "Published article 'AI is the Future - But Humans are the core..' exploring the balance between AI advancement and human creativity. Creating content that bridges technology and society.",
    tech: ["Content Writing", "AI Research", "Digital Marketing"],
    github: "#",
    demo: "https://www.linkedin.com/posts/perepogu-rahul-chakradhar-721017379_ai-is-the-future-but-humans-are-the-core-activity-7429930565904064512-F1Lo",
    image: "/api/placeholder/400/300",
    featured: false,
    category: "Content"
  },
  {
    title: "Tech Innovation Hub",
    description: "Building partnerships and entrepreneurial ventures focused on AI, IoT, and content creation. Creating revenue-generating solutions across multiple technological domains.",
    tech: ["Entrepreneurship", "Partnerships", "Innovation"],
    github: "#",
    demo: "#",
    image: "/api/placeholder/400/300",
    featured: false,
    category: "Business"
  },
];

export default function Projects() {
  return (
    <section className="py-24 px-8 bg-white relative">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-green-400 via-violet-400 to-pink-400"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A showcase of my recent work, blending creativity with cutting-edge technology
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-violet-100 to-pink-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20"></div>
                <div className="absolute top-4 left-4">
                  {project.featured && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/80 text-gray-700 text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.github}
                    className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    <Code className="w-5 h-5 mr-2" />
                    Code
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.demo}
                    className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Demo
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            View All Projects
          </button>
        </motion.div>
      </div>
    </section>
  );
}