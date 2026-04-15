import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, Sparkles, Minimize2, Maximize2 } from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onContentGenerated?: (content: string, type: 'description' | 'details') => void;
}

export default function AIAssistant({ onContentGenerated }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'description' | 'details'>('description');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          type: selectedType,
        }),
      });

      const data = await response.json();

      // Add AI response
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseContent = (content: string) => {
    if (onContentGenerated) {
      onContentGenerated(content, selectedType);
    }
    setMessages([]);
    setIsOpen(false);
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
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
            className="fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">AI Content Generator</h3>
                  <p className="text-xs text-white/80">Generate descriptions & details</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
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
                    setMessages([]);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Type Selector */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex gap-2">
                  <button
                    onClick={() => setSelectedType('description')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      selectedType === 'description'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-violet-400'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setSelectedType('details')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      selectedType === 'details'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-violet-400'
                    }`}
                  >
                    Details
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Describe your {selectedType} and I'll generate professional content
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-violet-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-black rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className={`text-xs px-2 py-1 rounded transition ${
                                copiedId === msg.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {copiedId === msg.id ? '✓ Copied' : <Copy className="w-3 h-3 inline" />}
                            </button>
                            <button
                              onClick={() => handleUseContent(msg.content)}
                              className="text-xs px-2 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 transition"
                            >
                              Use this
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 rounded-bl-none">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          handleGenerate();
                        }
                      }}
                      placeholder="Describe what you need..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !input.trim()}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
