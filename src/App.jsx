import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ISSProvider } from './context/ISSContext'
import { NewsProvider } from './context/NewsContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import Dashboard from './pages/Dashboard'
import ISSTracker from './pages/ISSTracker'
import News from './pages/News'
import Analytics from './pages/Analytics'
import { motion, AnimatePresence } from 'framer-motion'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : 'light'}`}
      style={{ background: 'var(--color-bg)' }}>

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Stars background */}
        <div className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 20% 50%, rgba(90,125,243,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(196,77,243,0.06) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 20% 50%, rgba(90,125,243,0.04) 0%, transparent 50%)',
          }}
        />
        {/* Animated star particles */}
        {isDark && Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <Navbar
        onMenuToggle={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 relative z-10">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main
          className="flex-1 min-w-0 transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '256px' : '0px',
          }}
        >
          {/* Responsive: no margin on mobile */}
          <style>{`
            @media (max-width: 768px) {
              main { margin-left: 0 !important; }
            }
          `}</style>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard />
                  </motion.div>
                } />
                <Route path="/iss" element={
                  <motion.div
                    key="iss"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ISSTracker />
                  </motion.div>
                } />
                <Route path="/news" element={
                  <motion.div
                    key="news"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <News />
                  </motion.div>
                } />
                <Route path="/charts" element={
                  <motion.div
                    key="charts"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Analytics />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating AI Chatbot */}
      <Chatbot />

      {/* Toast notifications */}
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? 'rgba(13, 18, 32, 0.95)' : 'rgba(255,255,255,0.95)',
            color: isDark ? '#e2e8f0' : '#1e293b',
            border: '1px solid rgba(90, 125, 243, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#4ade80', secondary: 'transparent' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: 'transparent' },
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <ISSProvider>
          <NewsProvider>
            <AppLayout />
          </NewsProvider>
        </ISSProvider>
      </ThemeProvider>
    </Router>
  )
}
