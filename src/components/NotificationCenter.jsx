import { motion } from 'framer-motion'
import { Bell, Satellite, Newspaper, Info, X } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const notifications = [
  { id: 1, icon: Satellite, color: 'text-space-400', bg: 'bg-space-500/10', title: 'ISS Tracking Active', desc: 'Live position updates every 15 seconds', time: 'Now' },
  { id: 2, icon: Newspaper, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'News Cache Ready', desc: 'Latest articles loaded successfully', time: '1m ago' },
  { id: 3, icon: Info, color: 'text-green-400', bg: 'bg-green-500/10', title: 'System Online', desc: 'All services operational', time: '2m ago' },
]

export default function NotificationCenter({ onClose }) {
  const ref = useRef()
  const { isDark } = useTheme()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl border overflow-hidden shadow-2xl"
      style={{
        background: isDark ? 'rgba(13, 18, 32, 0.98)' : 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-space-400" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Notifications</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors">
          <X size={14} style={{ color: 'var(--color-muted)' }} />
        </button>
      </div>

      <div className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.04)' }}>
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.bg}`}>
              <n.icon size={15} className={n.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{n.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{n.desc}</p>
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--color-muted)' }}>{n.time}</span>
          </motion.div>
        ))}
      </div>

      <div className="px-4 py-2 text-center">
        <button className="text-xs text-space-400 hover:text-space-300 transition-colors">
          Mark all as read
        </button>
      </div>
    </motion.div>
  )
}
