import { getAds } from './storage'

export const normalizeLocation = (location) => {
  if (!location) return null
  
  if (typeof location === 'string') {
    return { city: location }
  }
  
  if (Array.isArray(location)) {
    return location.length > 0 ? { city: location[0] } : null
  }
  
  if (location.city) {
    return location
  }
  
  return null
}

export const normalizeLocations = (locations) => {
  if (!locations) return []
  
  if (Array.isArray(locations)) {
    if (locations.length === 0) return []
    
    if (typeof locations[0] === 'string') {
      return locations.map(city => ({ city }))
    }
    
    return locations.map(normalizeLocation).filter(Boolean)
  }
  
  const normalized = normalizeLocation(locations)
  return normalized ? [normalized] : []
}

export const getCityList = () => {
  const ads = getAds()
  const cities = new Set()
  
  ads.forEach(ad => {
    const locations = normalizeLocations(ad.locations || ad.location)
    locations.forEach(loc => {
      if (loc.city) cities.add(loc.city)
    })
  })
  
  return Array.from(cities).sort()
}

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const isWithinRadius = (adLocation, searchLocation, radius) => {
  if (!adLocation?.coordinates || !searchLocation?.coordinates || !radius) return false
  
  const distance = calculateDistance(
    adLocation.coordinates.lat,
    adLocation.coordinates.lng,
    searchLocation.coordinates.lat,
    searchLocation.coordinates.lng
  )
  
  return distance <= radius
}

export const matchesCity = (adLocation, searchCity) => {
  if (!searchCity) return true
  
  const locations = normalizeLocations(adLocation)
  return locations.some(loc => 
    loc.city?.toLowerCase().includes(searchCity.toLowerCase())
  )
}

export const getLocationDistance = (adLocation, searchLocation) => {
  if (!adLocation?.coordinates || !searchLocation?.coordinates) return null
  
  return calculateDistance(
    adLocation.coordinates.lat,
    adLocation.coordinates.lng,
    searchLocation.coordinates.lat,
    searchLocation.coordinates.lng
  )
}

