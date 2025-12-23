import { useState, useEffect, useMemo } from 'react'
import { getAds } from '../lib/storage'
import { normalizeLocations, getCityList, matchesCity, isWithinRadius, getLocationDistance } from '../lib/location'
import AdCard from '../components/AdCard'

export default function Listing({ onAdClick }) {
  const [allAds, setAllAds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [locationSearch, setLocationSearch] = useState({ city: '', radius: '', coordinates: null })
  const [sortOrder, setSortOrder] = useState('newest')
  const [allCities] = useState(() => getCityList())
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  useEffect(() => {
    setAllAds(getAds())
  }, [])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationSearch({
          ...locationSearch,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        })
      },
      (error) => {
        alert('Unable to get your location: ' + error.message)
      }
    )
  }

  const handleCityInput = (value) => {
    setLocationSearch({ ...locationSearch, city: value })
    if (value) {
      const filtered = allCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      )
      setCitySuggestions(filtered.slice(0, 5))
      setShowCitySuggestions(true)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }

  const selectCity = (city) => {
    setLocationSearch({ ...locationSearch, city })
    setShowCitySuggestions(false)
  }

  const filteredAds = useMemo(() => {
    let filtered = allAds

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(ad => {
        const title = (ad.title || '').toLowerCase()
        const desc = (ad.description || '').toLowerCase()
        const phone = (ad.seller?.phone || '').toLowerCase()
        const email = (ad.seller?.email || '').toLowerCase()
        const address = (ad.seller?.address || '').toLowerCase()
        const locs = normalizeLocations(ad.locations)
        const locsText = locs.map(l => l.city).join(' ').toLowerCase()
        return title.includes(query) || desc.includes(query) || phone.includes(query) || email.includes(query) || address.includes(query) || locsText.includes(query)
      })
    }

    if (locationSearch.city || locationSearch.coordinates) {
      filtered = filtered.filter(ad => {
        const adLocations = normalizeLocations(ad.locations)
        
        if (locationSearch.coordinates && locationSearch.radius) {
          const radius = Number(locationSearch.radius)
          return adLocations.some(loc => {
            if (!loc.coordinates) return false
            return isWithinRadius(loc, locationSearch, radius)
          })
        }
        
        if (locationSearch.city) {
          return matchesCity(adLocations, locationSearch.city)
        }
        
        return true
      })
    }

    const withDistance = filtered.map(ad => {
      const adLocations = normalizeLocations(ad.locations)
      let distance = null
      
      if (locationSearch.coordinates) {
        const locWithCoords = adLocations.find(loc => loc.coordinates)
        if (locWithCoords) {
          distance = getLocationDistance(locWithCoords, locationSearch)
        }
      }
      
      return { ...ad, _distance: distance }
    })

    const sorted = [...withDistance].sort((a, b) => {
      if (sortOrder === 'distance' && locationSearch.coordinates) {
        if (a._distance !== null && b._distance !== null) {
          return a._distance - b._distance
        }
        if (a._distance !== null) return -1
        if (b._distance !== null) return 1
      }
      
      const aTime = a.createdAt || 0
      const bTime = b.createdAt || 0
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
    })

    return sorted
  }, [allAds, searchQuery, locationSearch, sortOrder])

  return (
    <div style={{ flex: 1, padding: '2rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '1.5rem' }}>Browse Ads</h1>
          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search by title, description, location, or seller info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius)'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location Search</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="City or region"
                    value={locationSearch.city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => {
                      if (locationSearch.city) {
                        const filtered = allCities.filter(city => 
                          city.toLowerCase().includes(locationSearch.city.toLowerCase())
                        )
                        setCitySuggestions(filtered.slice(0, 5))
                        setShowCitySuggestions(true)
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '0.25rem',
                      zIndex: 10,
                      boxShadow: '0 2px 8px var(--shadow)'
                    }}>
                      {citySuggestions.map((city, i) => (
                        <div
                          key={i}
                          onClick={() => selectCity(city)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            borderBottom: i < citySuggestions.length - 1 ? '1px solid var(--border)' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ flex: '0 0 auto', minWidth: '120px' }}>
                  <select
                    value={locationSearch.radius}
                    onChange={(e) => setLocationSearch({ ...locationSearch, radius: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="">All distances</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                    <option value="100">Within 100 km</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="secondary"
                  style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                >
                  📍 Use My Location
                </button>
                {(locationSearch.city || locationSearch.coordinates) && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch({ city: '', radius: '', coordinates: null })}
                    className="secondary"
                    style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {locationSearch.coordinates && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  📍 Using location: {locationSearch.coordinates.lat.toFixed(4)}, {locationSearch.coordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  {locationSearch.coordinates && locationSearch.radius && (
                    <option value="distance">Distance first</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {filteredAds.map(ad => (
            <AdCard key={ad.id} ad={ad} distance={ad._distance} onClick={() => onAdClick(ad.id)} />
          ))}
        </div>
        {filteredAds.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              {allAds.length === 0 ? 'No ads yet. Create one in the dashboard!' : 'No ads found matching your search.'}
            </p>
            {allAds.length > 0 && <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filters.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

