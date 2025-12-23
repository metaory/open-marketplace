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
    <div className="page-wrapper">
      <div className="container">
        <div className="search-section">
          <h3>Browse Ads</h3>
          <div className="search-card">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by title, description, location, or seller info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="location-search-card">
              <label className="location-search-label">Location Search</label>
              <div className="location-search-fields">
                <div className="location-search-city">
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
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="city-suggestions">
                      {citySuggestions.map((city, i) => (
                        <div
                          key={i}
                          onClick={() => selectCity(city)}
                          className="city-suggestion-item"
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="location-search-radius">
                  <select
                    value={locationSearch.radius}
                    onChange={(e) => setLocationSearch({ ...locationSearch, radius: e.target.value })}
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
                  className="secondary location-search-btn"
                >
                  📍 Use My Location
                </button>
                {(locationSearch.city || locationSearch.coordinates) && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch({ city: '', radius: '', coordinates: null })}
                    className="secondary location-search-btn"
                  >
                    Clear
                  </button>
                )}
              </div>
              {locationSearch.coordinates && (
                <div className="location-coords-info">
                  📍 Using location: {locationSearch.coordinates.lat.toFixed(4)}, {locationSearch.coordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
            <div className="sort-section">
              <div className="sort-select">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
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
        <div className="ads-grid">
          {filteredAds.map(ad => (
            <AdCard key={ad.id} ad={ad} distance={ad._distance} onClick={() => onAdClick(ad.id)} />
          ))}
        </div>
        {filteredAds.length === 0 && (
          <div className="empty-state">
            <p>
              {allAds.length === 0 ? 'No ads yet. Create one in the dashboard!' : 'No ads found matching your search.'}
            </p>
            {allAds.length > 0 && <p>Try adjusting your search or filters.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

