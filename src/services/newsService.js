import axios from 'axios'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_BASE = 'https://newsapi.org/v2'

// Generate mock articles as fallback when API key is missing/invalid
function generateMockArticles(category = 'technology') {
  const sources = [
    'TechCrunch', 'BBC News', 'CNN', 'Reuters', 'The Guardian',
    'Wired', 'Forbes', 'Bloomberg', 'NASA News', 'Space.com'
  ]
  const topics = {
    technology: [
      { title: 'SpaceX Successfully Launches Starship on Record-Breaking Mission', desc: 'SpaceX has achieved a major milestone with its latest Starship launch, surpassing previous altitude records and demonstrating new reentry capabilities.' },
      { title: 'NASA Artemis Program Advances Toward Lunar Gateway Construction', desc: 'NASA continues preparations for the Artemis program, with new contracts awarded for lunar gateway module construction.' },
      { title: 'AI-Powered Satellite Imaging Revolutionizes Earth Observation', desc: 'New artificial intelligence systems are transforming how we process and analyze satellite imagery, enabling real-time monitoring of climate change effects.' },
      { title: 'James Webb Space Telescope Reveals Unprecedented Galaxy Formation Data', desc: 'Scientists have released the latest James Webb Space Telescope findings, showing galaxies forming in the early universe with remarkable detail.' },
      { title: 'Mars Sample Return Mission Timeline Updated by ESA and NASA', desc: 'The joint ESA-NASA Mars Sample Return mission has released an updated timeline, targeting the mid-2030s for bringing Martian soil to Earth.' },
      { title: 'Quantum Computing Breakthrough Enables New Cryptographic Standards', desc: 'Researchers announce a significant quantum computing advancement that could reshape cybersecurity protocols worldwide.' },
      { title: 'Electric Vehicle Battery Technology Achieves 1000km Range Milestone', desc: 'A consortium of automotive manufacturers and battery researchers have demonstrated a new solid-state battery achieving unprecedented range.' },
      { title: 'Global 6G Network Standards Finalized by International Telecom Union', desc: 'The International Telecommunication Union has published preliminary standards for 6G networks, promising speeds 100x faster than 5G.' },
      { title: 'Meta Unveils Next Generation Mixed Reality Headset', desc: 'Meta has announced its most advanced mixed reality headset yet, featuring ultra-high resolution displays and advanced hand tracking.' },
      { title: 'Open Source AI Model Surpasses GPT-4 on Key Benchmarks', desc: 'A new open source AI model released by a coalition of researchers has demonstrated superior performance on several important AI benchmarks.' },
    ],
    science: [
      { title: 'New Antarctic Ice Core Data Reveals 1.2 Million Years of Climate History', desc: 'Scientists have successfully extracted and analyzed the oldest ice core ever recovered, providing unprecedented climate data.' },
      { title: 'CERN Discovers Three New Exotic Particles in Latest Experiments', desc: 'Physicists at CERN have announced the discovery of three previously unknown subatomic particles during recent Large Hadron Collider experiments.' },
      { title: 'Deep Sea Expedition Finds New Species in Pacific Ocean Trenches', desc: 'A multinational research team has returned from a six-month expedition with samples of over 50 previously undocumented deep sea organisms.' },
      { title: 'Gene Therapy Trial Shows 95% Success Rate for Rare Genetic Disorders', desc: 'Clinical trial results published in Nature Medicine demonstrate remarkable efficacy of a new gene therapy approach for treating rare inherited conditions.' },
      { title: 'Gravitational Wave Observatory Detects Most Massive Black Hole Merger Yet', desc: 'LIGO and Virgo have confirmed the detection of gravitational waves from the merger of two black holes with a combined mass 150 times that of our sun.' },
    ],
    general: [
      { title: 'International Space Station Crew Completes Critical Maintenance EVA', desc: 'ISS crew members successfully completed a 7-hour spacewalk to install upgraded solar panels, increasing the station\'s power capacity significantly.' },
      { title: 'Global Leaders Reach Historic Climate Agreement at Summit', desc: 'World leaders have signed a comprehensive climate accord committing nations to net-zero emissions by 2050 with binding annual targets.' },
      { title: 'New Study Links Social Media Usage to Mental Health Improvements', desc: 'Contrary to previous research, a new long-term study suggests that moderate, intentional social media use can improve social connections and wellbeing.' },
      { title: 'Renewable Energy Now Powers 40% of Global Electricity', desc: 'The International Energy Agency reports that renewable energy sources now account for over 40% of global electricity generation, a historic milestone.' },
      { title: 'WHO Announces New Global Health Security Framework', desc: 'The World Health Organization has unveiled a comprehensive framework to better detect, prevent, and respond to future pandemic threats.' },
    ]
  }

  const categoryTopics = topics[category] || topics.general
  const allTopics = [...categoryTopics, ...topics.general].slice(0, 12)

  return allTopics.map((item, i) => ({
    title: item.title,
    description: item.desc,
    url: '#',
    urlToImage: `https://picsum.photos/seed/${category}${i}/400/200`,
    author: ['Dr. Sarah Mitchell', 'James Rodriguez', 'Emily Chen', 'Michael Torres', 'Dr. Aisha Patel'][i % 5],
    source: { name: sources[i % sources.length] },
    publishedAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
    content: item.desc + ' This is a demo article for the ISS & News Dashboard.',
  }))
}

export async function fetchNews(category = 'technology') {
  // If no API key, use mock data
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    console.warn('No News API key found. Using mock data. Get a free key at https://newsapi.org')
    await new Promise(r => setTimeout(r, 800)) // simulate loading
    return {
      status: 'ok',
      articles: generateMockArticles(category),
      totalResults: 12
    }
  }

  try {
    const params = {
      apiKey: NEWS_API_KEY,
      language: 'en',
      pageSize: 20,
    }

    let url = `${NEWS_API_BASE}/top-headlines`

    if (category === 'general' || category === 'all') {
      params.category = 'general'
      params.country = 'us'
    } else {
      params.category = category
      params.country = 'us'
    }

    const response = await axios.get(url, { params, timeout: 10000 })
    
    // If no articles (free tier restriction from localhost), use mock
    if (!response.data.articles || response.data.articles.length === 0) {
      return { status: 'ok', articles: generateMockArticles(category), totalResults: 12 }
    }
    
    return response.data
  } catch (err) {
    console.error('News API error:', err.response?.data || err.message)
    // Return mock data on any error
    return { status: 'ok', articles: generateMockArticles(category), totalResults: 12 }
  }
}

export async function searchNews(query) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    await new Promise(r => setTimeout(r, 500))
    const mock = generateMockArticles('technology')
    return {
      articles: mock.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  const response = await axios.get(`${NEWS_API_BASE}/everything`, {
    params: {
      q: query,
      apiKey: NEWS_API_KEY,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20,
    },
    timeout: 10000,
  })
  return response.data
}
