"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Award, X } from "lucide-react";
import type { Certification } from "@/app/lib/types";

export default function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const res = await fetch('/api/admin/certifications');
        if (res.ok) {
          const data = await res.json();
          setCertifications(data.certifications || []);
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  return (
    <section className="py-24 px-8 bg-gradient-to-br from-white to-violet-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-violet-400 to-pink-400"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-violet-700 bg-clip-text text-transparent mb-6">
            Certifications
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional certifications and credentials validating my expertise
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-violet-400 mx-auto mt-6"></div>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading certifications...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certifications.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No certifications found.</div>
            ) : (
              certifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                  onClick={() => setSelectedCert(cert)}
                >
                  {/* Certificate Image */}
                  <div className="relative h-56 bg-gradient-to-br from-violet-100 to-pink-100 overflow-hidden flex items-center justify-center">
                    {cert.image ? (
                      <img 
                        src={cert.image} 
                        alt={cert.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Award className="w-16 h-16 text-violet-400 mb-2" />
                        <span className="text-gray-500">Certificate</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-semibold">See Details</span>
                    </div>
                    {cert.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-semibold">Issuer:</span> {cert.issuer}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCert(cert);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal for Certificate Details */}
      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{selectedCert.title}</h2>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Certificate Image */}
              {selectedCert.image && (
                <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                  <img 
                    src={selectedCert.image} 
                    alt={selectedCert.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Issuer</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedCert.issuer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Issued Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(selectedCert.issuedDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(selectedCert.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedCert.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              {/* Credential Links */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {selectedCert.credentialUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Credential
                  </motion.a>
                )}
                {selectedCert.linkedinUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedCert.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on LinkedIn
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
