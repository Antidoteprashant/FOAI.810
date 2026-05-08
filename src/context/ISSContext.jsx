import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { fetchISSPosition, fetchAstronauts } from '../services/issService'
import { haversineDistance } from '../utils/haversine'
import toast from 'react-hot-toast'

const ISSContext = createContext()

const MAX_POSITIONS = 15
const MAX_SPEED_READINGS = 30

export function ISSProvider({ children }) {
  const [position, setPosition] = useState(null)
  const [positions, setPositions] = useState([]) // last 15 positions
  const [speeds, setSpeeds] = useState([]) // last 30 speeds with timestamps
  const [astronauts, setAstronauts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [nearestLocation, setNearestLocation] = useState('Calculating...')
  const prevPositionRef = useRef(null)
  const prevTimestampRef = useRef(null)
  const intervalRef = useRef(null)

  // Fetch current ISS position
  const fetchPosition = useCallback(async (showToast = false) => {
    try {
      setError(null)
      const data = await fetchISSPosition()
      const now = Date.now()
      const lat = parseFloat(data.iss_position.latitude)
      const lng = parseFloat(data.iss_position.longitude)

      // Calculate speed using Haversine formula
      let speedKmh = null
      if (prevPositionRef.current && prevTimestampRef.current) {
        const distKm = haversineDistance(
          prevPositionRef.current.lat, prevPositionRef.current.lng,
          lat, lng
        )
        const timeDiffHours = (now - prevTimestampRef.current) / 3600000
        speedKmh = timeDiffHours > 0 ? distKm / timeDiffHours : 27600 // ISS typical speed
      } else {
        speedKmh = 27600 // default ISS speed km/h
      }

      const newPosition = {
        lat,
        lng,
        timestamp: data.message === 'success' ? data.timestamp * 1000 : now,
        speed: Math.round(speedKmh),
      }

      prevPositionRef.current = { lat, lng }
      prevTimestampRef.current = now

      setPosition(newPosition)
      setLastUpdated(new Date())
      setPositions(prev => {
        const updated = [...prev, newPosition]
        return updated.slice(-MAX_POSITIONS)
      })

      // Update speed readings
      setSpeeds(prev => {
        const updated = [...prev, {
          speed: Math.round(Math.min(speedKmh, 30000)), // cap at reasonable max
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          timestamp: now
        }]
        return updated.slice(-MAX_SPEED_READINGS)
      })

      // Reverse geocode for location name
      fetchLocationName(lat, lng)

      if (showToast) {
        toast.success('ISS position updated!', { duration: 2000 })
      }

      setLoading(false)
    } catch (err) {
      console.error('ISS fetch error:', err)
      setError('Failed to fetch ISS position. Retrying...')
      setLoading(false)
      if (showToast) {
        toast.error('Failed to refresh ISS data')
      }
    }
  }, [])

  // Reverse geocode using Open Meteo or fallback
  const fetchLocationName = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data.address) {
        const parts = [
          data.address.city,
          data.address.state,
          data.address.country,
          data.address.ocean,
          data.address.sea,
          data.address.body_of_water,
        ].filter(Boolean)
        setNearestLocation(parts[0] || data.display_name?.split(',')[0] || 'Open Ocean')
      } else {
        setNearestLocation('Open Ocean')
      }
    } catch {
      setNearestLocation('Open Ocean / Unknown Region')
    }
  }, [])

  // Fetch astronauts
  const fetchAstronautData = useCallback(async () => {
    try {
      const data = await fetchAstronauts()
      setAstronauts(data.people || [])
    } catch (err) {
      console.error('Astronaut fetch error:', err)
      // fallback
      setAstronauts([])
    }
  }, [])

  // Manual refresh
  const refresh = useCallback(() => {
    fetchPosition(true)
  }, [fetchPosition])

  // Auto-fetch every 15 seconds
  useEffect(() => {
    fetchPosition()
    fetchAstronautData()

    intervalRef.current = setInterval(() => {
      fetchPosition()
    }, 15000)

    return () => clearInterval(intervalRef.current)
  }, [fetchPosition, fetchAstronautData])

  const value = {
    position,
    positions,
    speeds,
    astronauts,
    loading,
    error,
    lastUpdated,
    nearestLocation,
    refresh,
    trackedCount: positions.length,
  }

  return <ISSContext.Provider value={value}>{children}</ISSContext.Provider>
}

export const useISS = () => useContext(ISSContext)
