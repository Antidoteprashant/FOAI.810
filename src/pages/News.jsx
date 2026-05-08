import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper, Search, RefreshCw, Filter, SortAsc,
  AlertCircle, ChevronDown, X, Clock
} from 'lucide-react'
import { useNews } from '../context/NewsContext'
import NewsCard, { NewsCardSkeleton } from '../components/NewsCard'
import { formatRelativeTime } from '../utils/formatters'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
}

export default function News() {
  const {
    filteredArticles, loading, error, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, sortBy, setSortBy,
    refresh, lastFetched, CATEGORIES, sourceDistribution
  } = useNews()

  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [setSearchQuery])

  const clearSearch = () => setSearchQuery('')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-gradient-blue">News Feed</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {filteredArticles.length} articles
            {lastFetched && ` · Updated ${formatRelativeTime(lastFetched)}`}
          </p>
        </div>
        <button
          id="news-refresh-btn"
          onClick={refresh}
          disabled={loading}
          className="btn-primary"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 space-y-3"
      >
        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-muted)' }} />
          <input
            id="news-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search articles, topics, sources..."
            className="input-field pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <X size={13} style={{ color: 'var(--color-muted)' }} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`category-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-space-500 text-white'
                  : 'hover:bg-white/8 text-gray-400 hover:text-white'
              }`}
              style={{
                background: selectedCategory === cat.id ? undefined : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <SortAsc size={14} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort by:</span>
          </div>
          {[
            { id: 'date', label: 'Date' },
            { id: 'source', label: 'Source' },
          ].map(option => (
            <button
              key={option.id}
              id={`sort-${option.id}`}
              onClick={() => setSortBy(option.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === option.id ? 'badge-blue badge' : 'btn-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}

          {searchQuery && (
            <span className="ml-auto badge badge-yellow text-xs">
              {filteredArticles.length} results for "{searchQuery}"
            </span>
          )}
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 glass-card"
        >
          <AlertCircle size={36} className="text-red-400 mb-3" />
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Failed to Load News
          </h3>
          <p className="text-xs mb-4 text-center max-w-xs" style={{ color: 'var(--color-muted)' }}>
            {error}
          </p>
          <button onClick={refresh} className="btn-primary">
            <RefreshCw size={14} /> Try Again
          </button>
        </motion.div>
      )}

      {/* News Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {loading
              ? [1, 2, 3, 4, 5, 6, 8, 12].map(i => <NewsCardSkeleton key={i} index={i} />)
              : filteredArticles.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-space-500/10 flex items-center justify-center mb-4">
                      <Newspaper size={28} className="text-space-400 opacity-50" />
                    </div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      No articles found
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                      {searchQuery ? `No results for "${searchQuery}"` : 'Try a different category'}
                    </p>
                    {searchQuery && (
                      <button onClick={clearSearch} className="btn-primary mt-4">
                        Clear Search
                      </button>
                    )}
                  </div>
                )
                : filteredArticles.map((article, i) => (
                  <NewsCard
                    key={article.url || i}
                    article={article}
                    index={i}
                    searchQuery={searchQuery}
                  />
                ))
            }
          </AnimatePresence>
        </div>
      )}

      {/* Bottom source stats */}
      {!loading && filteredArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-muted)' }}>
            SOURCE BREAKDOWN
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sourceDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([src, count]) => (
                <button
                  key={src}
                  onClick={() => setSearchQuery(src)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all hover:bg-white/8"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span style={{ color: 'var(--color-text)' }}>{src}</span>
                  <span className="badge badge-blue !px-1.5 !py-0">{count}</span>
                </button>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
