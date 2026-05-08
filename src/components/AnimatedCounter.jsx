import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

/**
 * Animated counter that counts up from 0 to the target value
 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', className = '', decimals = 0 }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`counter-number ${className}`}
    >
      {prefix}
      {typeof value === 'number'
        ? decimals > 0
          ? value.toFixed(decimals)
          : value.toLocaleString()
        : value}
      {suffix}
    </motion.span>
  )
}

/**
 * Stat card with icon, label, value, and optional trend
 */
export function StatCard({ icon: Icon, label, value, suffix = '', trend, color = 'text-space-400', bgColor = 'bg-space-500/10', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon size={20} className={color} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 badge badge-green text-xs">
            <TrendingUp size={10} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
      <div className="text-2xl font-bold font-display">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
    </motion.div>
  )
}
