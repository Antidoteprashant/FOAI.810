import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchNews } from '../services/newsService'
import toast from 'react-hot-toast'

const NewsContext = createContext()

const CACHE_KEY = 'iss-dashboard-news'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

export function NewsProvider({ children }) {
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date') // 'date' | 'source'
  const [lastFetched, setLastFetched] = useState(null)

  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'technology', label: 'Technology' },
    { id: 'science', label: 'Science' },
    { id: 'business', label: 'Business' },
    { id: 'health', label: 'Health' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Entertainment' },
  ]

  // Load from cache
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { articles: cachedArticles, timestamp, category } = JSON.parse(cached)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        if (!isExpired && category === selectedCategory) {
          return { articles: cachedArticles, timestamp, expired: false }
        }
        return { articles: cachedArticles, timestamp, expired: true }
      }
    } catch {
      // ignore cache errors
    }
    return null
  }, [selectedCategory])

  // Save to cache
  const saveToCache = useCallback((articlesData, category) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        articles: articlesData,
        timestamp: Date.now(),
        category,
      }))
    } catch {
      // ignore cache errors
    }
  }, [])

  // Fetch news
  const loadNews = useCallback(async (force = false, category = selectedCategory) => {
    setLoading(true)
    setError(null)

    // Try cache first if not forcing
    if (!force) {
      const cached = loadFromCache()
      if (cached && !cached.expired) {
        setArticles(cached.articles)
        setFilteredArticles(cached.articles)
        setLastFetched(new Date(cached.timestamp))
        setLoading(false)
        return
      }
    }

    try {
      const data = await fetchNews(category === 'all' ? 'general' : category)
      const newArticles = data.articles || []
      setArticles(newArticles)
      setFilteredArticles(newArticles)
      setLastFetched(new Date())
      saveToCache(newArticles, category)
      if (force) {
        toast.success(`Loaded ${newArticles.length} articles`, { duration: 2000 })
      }
    } catch (err) {
      console.error('News fetch error:', err)
      setError(err.message || 'Failed to fetch news')
      // Try loading stale cache
      const cached = loadFromCache()
      if (cached) {
        setArticles(cached.articles)
        setFilteredArticles(cached.articles)
        toast.error('Using cached news data', { duration: 3000 })
      }
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, loadFromCache, saveToCache])

  // Filter and sort articles
  useEffect(() => {
    let result = [...articles]

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.name?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    } else if (sortBy === 'source') {
      result.sort((a, b) => (a.source?.name || '').localeCompare(b.source?.name || ''))
    }

    setFilteredArticles(result)
  }, [articles, searchQuery, sortBy])

  // Load on mount and category change
  useEffect(() => {
    loadNews(false, selectedCategory)
  }, [selectedCategory])

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      loadNews(true, selectedCategory)
    }, CACHE_DURATION)
    return () => clearInterval(timer)
  }, [selectedCategory, loadNews])

  // Source distribution for chart
  const sourceDistribution = articles.reduce((acc, article) => {
    const source = article.source?.name || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  const value = {
    articles,
    filteredArticles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    refresh: () => loadNews(true, selectedCategory),
    lastFetched,
    CATEGORIES,
    sourceDistribution,
  }

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export const useNews = () => useContext(NewsContext)
