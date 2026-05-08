# 🛸 Real-Time ISS & News Dashboard

A modern, production-ready **React + Vite** dashboard featuring live International Space Station tracking, a global news feed, an AI-powered chatbot, and interactive data visualizations — all wrapped in a stunning space-themed UI.

![ISS Dashboard](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 🛸 Part 1 — Live ISS Tracker
- **Auto-refresh every 15 seconds** via [Open Notify API](http://api.open-notify.org/iss-now.json)
- Real-time **latitude, longitude, speed (km/h), timestamp**
- **Haversine Formula** for accurate speed calculation between positions
- **Reverse geocoding** via [Nominatim](https://nominatim.openstreetmap.org/) to show city/ocean/country
- Stores last **30 speed readings** and **15 positions**
- **Astronaut list** — names and spacecraft from the Open Notify API

### 🗺️ Interactive Leaflet Map
- Dark-themed Leaflet.js map
- Custom animated 🛸 ISS marker with glow pulse
- **Last 15 positions** shown as trajectory polyline
- Live coordinate tooltip on hover
- Fullscreen toggle + manual refresh

### 📰 Part 2 — News Dashboard
- Fetches articles from [NewsAPI](https://newsapi.org/) via `VITE_NEWS_API_KEY`
- **Search bar** with highlighted matches
- **Category filter** — Technology, Science, Business, Health, Sports, Entertainment
- **Sort by** Date or Source
- **15-minute localStorage cache** with auto-refresh
- Skeleton loaders, error states with retry
- 12 realistic mock articles when running on localhost (NewsAPI free tier restriction)

### 🤖 Part 3 — AI Chatbot
- Powered by **Mistral-7B-Instruct** via Hugging Face Inference API
- Floating button (bottom-right), open/close animation
- **Context-locked** — only answers questions about ISS data and loaded news
- Built-in **rule-based fallback** works without an API key
- Typing indicator, auto-scroll, last 30 messages in localStorage
- Clear chat button

**Example questions:**
- *"Where is the ISS right now?"*
- *"What is the ISS speed?"*
- *"How many astronauts are in space?"*
- *"Summarize the latest news"*
- *"Which news source published the most articles?"*

### 📊 Part 4 — Data Visualization
| Chart | Library | Description |
|-------|---------|-------------|
| ISS Speed | Recharts AreaChart | Live updates every 15s, last 30 readings, average reference line |
| News Distribution | Recharts PieChart | Interactive donut with active shape animation |
| Articles per Source | Recharts BarChart | Top 8 sources, color-coded bars |
| Live Trajectory | Leaflet.js | Real-time ISS map with polyline path |

### 🎨 Part 5 — UI/UX
- **Futuristic space theme** — deep navy, electric blue, cosmic purple
- **Glassmorphism cards** with backdrop blur
- **Dark / Light mode** toggle, persisted in localStorage
- Sticky navbar with **live UTC clock**
- Collapsible sidebar with live ISS stats
- **Framer Motion** page transitions and card animations
- **React Hot Toast** notifications
- Fully **responsive** — Mobile, Tablet, Desktop

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Antidoteprashant/FOAI.810.git
cd FOAI.810

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)

# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_HF_API_KEY=your_huggingface_api_key_here
```

| Variable | Required | Get it from |
|----------|----------|-------------|
| `VITE_NEWS_API_KEY` | Optional* | [newsapi.org](https://newsapi.org/register) — free tier |
| `VITE_HF_API_KEY` | Optional* | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — free |

> *The app runs with **mock data** if keys are missing — great for demos.
> 
> ⚠️ **NewsAPI free tier** blocks `localhost` — deploy to a server for live news.

### APIs Used (no key needed)
| API | URL |
|-----|-----|
| ISS Live Position | `http://api.open-notify.org/iss-now.json` |
| Astronauts in Space | `http://api.open-notify.org/astros.json` |
| Reverse Geocoding | `https://nominatim.openstreetmap.org/reverse` |

---

## 📁 Folder Structure

```
src/
├── App.jsx                  # Root app with providers & routing
├── main.jsx                 # Entry point
├── index.css                # Global styles, Tailwind layers, animations
│
├── components/
│   ├── Navbar.jsx           # Sticky navbar with UTC clock & theme toggle
│   ├── Sidebar.jsx          # Collapsible nav sidebar with live ISS stats
│   ├── ISSMap.jsx           # Leaflet interactive map with trajectory
│   ├── NewsCard.jsx         # Article card + skeleton loader
│   ├── Chatbot.jsx          # Floating AI chatbot window
│   ├── AnimatedCounter.jsx  # Framer Motion animated counters & stat cards
│   └── NotificationCenter.jsx
│
├── pages/
│   ├── Dashboard.jsx        # Main overview — map, stats, charts, news preview
│   ├── ISSTracker.jsx       # Full ISS page — telemetry, crew, history
│   ├── News.jsx             # Full news feed with search & filters
│   └── Analytics.jsx        # All charts + ISS map
│
├── context/
│   ├── ThemeContext.jsx      # Dark/light mode with localStorage
│   ├── ISSContext.jsx        # ISS position, speed, astronauts, 15s polling
│   └── NewsContext.jsx       # News data, caching, search, filter, sort
│
├── services/
│   ├── issService.js         # Open Notify API calls with CORS proxy fallback
│   ├── newsService.js        # NewsAPI calls + mock data fallback
│   └── chatService.js        # Hugging Face Mistral-7B + rule-based fallback
│
├── charts/
│   ├── SpeedChart.jsx        # Recharts area chart for ISS speed
│   └── NewsDistributionChart.jsx  # Recharts donut chart for news sources
│
└── utils/
    ├── haversine.js          # Haversine distance formula for speed calculation
    └── formatters.js         # Date, text, color, and highlight utilities
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + Vite 7 |
| Styling | Tailwind CSS 3 |
| Maps | Leaflet.js + react-leaflet |
| Charts | Recharts |
| Animations | Framer Motion |
| HTTP | Axios |
| Routing | React Router v6 |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| AI Model | Mistral-7B-Instruct-v0.2 (Hugging Face) |
| Caching | localStorage |

---

## 📦 Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production → /dist
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 🔧 Configuration

### Tailwind
Custom space-themed design tokens in `tailwind.config.js`:
- `space-*` — Blue accent palette
- `cosmic-*` — Purple accent palette  
- `nebula-*` — Dark background shades
- Custom animations: `float`, `glow`, `shimmer`, `pulse-slow`

### VS Code
`.vscode/settings.json` suppresses false-positive Tailwind CSS warnings from the built-in validator.

---

## 🌐 Deployment

```bash
npm run build
# Deploy the /dist folder to any static host:
# Vercel, Netlify, GitHub Pages, Firebase Hosting
```

> For live **NewsAPI** data (not mock), deploy to a public domain — the free tier blocks `localhost`.

---

## 📝 Notes

- **CORS**: The ISS API is called with an `allorigins.win` proxy fallback if the direct call fails in the browser.
- **Speed**: Calculated using the Haversine formula between consecutive ISS positions over elapsed time. Capped to a realistic 27,000–28,500 km/h range.
- **Chatbot**: Works fully offline (rule-based) without a Hugging Face key. Add the key for Mistral-7B inference.

---

## 👨‍💻 Author

**Prashant** — [@Antidoteprashant](https://github.com/Antidoteprashant)

---

## 📄 License

MIT — feel free to use, modify, and distribute.
