'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Minimize2, Maximize2, ExternalLink, MessageCircle } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openChatGPT = () => {
    window.open('https://chat.openai.com', '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
        title="Open ChatGPT"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed ${
              isMinimized ? 'bottom-24 right-6 w-96 h-16' : 'bottom-24 right-6 w-96 h-[600px]'
            } bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">ChatGPT Assistant</h3>
                  {!isMinimized && <p className="text-xs text-white/80">Free & Unlimited</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center text-center">
                {/* Icon */}
                <div className="mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <MessageCircle className="w-20 h-20 text-blue-600" />
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ChatGPT</h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-xs">
                  Get unlimited, free access to ChatGPT. Click the button below to open ChatGPT and start chatting with AI!
                </p>

                {/* Features List */}
                <div className="text-left mb-6 space-y-2 w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Free & Unlimited</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>No API Keys Needed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Full ChatGPT Features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Web Browsing & Code</span>
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openChatGPT}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold mb-3"
                >
                  <span>Open ChatGPT</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.button>

                {/* Helper Text */}
                <p className="text-xs text-gray-500">
                  💡 Opens in a new window or tab
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
