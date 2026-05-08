import { motion } from 'framer-motion'
import { BarChart2, Activity, PieChart, Globe } from 'lucide-react'
import SpeedChart from '../charts/SpeedChart'
import NewsDistributionChart from '../charts/NewsDistributionChart'
import ISSMap from '../components/ISSMap'
import { useISS } from '../context/ISSContext'
import { useNews } from '../context/NewsContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { stringToColor } from '../utils/formatters'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          border: '1px solid rgba(90, 125, 243, 0.3)',
        }}>
        <p className="text-xs mb-1" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].fill }}>
          {payload[0].value} articles
        </p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { speeds, positions } = useISS()
  const { sourceDistribution, articles, CATEGORIES, selectedCategory, setSelectedCategory } = useNews()

  // Bar chart data for sources
  const barData = Object.entries(sourceDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name: name.length > 12 ? name.slice(0, 12) + '…' : name,
      count,
      fill: stringToColor(name),
    }))

  // Speed statistics
  const speedStats = speeds.length > 0 ? [
    { metric: 'Current', value: speeds[speeds.length - 1]?.speed || 0, max: 30000 },
    { metric: 'Average', value: Math.round(speeds.reduce((a, b) => a + b.speed, 0) / speeds.length), max: 30000 },
    { metric: 'Max', value: Math.max(...speeds.map(s => s.speed)), max: 30000 },
    { metric: 'Min', value: Math.min(...speeds.map(s => s.speed)), max: 30000 },
    { metric: 'Readings', value: speeds.length, max: 30 },
  ] : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold font-display text-gradient-blue">Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Real-time data visualization — ISS telemetry & news insights
        </p>
      </motion.div>

      {/* Row 1: Speed + News Donut */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-space-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>ISS Speed Chart</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Area chart — last 30 readings</p>
            </div>
          </div>
          <SpeedChart />
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={16} className="text-yellow-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>News Source Distribution</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Interactive donut chart</p>
            </div>
          </div>
          <NewsDistributionChart />
        </div>
      </motion.div>

      {/* Row 2: Bar Chart + Map */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-cosmic-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Articles Per Source</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Top 8 news sources</p>
            </div>
          </div>
          {barData.length === 0 ? (
            <div className="h-48 skeleton rounded-lg" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.7)' }}
                    tickLine={false}
                    axisLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={800}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Speed Stats */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-green-400" />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Speed Statistics</h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>From {speeds.length} readings</p>
            </div>
          </div>
          {speeds.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Current', value: speeds[speeds.length - 1]?.speed, color: '#7b9ef8', unit: 'km/h' },
                { label: 'Average', value: Math.round(speeds.reduce((a, b) => a + b.speed, 0) / speeds.length), color: '#4ade80', unit: 'km/h' },
                { label: 'Maximum', value: Math.max(...speeds.map(s => s.speed)), color: '#fbbf24', unit: 'km/h' },
                { label: 'Minimum', value: Math.min(...speeds.map(s => s.speed)), color: '#f87171', unit: 'km/h' },
                { label: 'Readings', value: speeds.length, color: '#a78bfa', unit: 'total' },
                { label: 'Positions', value: positions.length, color: '#38bdf8', unit: 'tracked' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>{stat.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono" style={{ color: stat.color }}>
                      {stat.value?.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>{stat.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Row 3: ISS Map */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Globe size={16} className="text-space-400" />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>ISS Live Trajectory Map</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Last 15 positions shown</p>
          </div>
        </div>
        <div style={{ height: '400px' }}>
          <ISSMap />
        </div>
      </motion.div>
    </motion.div>
  )
}
