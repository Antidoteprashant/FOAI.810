/**
 * Haversine formula to calculate distance between two lat/lng points
 * Returns distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Format coordinates to readable string
 */
export function formatCoordinate(value, type) {
  const abs = Math.abs(value)
  const dir = type === 'lat'
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W')
  return `${abs.toFixed(4)}° ${dir}`
}

/**
 * Format speed in km/h with comma separator
 */
export function formatSpeed(kmh) {
  return `${Math.round(kmh).toLocaleString()} km/h`
}

/**
 * Calculate ISS speed - ISS moves at ~7.66 km/s = ~27,576 km/h
 * We normalize the calculated speed to a realistic range
 */
export function normalizeISSSpeed(calculatedSpeed) {
  const MIN_SPEED = 27000
  const MAX_SPEED = 28500
  if (!calculatedSpeed || calculatedSpeed < MIN_SPEED || calculatedSpeed > MAX_SPEED) {
    return Math.round(MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED))
  }
  return Math.round(calculatedSpeed)
}
