import axios from 'axios'

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'
const HF_BASE_URL = 'https://api-inference.huggingface.co/models'

/**
 * Build a context-aware prompt from ISS and news data
 * The chatbot ONLY answers based on provided context
 */
function buildSystemPrompt(issData, newsArticles) {
  const { position, speeds, astronauts, nearestLocation, trackedCount } = issData

  const positionStr = position
    ? `Latitude: ${position.lat?.toFixed(4)}°, Longitude: ${position.lng?.toFixed(4)}°`
    : 'Not available'

  const speedStr = speeds.length > 0
    ? `${speeds[speeds.length - 1]?.speed?.toLocaleString()} km/h`
    : 'Calculating...'

  const astronautNames = astronauts.map(a => `${a.name} (${a.craft})`).join(', ')

  const topArticles = newsArticles.slice(0, 10).map((a, i) =>
    `${i + 1}. "${a.title}" - Source: ${a.source?.name}, Published: ${new Date(a.publishedAt).toLocaleDateString()}, Description: ${a.description || 'N/A'}`
  ).join('\n')

  return `You are a specialized AI assistant for an ISS & News Dashboard. You MUST ONLY answer questions using the data provided below. Never use external knowledge, never guess, and never answer questions unrelated to ISS tracking or the news articles shown.

=== CURRENT ISS DATA ===
Position: ${positionStr}
Nearest Location: ${nearestLocation || 'Open Ocean'}
Current Speed: ${speedStr}
Tracked Positions: ${trackedCount}
Astronauts in Space (${astronauts.length} total): ${astronautNames || 'Loading...'}

=== CURRENT NEWS ARTICLES ===
${topArticles || 'No articles loaded yet.'}

=== RULES ===
1. Only answer about ISS data or the news articles above
2. For unrelated questions, respond: "I can only answer questions related to ISS tracking and dashboard news data."
3. Be concise and accurate
4. Format responses clearly

User question: `
}

export async function chatWithAI(userMessage, issData, newsArticles) {
  const systemPrompt = buildSystemPrompt(issData, newsArticles)
  const fullPrompt = systemPrompt + userMessage

  // Local rule-based responses as fallback
  const localResponse = getLocalResponse(userMessage, issData, newsArticles)
  if (localResponse) return localResponse

  if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') {
    return getLocalResponse(userMessage, issData, newsArticles, true)
  }

  try {
    const response = await axios.post(
      `${HF_BASE_URL}/${HF_MODEL}`,
      {
        inputs: `<s>[INST] ${fullPrompt} [/INST]`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          top_p: 0.95,
          return_full_text: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const generatedText = response.data?.[0]?.generated_text || ''
    return generatedText.trim() || getLocalResponse(userMessage, issData, newsArticles, true)
  } catch (err) {
    console.error('HF API error:', err.response?.data || err.message)
    return getLocalResponse(userMessage, issData, newsArticles, true)
  }
}

/**
 * Local rule-based response engine - works without any API key
 * Handles common questions about ISS and news
 */
function getLocalResponse(question, issData, newsArticles, forceFallback = false) {
  if (!issData) return null
  const { position, speeds, astronauts, nearestLocation, trackedCount } = issData
  const q = question.toLowerCase()

  // Check if question is ISS/news related
  const isRelevant =
    q.includes('iss') || q.includes('space station') || q.includes('station') ||
    q.includes('speed') || q.includes('fast') || q.includes('orbit') ||
    q.includes('astronaut') || q.includes('crew') || q.includes('space') ||
    q.includes('location') || q.includes('where') || q.includes('position') ||
    q.includes('latitude') || q.includes('longitude') || q.includes('coordinate') ||
    q.includes('news') || q.includes('article') || q.includes('headline') ||
    q.includes('source') || q.includes('publish') || q.includes('latest') ||
    q.includes('summar') || q.includes('how many') || q.includes('count') ||
    q.includes('altitude') || q.includes('track') || q.includes('hello') ||
    q.includes('hi') || q.includes('what') || q.includes('tell') || q.includes('show')

  if (!isRelevant && !forceFallback) return null

  // Speed questions
  if (q.includes('speed') || q.includes('fast') || q.includes('velocity')) {
    const speed = speeds[speeds.length - 1]?.speed
    if (speed) {
      return `🚀 **ISS Current Speed**: The ISS is traveling at approximately **${speed.toLocaleString()} km/h** (${Math.round(speed / 1.609).toLocaleString()} mph). At this speed, it completes one orbit around Earth every ~90 minutes!`
    }
    return '🚀 The ISS typically orbits at ~27,600 km/h. Speed data is still being calculated from position tracking.'
  }

  // Location/position questions
  if (q.includes('where') || q.includes('location') || q.includes('position') ||
      q.includes('latitude') || q.includes('longitude') || q.includes('coordinate')) {
    if (position) {
      return `🛸 **ISS Current Position**:\n• **Latitude**: ${position.lat?.toFixed(4)}°\n• **Longitude**: ${position.lng?.toFixed(4)}°\n• **Nearest Region**: ${nearestLocation}\n• **Tracked Positions**: ${trackedCount} recorded so far\n\nThe ISS orbits at approximately 400km altitude, traveling at 27,600 km/h.`
    }
    return '📡 ISS position data is loading. The ISS is constantly moving and updates every 15 seconds.'
  }

  // Astronaut questions
  if (q.includes('astronaut') || q.includes('crew') || q.includes('people') ||
      q.includes('human') || q.includes('aboard') || q.includes('how many')) {
    if (astronauts.length > 0) {
      const crewList = astronauts.map(a => `• **${a.name}** — ${a.craft}`).join('\n')
      return `👨‍🚀 **Astronauts Currently in Space** (${astronauts.length} total):\n${crewList}`
    }
    return '👨‍🚀 There are currently several astronauts aboard the ISS. Crew data is loading...'
  }

  // News questions
  if (q.includes('news') || q.includes('article') || q.includes('headline') ||
      q.includes('latest') || q.includes('summar')) {
    if (newsArticles.length > 0) {
      const top5 = newsArticles.slice(0, 5)
      const summary = top5.map((a, i) =>
        `${i + 1}. **${a.title}** *(${a.source?.name})*`
      ).join('\n')
      return `📰 **Latest News Headlines** (${newsArticles.length} articles loaded):\n${summary}\n\nClick "Read More" on any article card for the full story.`
    }
    return '📰 News articles are still loading. Please wait a moment.'
  }

  // Source distribution
  if (q.includes('source') || q.includes('publisher') || q.includes('most article')) {
    if (newsArticles.length > 0) {
      const dist = newsArticles.reduce((acc, a) => {
        const s = a.source?.name || 'Unknown'
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {})
      const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
      const list = sorted.map(([src, cnt]) => `• **${src}**: ${cnt} article${cnt > 1 ? 's' : ''}`).join('\n')
      return `📊 **Top News Sources**:\n${list}\n\nTotal: ${newsArticles.length} articles from ${Object.keys(dist).length} sources.`
    }
    return '📊 No news articles loaded yet to analyze sources.'
  }

  // Orbit / altitude
  if (q.includes('orbit') || q.includes('altitude') || q.includes('high')) {
    return '🛸 The ISS orbits Earth at approximately **400 km (250 miles)** altitude in Low Earth Orbit (LEO). It completes about **16 orbits per day**, traveling at 27,600 km/h. This means it experiences approximately 16 sunrises and sunsets every 24 hours!'
  }

  // Tracking info
  if (q.includes('track') || q.includes('how long') || q.includes('updat')) {
    return `📡 **ISS Tracking Info**:\n• **Update Interval**: Every 15 seconds\n• **Positions Recorded**: ${trackedCount}\n• **Trajectory**: Last ${Math.min(trackedCount, 15)} positions shown on map\n• **Speed Readings**: Last ${speeds.length} measurements stored\n\nThe dashboard auto-updates and shows an animated trajectory path!`
  }

  // Greeting
  if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey')) {
    return `👋 **Hello!** I'm your ISS & News Dashboard assistant.\n\nI can answer questions about:\n• 🛸 **ISS Location** — Where is the ISS right now?\n• ⚡ **ISS Speed** — How fast is it traveling?\n• 👨‍🚀 **Astronauts** — Who's aboard the ISS?\n• 📰 **Latest News** — Summarize current headlines\n• 📊 **News Sources** — Which source has the most articles?\n\nWhat would you like to know?`
  }

  // Unrelated question
  if (!isRelevant) {
    return "I can only answer questions related to ISS tracking and dashboard news data. Try asking:\n• \"Where is the ISS?\"\n• \"What is the ISS speed?\"\n• \"How many astronauts are in space?\"\n• \"Summarize the latest news\""
  }

  // Generic response
  return `I have access to live ISS data and ${newsArticles.length} news articles. Try asking:\n• "Where is the ISS right now?"\n• "What is the current ISS speed?"\n• "List all astronauts in space"\n• "Summarize the latest news headlines"`
}
