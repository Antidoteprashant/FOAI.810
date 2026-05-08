import axios from 'axios'

// ISS Position - using CORS proxy for browser compatibility
const ISS_API = 'https://api.open-notify.org/iss-now.json'
const ASTRONAUTS_API = 'https://api.open-notify.org/astros.json'

// CORS proxies to handle browser CORS restrictions
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export async function fetchISSPosition() {
  try {
    // Direct fetch first
    const response = await axios.get(ISS_API, { timeout: 8000 })
    return response.data
  } catch {
    // Fallback to CORS proxy
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(ISS_API)}`, {
      timeout: 10000
    })
    return response.data
  }
}

export async function fetchAstronauts() {
  try {
    const response = await axios.get(ASTRONAUTS_API, { timeout: 8000 })
    return response.data
  } catch {
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(ASTRONAUTS_API)}`, {
      timeout: 10000
    })
    return response.data
  }
}
