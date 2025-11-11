'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { 
    messages, 
    input, 
    setInput, 
    sendMessage, 
    isLoading,
    clearChat 
  } = useChat()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 group"
          >
            <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              ?
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Converso Support</h3>
                  <p className="text-xs text-white/80">We're here to help! 🚀</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setIsMinimized(false)
                  }}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content - Only show if not minimized */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                  {/* Welcome Message */}
                  {messages.length === 0 && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        👋 Hi! I'm your Converso Support assistant. Ask me anything about:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li>• How to use features (companions, sessions, recaps)</li>
                        <li>• Learning strategies and study tips</li>
                        <li>• Account and progress tracking</li>
                        <li>• Bookmarks and favorites</li>
                        <li>• Reporting bugs or requesting features</li>
                      </ul>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Thinking...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-orange-500 to-pink-600 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setInput("How do I bookmark a companion?")}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      📌 Bookmarks
                    </button>
                    <button
                      onClick={() => setInput("How do session recaps work?")}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      📚 Recaps
                    </button>
                    <button
                      onClick={clearChat}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
