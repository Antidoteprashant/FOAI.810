import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Satellite, Newspaper, BarChart2, ChevronRight,
  Globe, Rocket, Users, TrendingUp, Map
} from 'lucide-react'
import { useISS } from '../context/ISSContext'
import { useNews } from '../context/NewsContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/iss', icon: Satellite, label: 'ISS Tracker', id: 'nav-iss' },
  { to: '/news', icon: Newspaper, label: 'News', id: 'nav-news' },
  { to: '/charts', icon: BarChart2, label: 'Analytics', id: 'nav-charts' },
]

export default function Sidebar({ open, onClose }) {
  const { position, astronauts, speeds } = useISS()
  const { filteredArticles } = useNews()
  const { isDark } = useTheme()

  const sidebarBg = isDark
    ? 'rgba(10, 14, 26, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-30 h-full w-64 flex flex-col pt-16 pb-4 border-r md:translate-x-0"
        style={{
          background: sidebarBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        {/* Navigation */}
        <div className="flex-1 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-4"
            style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, id }) => (
              <NavLink
                key={to}
                to={to}
                id={id}
                end={to === '/'}
                className={({ isActive }) =>
                  `sidebar-link group ${isActive ? 'active' : ''}`
                }
                onClick={() => window.innerWidth < 768 && onClose()}
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* Stats */}
          <div className="mt-6 mb-2 px-4">
            <p className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
              Live Stats
            </p>
          </div>

          <div className="space-y-2 px-2">
            {/* ISS Position */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-space-400" />
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                  ISS Position
                </span>
              </div>
              {position ? (
                <div className="space-y-0.5">
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text)' }}>
                    Lat: <span className="text-space-400">{position.lat?.toFixed(2)}°</span>
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text)' }}>
                    Lng: <span className="text-space-400">{position.lng?.toFixed(2)}°</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              )}
            </div>

            {/* Speed */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Rocket size={14} className="text-cosmic-400" />
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                  Current Speed
                </span>
              </div>
              {speeds.length > 0 ? (
                <p className="text-sm font-bold font-mono text-gradient-blue">
                  {speeds[speeds.length - 1]?.speed?.toLocaleString()} km/h
                </p>
              ) : (
                <div className="skeleton h-5 w-28 rounded" />
              )}
            </div>

            {/* Crew */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={14} className="text-green-400" />
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                  Crew in Space
                </span>
              </div>
              <p className="text-sm font-bold text-green-400">
                {astronauts.length} Astronauts
              </p>
            </div>

            {/* News */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp size={14} className="text-yellow-400" />
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                  News Articles
                </span>
              </div>
              <p className="text-sm font-bold text-yellow-400">
                {filteredArticles.length} Loaded
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-2">
          <div className="glass-card p-3 text-center">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Updates every <span className="text-space-400 font-semibold">15s</span>
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
