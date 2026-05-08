import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, RefreshCw, MapPin } from 'lucide-react'
import { useISS } from '../context/ISSContext'

// Dynamic Leaflet import to avoid SSR issues
let L = null

export default function ISSMap({ fullscreen = false }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const polylineRef = useRef(null)
  const { position, positions, loading, refresh, nearestLocation } = useISS()
  const [mapReady, setMapReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(fullscreen)

  // Initialize Leaflet map
  useEffect(() => {
    let mounted = true

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return

      // Dynamic import for Leaflet
      L = (await import('leaflet')).default

      // Fix default icon issue
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (!mounted || !mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
      })

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Attribution control (minimal)
      L.control.attribution({ prefix: false }).addTo(map)

      mapInstanceRef.current = map
      if (mounted) setMapReady(true)
    }

    initMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update ISS marker position
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !position || !L) return

    const map = mapInstanceRef.current
    const { lat, lng } = position

    // Create custom ISS icon
    const issIcon = L.divIcon({
      className: 'custom-iss-marker',
      html: `<div class="iss-marker-inner">🛸</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -25],
    })

    if (!markerRef.current) {
      // Create marker
      markerRef.current = L.marker([lat, lng], { icon: issIcon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:monospace;font-size:12px;background:rgba(10,14,26,0.9);color:#7b9ef8;border:1px solid rgba(90,125,243,0.3);padding:8px 12px;border-radius:8px">
            🛸 ISS Position<br/>
            Lat: ${lat.toFixed(4)}°<br/>
            Lng: ${lng.toFixed(4)}°<br/>
            <span style="color:#4ade80">● Live</span>
          </div>`,
          { permanent: false, direction: 'top', className: 'iss-tooltip' }
        )
    } else {
      // Update tooltip and position
      markerRef.current.setLatLng([lat, lng])
      markerRef.current.setTooltipContent(
        `<div style="font-family:monospace;font-size:12px;background:rgba(10,14,26,0.9);color:#7b9ef8;border:1px solid rgba(90,125,243,0.3);padding:8px 12px;border-radius:8px">
          🛸 ISS Position<br/>
          Lat: ${lat.toFixed(4)}°<br/>
          Lng: ${lng.toFixed(4)}°<br/>
          <span style="color:#4ade80">● Live</span>
        </div>`
      )
    }

    // Update polyline trajectory
    if (positions.length >= 2) {
      const latlngs = positions.map(p => [p.lat, p.lng])

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs)
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: '#5a7df3',
          weight: 2,
          opacity: 0.7,
          dashArray: '6, 4',
          lineJoin: 'round',
        }).addTo(map)
      }

      // Add small dots for each tracked position
      positions.slice(0, -1).forEach((pos, i) => {
        const opacity = (i + 1) / positions.length
        L.circleMarker([pos.lat, pos.lng], {
          radius: 3,
          fillColor: '#5a7df3',
          color: '#5a7df3',
          weight: 0,
          fillOpacity: opacity * 0.6,
        }).addTo(map)
      })
    }

    // Pan to current position
    map.panTo([lat, lng], { animate: true, duration: 1 })
  }, [position, positions, mapReady])

  return (
    <div className={`relative rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : 'w-full h-full'}`}
      style={{ minHeight: isFullscreen ? 'auto' : '400px' }}>

      {/* Map controls overlay */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={refresh}
          className="p-2 rounded-lg backdrop-blur-md text-white transition-all hover:scale-110"
          style={{ background: 'rgba(10, 14, 26, 0.8)', border: '1px solid rgba(90,125,243,0.3)' }}
          title="Refresh ISS position"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={() => setIsFullscreen(v => !v)}
          className="p-2 rounded-lg backdrop-blur-md text-white transition-all hover:scale-110"
          style={{ background: 'rgba(10, 14, 26, 0.8)', border: '1px solid rgba(90,125,243,0.3)' }}
          title="Toggle fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Location badge */}
      {nearestLocation && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md"
          style={{ background: 'rgba(10, 14, 26, 0.85)', border: '1px solid rgba(90,125,243,0.3)' }}>
          <MapPin size={12} className="text-space-400" />
          <span className="text-xs text-white font-medium">{nearestLocation}</span>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: isFullscreen ? 'calc(100vh - 2rem)' : '400px' }}
      />

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#0a0e1a' }}>
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-space-500 border-t-transparent mx-auto mb-3"
            />
            <p className="text-sm text-space-400">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Fullscreen close */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ background: 'rgba(239,68,68,0.8)' }}
        >
          ✕ Close Fullscreen
        </button>
      )}
    </div>
  )
}
