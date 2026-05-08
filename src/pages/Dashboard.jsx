import { motion } from 'framer-motion'
import { Satellite, Users, Newspaper, Zap, RefreshCw, MapPin, Clock, Globe } from 'lucide-react'
import { useISS } from '../context/ISSContext'
import { useNews } from '../context/NewsContext'
import { StatCard } from '../components/AnimatedCounter'
import ISSMap from '../components/ISSMap'
import SpeedChart from '../charts/SpeedChart'
import NewsDistributionChart from '../charts/NewsDistributionChart'
import NewsCard, { NewsCardSkeleton } from '../components/NewsCard'
import { formatRelativeTime } from '../utils/formatters'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Dashboard() {
  const {
    position, speeds, astronauts, loading: issLoading,
    error: issError, lastUpdated, nearestLocation, refresh, trackedCount
  } = useISS()
  const { filteredArticles, loading: newsLoading } = useNews()

  const currentSpeed = speeds[speeds.length - 1]?.speed

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-gradient-blue">Mission Control</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Real-time ISS tracking & global news dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 badge badge-green">
              <div className="pulse-dot w-1.5 h-1.5" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <button
            id="dashboard-refresh-btn"
            onClick={refresh}
            disabled={issLoading}
            className="btn-secondary text-sm"
          >
            <RefreshCw size={14} className={issLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="ISS Speed"
          value={currentSpeed || 27600}
          suffix=" km/h"
          color="text-space-400"
          bgColor="bg-space-500/10"
          trend="Live"
          delay={0}
        />
        <StatCard
          icon={MapPin}
          label="Nearest Region"
          value={nearestLocation || 'Loading...'}
          color="text-cosmic-400"
          bgColor="bg-cosmic-500/10"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          label="Crew in Space"
          value={astronauts.length}
          suffix=" People"
          color="text-green-400"
          bgColor="bg-green-500/10"
          delay={0.2}
        />
        <StatCard
          icon={Newspaper}
          label="News Articles"
          value={filteredArticles.length}
          suffix=" Loaded"
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          delay={0.3}
        />
      </motion.div>

      {/* ISS Error Banner */}
      {issError && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <p className="text-sm text-red-400">{issError}</p>
          <button onClick={refresh} className="btn-primary text-xs !py-1.5">
            <RefreshCw size={12} /> Retry
          </button>
        </motion.div>
      )}

      {/* Map + ISS Info */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map - spans 2 columns */}
        <div className="lg:col-span-2 glass-card overflow-hidden" style={{ minHeight: '400px' }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-space-400" />
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Live ISS Map</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="pulse-dot" />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{trackedCount} positions tracked</span>
            </div>
          </div>
          <div style={{ height: '360px' }}>
            <ISSMap />
          </div>
        </div>

        {/* ISS Data Panel */}
        <div className="space-y-3">
          {/* Current Position */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Satellite size={15} className="text-space-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Current Position</span>
            </div>
            {issLoading && !position ? (
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            ) : position ? (
              <div className="space-y-2.5">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Latitude</p>
                  <p className="font-mono text-sm font-semibold text-space-400">
                    {position.lat > 0 ? '+' : ''}{position.lat?.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Longitude</p>
                  <p className="font-mono text-sm font-semibold text-space-400">
                    {position.lng > 0 ? '+' : ''}{position.lng?.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Region</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {nearestLocation}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Altitude (typical)</p>
                  <p className="font-mono text-sm font-semibold text-cosmic-400">~408 km</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">Position unavailable</p>
            )}
          </div>

          {/* Astronauts */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-green-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Crew in Space</span>
              </div>
              <span className="badge badge-green">{astronauts.length} People</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {astronauts.length === 0 ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-8 w-full rounded-lg" />
                ))
              ) : (
                astronauts.map((person, i) => (
                  <motion.div
                    key={person.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="astronaut-card"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-space-500 to-cosmic-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {person.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {person.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                        {person.craft}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Speed Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-space-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>ISS Speed Over Time</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Last 30 readings</p>
            </div>
          </div>
          <SpeedChart />
        </div>

        {/* News Distribution */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={16} className="text-yellow-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>News by Source</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Article distribution</p>
            </div>
          </div>
          <NewsDistributionChart />
        </div>
      </motion.div>

      {/* Latest News Preview */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Latest News</h2>
            <p className="section-subtitle">Top headlines from your dashboard</p>
          </div>
          <a href="/news" className="btn-secondary text-sm">View All</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {newsLoading
            ? [1, 2, 3, 4].map(i => <NewsCardSkeleton key={i} index={i} />)
            : filteredArticles.slice(0, 4).map((article, i) => (
              <NewsCard key={article.url || i} article={article} index={i} />
            ))
          }
        </div>
      </motion.div>
    </motion.div>
  )
}
