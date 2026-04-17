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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          type: selectedType,
        }),
        signal: controller.signal,
      });

      window.clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI service returned an error');
      }

      const content = typeof data.content === 'string' && data.content.trim()
        ? data.content
        : 'Sorry, I could not generate content right now. Please try again.';

      // Add AI response
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error instanceof Error && error.name === 'AbortError'
        ? 'The AI request timed out. Please try again.'
        : 'AI is temporarily unavailable. Please try again in a moment.');
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error && error.name === 'AbortError'
          ? 'The AI request timed out. Please try again.'
          : 'Sorry, I encountered an error. Please try again.',
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
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-600 text-white shadow-lg transition-shadow hover:shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
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
            className="fixed inset-x-3 bottom-3 top-3 z-50 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[550px] sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-4 text-white sm:px-6">
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
                <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 overflow-x-auto">
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

                {error && (
                  <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {error}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4">
                  {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Describe your {selectedType} and I&apos;ll generate professional content
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
                      <div className="max-w-[85%] rounded-lg rounded-bl-none bg-gray-100 px-4 py-2 text-gray-700 sm:max-w-xs">
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
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          handleGenerate();
                        }
                      }}
                      placeholder="Describe what you need..."
                      className="min-w-0 flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !input.trim()}
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title={loading ? 'Generating...' : 'Send'}
                    >
                      {loading ? <span className="text-xs font-semibold">...</span> : <Send className="w-4 h-4" />}
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
