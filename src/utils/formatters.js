/**
 * Format a date/timestamp to a readable string
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return String(dateStr)
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = now - then

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return formatDate(dateStr)
  } catch {
    return ''
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text, maxLength = 120) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Generate a color from a string (for chart colors)
 */
export function stringToColor(str) {
  const colors = [
    '#5a7df3', '#c44df3', '#3b82f6', '#8b5cf6', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Format UTC time
 */
export function getUTCTime() {
  return new Date().toUTCString().split(' ')[4] + ' UTC'
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Highlight search terms in text
 */
export function highlightText(text, query) {
  if (!query || !text) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}
