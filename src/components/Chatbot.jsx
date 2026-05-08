import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, X, Send, Trash2, Bot, User, Loader2, Sparkles
} from 'lucide-react'
import { useISS } from '../context/ISSContext'
import { useNews } from '../context/NewsContext'
import { chatWithAI } from '../services/chatService'

const STORAGE_KEY = 'iss-chatbot-messages'
const MAX_MESSAGES = 30

const SUGGESTED_QUESTIONS = [
  "Where is the ISS right now?",
  "What is the ISS speed?",
  "How many astronauts are in space?",
  "Summarize latest news",
  "Which news source has most articles?",
]

// Render message text with markdown-like formatting
function MessageText({ text }) {
  const formatted = text
    .split('\n')
    .map((line, i) => {
      // Bold
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <span key={i} className={i > 0 ? 'block' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="font-semibold text-space-300">{part}</strong> : part
          )}
        </span>
      )
    })
  return <div className="text-sm leading-relaxed">{formatted}</div>
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { position, positions, speeds, astronauts, nearestLocation, trackedCount } = useISS()
  const { filteredArticles } = useNews()

  // Auto-scroll
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, typing])

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
    } catch {}
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim() || input.trim()
    if (!trimmed || typing) return

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const issData = { position, speeds, astronauts, nearestLocation, trackedCount }
      const response = await chatWithAI(trimmed, issData, filteredArticles)

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: response,
        time: new Date().toLocaleTimeString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: "I encountered an error processing your request. Please try again.",
        time: new Date().toLocaleTimeString(),
      }])
    } finally {
      setTyping(false)
    }
  }, [input, typing, position, speeds, astronauts, nearestLocation, trackedCount, filteredArticles])

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        id="chatbot-toggle-btn"
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open
            ? '0 0 0 0 rgba(90,125,243,0)'
            : ['0 0 0 0 rgba(90,125,243,0.4)', '0 0 0 12px rgba(90,125,243,0)', '0 0 0 0 rgba(90,125,243,0)'],
        }}
        transition={{ duration: 2, repeat: open ? 0 : Infinity }}
        aria-label="Open AI Chatbot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageSquare size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '500px',
              background: 'rgba(10, 14, 26, 0.97)',
              border: '1px solid rgba(90, 125, 243, 0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(90,125,243,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(90,125,243,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}>
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">ISS AI Assistant</p>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    Powered by Mistral-7B
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={14} style={{ color: 'rgba(148,163,184,0.7)' }} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={14} style={{ color: 'rgba(148,163,184,0.7)' }} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Welcome message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}>
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]"
                      style={{ background: 'rgba(90,125,243,0.12)', border: '1px solid rgba(90,125,243,0.2)' }}>
                      <p className="text-sm text-white leading-relaxed">
                        👋 Hi! I'm your ISS & News assistant. Ask me about the ISS position, speed, crew, or latest news!
                      </p>
                    </div>
                  </div>

                  {/* Suggested questions */}
                  <div className="space-y-1.5">
                    <p className="text-xs px-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Try asking:</p>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl transition-colors hover:text-white"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(148,163,184,0.8)',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(90,125,243,0.12)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        💬 {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-space-500/20'
                      : 'bg-gradient-to-br from-space-500 to-cosmic-500'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={13} className="text-space-400" />
                      : <Bot size={13} className="text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(90,125,243,0.25), rgba(90,125,243,0.15))'
                        : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(90,125,243,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <MessageText text={msg.text} />
                    <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}>
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="typing-dots flex gap-1">
                        <span /><span /><span />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(90,125,243,0.15)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  id="chatbot-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about ISS or news..."
                  disabled={typing}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(90,125,243,0.2)',
                    color: 'white',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(90,125,243,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(90,125,243,0.2)'}
                />
                <button
                  id="chatbot-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}
                >
                  {typing ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
                </button>
              </div>
              <p className="text-xs text-center mt-2" style={{ color: 'rgba(148,163,184,0.4)' }}>
                Only answers ISS & news questions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
