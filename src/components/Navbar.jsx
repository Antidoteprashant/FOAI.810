import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Satellite, Menu, X, Sun, Moon, Bell, Wifi, WifiOff, Clock
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useISS } from '../context/ISSContext'
import NotificationCenter from './NotificationCenter'

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { theme, toggleTheme, isDark } = useTheme()
  const { loading, error, lastUpdated } = useISS()
  const [time, setTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()

  // Live UTC clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const utcTime = time.toUTCString().match(/\d{2}:\d{2}:\d{2}/)?.[0] || ''
  const utcDate = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

  return (
    <motion.nav
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 w-full"
    >
      <div
        className="px-4 py-3 border-b flex items-center justify-between gap-4"
        style={{
          background: isDark
            ? 'rgba(10, 14, 26, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            id="menu-toggle-btn"
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5a7df3, #c44df3)' }}>
                <Satellite size={16} className="text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2"
                style={{ borderColor: isDark ? '#0a0e1a' : '#fff' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <span className="font-bold text-sm font-display text-gradient-blue hidden sm:block">
                ISS&nbsp;
              </span>
              <span className="font-bold text-sm font-display hidden sm:block" style={{ color: 'var(--color-text)' }}>
                & News Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Status */}
        <div className="hidden md:flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {error ? (
              <><WifiOff size={14} className="text-red-400" /><span className="text-xs text-red-400">Reconnecting</span></>
            ) : loading ? (
              <><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}><Wifi size={14} className="text-yellow-400" /></motion.div><span className="text-xs text-yellow-400">Fetching...</span></>
            ) : (
              <><div className="pulse-dot" /><span className="text-xs" style={{ color: 'var(--color-muted)' }}>Live Tracking</span></>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />

          {/* UTC Clock */}
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: 'var(--color-muted)' }} />
            <div className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
              <span className="text-space-400 font-semibold">{utcTime}</span>
              <span className="ml-1 opacity-60">{utcDate} UTC</span>
            </div>
          </div>

          {lastUpdated && (
            <>
              <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(v => !v)}
              className="p-2 rounded-lg transition-colors hover:bg-white/10 relative"
              aria-label="Notifications"
            >
              <Bell size={18} style={{ color: 'var(--color-muted)' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-space-500 block" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <NotificationCenter onClose={() => setShowNotifications(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={18} className="text-yellow-400" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={18} className="text-space-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
