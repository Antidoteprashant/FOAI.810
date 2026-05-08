import { motion } from 'framer-motion'
import { ExternalLink, Calendar, User, Tag } from 'lucide-react'
import { formatRelativeTime, truncateText } from '../utils/formatters'

export default function NewsCard({ article, index, searchQuery }) {
  const {
    title, description, url, urlToImage, author, source, publishedAt, content
  } = article

  // Highlight search terms in title
  const getHighlightedText = (text, query) => {
    if (!query?.trim() || !text) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="highlight">{part}</mark>
        : part
    )
  }

  const imgSrc = urlToImage && urlToImage !== 'null'
    ? urlToImage
    : `https://picsum.photos/seed/${index}/400/200`

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="news-card group flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = `https://picsum.photos/seed/${index + 100}/400/200` }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Source badge on image */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-blue text-xs">
            {source?.name || 'News'}
          </span>
        </div>

        {/* Time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs">
          <Calendar size={10} />
          <span>{formatRelativeTime(publishedAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-space-400 transition-colors"
          style={{ color: 'var(--color-text)' }}>
          {getHighlightedText(title, searchQuery)}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-3 flex-1"
            style={{ color: 'var(--color-muted)' }}>
            {getHighlightedText(truncateText(description, 160), searchQuery)}
          </p>
        )}

        {/* Author */}
        {author && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-5 h-5 rounded-full bg-space-500/20 flex items-center justify-center">
              <User size={10} className="text-space-400" />
            </div>
            <span className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
              {truncateText(author, 40)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5">
            <Tag size={11} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {source?.name}
            </span>
          </div>

          <a
            href={url !== '#' ? url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            id={`read-more-${index}`}
            className="flex items-center gap-1.5 btn-primary text-xs !py-1.5 !px-3"
            onClick={url === '#' ? (e) => e.preventDefault() : undefined}
          >
            Read More
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </motion.article>
  )
}

/**
 * Skeleton card for loading state
 */
export function NewsCardSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-7 w-20 rounded-lg" />
        </div>
      </div>
    </motion.div>
  )
}
