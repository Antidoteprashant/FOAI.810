import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts'
import { useISS } from '../context/ISSContext'
import { Rocket } from 'lucide-react'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          border: '1px solid rgba(90, 125, 243, 0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
        <p className="text-xs font-mono mb-1" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</p>
        <p className="text-sm font-bold" style={{ color: '#7b9ef8' }}>
          {payload[0]?.value?.toLocaleString()} km/h
        </p>
      </div>
    )
  }
  return null
}

export default function SpeedChart() {
  const { speeds } = useISS()

  const data = speeds.map(s => ({
    time: s.time,
    speed: s.speed,
  }))

  const avgSpeed = data.length > 0
    ? Math.round(data.reduce((a, b) => a + b.speed, 0) / data.length)
    : 27600

  const minSpeed = data.length > 0 ? Math.min(...data.map(d => d.speed)) : 27000
  const maxSpeed = data.length > 0 ? Math.max(...data.map(d => d.speed)) : 28000

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Current', value: data[data.length - 1]?.speed?.toLocaleString() || '—', color: '#7b9ef8' },
          { label: 'Average', value: avgSpeed.toLocaleString(), color: '#4ade80' },
          { label: 'Max', value: maxSpeed.toLocaleString(), color: '#fbbf24' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-2.5 text-center">
            <p className="text-xs mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>{stat.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>km/h</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-space-500 border-t-transparent mx-auto mb-2"
            />
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
              Collecting speed data...
            </p>
          </div>
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5a7df3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5a7df3" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(data.length / 4)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={avgSpeed}
                stroke="rgba(74, 222, 128, 0.4)"
                strokeDasharray="4 4"
                label={{ value: 'Avg', position: 'right', fill: 'rgba(74,222,128,0.6)', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke="#5a7df3"
                strokeWidth={2}
                fill="url(#speedGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#5a7df3', stroke: '#0a0e1a', strokeWidth: 2 }}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-center mt-2" style={{ color: 'rgba(148,163,184,0.4)' }}>
        Last {data.length} readings — Updates every 15 seconds
      </p>
    </div>
  )
}
