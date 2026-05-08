import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts'
import { useNews } from '../context/NewsContext'
import { stringToColor } from '../utils/formatters'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          border: '1px solid rgba(90, 125, 243, 0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
        <p className="text-xs font-semibold mb-0.5" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}
        </p>
        <p className="text-sm font-bold text-white">
          {payload[0].value} article{payload[0].value !== 1 ? 's' : ''}
        </p>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    )
  }
  return null
}

function ActiveShape({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent }) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
        {payload.value}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize={11}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export default function NewsDistributionChart() {
  const { sourceDistribution, articles } = useNews()
  const [activeIndex, setActiveIndex] = useState(0)

  // Prepare data - top 8 sources
  const data = Object.entries(sourceDistribution)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      fullName: name,
      value: count,
      total: articles.length,
      fill: stringToColor(name),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-space-500 border-t-transparent mx-auto mb-2 animate-spin" />
          <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>Loading news data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={<ActiveShape />}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  stroke="rgba(10,14,26,0.8)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {data.map((item, i) => (
          <button
            key={item.name}
            onClick={() => setActiveIndex(i)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${activeIndex === i ? 'bg-white/8' : 'hover:bg-white/5'}`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.fill }}
            />
            <span className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.8)' }}>
              {item.name}
            </span>
            <span className="text-xs ml-auto font-mono" style={{ color: item.fill }}>
              {item.value}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-center mt-3" style={{ color: 'rgba(148,163,184,0.4)' }}>
        {articles.length} total articles from {Object.keys(sourceDistribution).length} sources
      </p>
    </div>
  )
}
