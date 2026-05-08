import { motion } from 'framer-motion'
import {
  Satellite, MapPin, Zap, Users, RefreshCw, Globe, Navigation,
  Clock, Activity, ChevronRight
} from 'lucide-react'
import { useISS } from '../context/ISSContext'
import ISSMap from '../components/ISSMap'
import SpeedChart from '../charts/SpeedChart'
import { formatCoordinate } from '../utils/haversine'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function InfoRow({ label, value, mono = false, color }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className={`text-xs font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: color || 'var(--color-text)' }}>
        {value}
      </span>
    </div>
  )
}

export default function ISSTracker() {
  const {
    position, positions, speeds, astronauts, loading,
    error, lastUpdated, nearestLocation, refresh, trackedCount
  } = useISS()

  const currentSpeed = speeds[speeds.length - 1]?.speed
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds.map(s => s.speed)) : 0
  const minSpeed = speeds.length > 0 ? Math.min(...speeds.map(s => s.speed)) : 0
  const avgSpeed = speeds.length > 0
    ? Math.round(speeds.reduce((a, b) => a + b.speed, 0) / speeds.length)
    : 0

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
          <h1 className="text-2xl font-bold font-display text-gradient-blue">ISS Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            International Space Station — Live position & telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <Clock size={12} />
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            id="iss-refresh-btn"
            onClick={refresh}
            disabled={loading}
            className="btn-primary"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={refresh} className="btn-primary text-xs !py-1.5">
            <RefreshCw size={12} /> Retry
          </button>
        </motion.div>
      )}

      {/* Large Map */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-space-400" />
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Live World Map
            </span>
            <span className="badge badge-green text-xs">
              <div className="pulse-dot w-1.5 h-1.5" />
              Live
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {trackedCount} positions • {Math.min(trackedCount, 15)} shown on map
          </div>
        </div>
        <div style={{ height: '460px' }}>
          <ISSMap />
        </div>
      </motion.div>

      {/* Telemetry Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-space-500/10 flex items-center justify-center">
              <Navigation size={15} className="text-space-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Coordinates</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Current position</p>
            </div>
          </div>
          {position ? (
            <>
              <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(90,125,243,0.06)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Latitude</p>
                <p className="text-xl font-bold font-mono text-space-400">
                  {formatCoordinate(position.lat, 'lat')}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(196,77,243,0.06)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Longitude</p>
                <p className="text-xl font-bold font-mono text-cosmic-400">
                  {formatCoordinate(position.lng, 'lng')}
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="skeleton h-16 w-full rounded-lg" />
              <div className="skeleton h-16 w-full rounded-lg" />
            </div>
          )}
        </div>

        {/* Speed + Altitude */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cosmic-500/10 flex items-center justify-center">
              <Zap size={15} className="text-cosmic-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Telemetry</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Speed & altitude</p>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label="Current Speed" value={currentSpeed ? `${currentSpeed.toLocaleString()} km/h` : '—'} mono color="#7b9ef8" />
            <InfoRow label="Avg Speed" value={avgSpeed ? `${avgSpeed.toLocaleString()} km/h` : '—'} mono />
            <InfoRow label="Max Speed" value={maxSpeed ? `${maxSpeed.toLocaleString()} km/h` : '—'} mono color="#fbbf24" />
            <InfoRow label="Altitude" value="~408 km" mono color="#4ade80" />
            <InfoRow label="Orbit Period" value="~92 min" mono />
            <InfoRow label="Daily Orbits" value="~15.5" mono />
            <InfoRow label="Location" value={nearestLocation || '—'} />
            <InfoRow label="Tracked Points" value={trackedCount} />
          </div>
        </div>

        {/* Astronauts */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users size={15} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Crew Aboard</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{astronauts.length} people in space</p>
            </div>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {astronauts.length === 0 ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-12 w-full rounded-lg" />
              ))
            ) : (
              astronauts.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 37}deg 70% 50%), hsl(${i * 37 + 60}deg 70% 40%))`,
                    }}>
                    {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {person.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {person.craft}
                    </p>
                  </div>
                  <span className="badge badge-blue text-xs">ISS</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Speed Chart */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={16} className="text-space-400" />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              ISS Speed Timeline
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Real-time speed measurements — last 30 readings
            </p>
          </div>
        </div>
        <SpeedChart />
      </motion.div>

      {/* Trajectory History */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-cosmic-400" />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Position History
            </h3>
          </div>
          <span className="badge badge-purple">{positions.length} Positions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {positions.length === 0 ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)
          ) : (
            positions.slice().reverse().map((pos, i) => (
              <motion.div
                key={pos.timestamp}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 p-3 rounded-lg"
                style={{
                  background: i === 0 ? 'rgba(90,125,243,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === 0 ? 'rgba(90,125,243,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: i === 0 ? 'rgba(90,125,243,0.3)' : 'rgba(255,255,255,0.08)' }}>
                  <span className="text-xs font-mono" style={{ color: i === 0 ? '#7b9ef8' : 'rgba(148,163,184,0.6)' }}>
                    {positions.length - i}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono" style={{ color: i === 0 ? '#7b9ef8' : 'var(--color-muted)' }}>
                    {pos.lat?.toFixed(2)}°, {pos.lng?.toFixed(2)}°
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>
                    {new Date(pos.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {i === 0 && <span className="badge badge-blue text-xs ml-auto">Latest</span>}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
