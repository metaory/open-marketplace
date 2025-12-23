import { useState, useEffect } from 'react'
import { normalizeLocations, getCityList } from '../lib/location'
import ImageUpload from './ImageUpload'

export default function AdForm({ ad = null, onSubmit, onCancel }) {
  const [title, setTitle] = useState(ad?.title || '')
  const [description, setDescription] = useState(ad?.description || '')
  const [images, setImages] = useState(ad?.images || [])
  const [video, setVideo] = useState(ad?.video || '')
  const [phone, setPhone] = useState(ad?.seller?.phone || '')
  const [email, setEmail] = useState(ad?.seller?.email || '')
  const [address, setAddress] = useState(ad?.seller?.address || '')
  const [locations, setLocations] = useState(() => {
    const normalized = normalizeLocations(ad?.locations)
    return normalized.length > 0 ? normalized : [{ city: '', radius: '', coordinates: null }]
  })
  const [chatEnabled, setChatEnabled] = useState(ad?.chatEnabled || false)
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState({})

  useEffect(() => {
    setCitySuggestions(getCityList())
  }, [])

  const handleLocationChange = (index, field, value) => {
    const updated = [...locations]
    updated[index] = { ...updated[index], [field]: value }
    setLocations(updated)
  }

  const handleGetLocation = (index) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const updated = [...locations]
        updated[index] = {
          ...updated[index],
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }
        setLocations(updated)
      },
      (error) => {
        alert('Unable to get your location: ' + error.message)
      }
    )
  }

  const addLocation = () => {
    setLocations([...locations, { city: '', radius: '', coordinates: null }])
  }

  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index))
    }
  }

  const handleCityInput = (index, value) => {
    handleLocationChange(index, 'city', value)
    if (value) {
      const filtered = citySuggestions.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      )
      setShowSuggestions({ ...showSuggestions, [index]: filtered.slice(0, 5) })
    } else {
      setShowSuggestions({ ...showSuggestions, [index]: [] })
    }
  }

  const selectCity = (index, city) => {
    handleLocationChange(index, 'city', city)
    setShowSuggestions({ ...showSuggestions, [index]: [] })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const adData = {
      title,
      description,
      images,
      video,
      seller: { phone, email, address },
      locations: locations
        .map(loc => ({
          city: loc.city.trim(),
          radius: loc.radius ? Number(loc.radius) : undefined,
          coordinates: loc.coordinates || undefined
        }))
        .filter(loc => loc.city),
      chatEnabled,
    }
    if (ad) adData.id = ad.id
    onSubmit(adData)
  }

  return (
    <div style={{ flex: 1, padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={{ marginBottom: '2rem' }}>{ad ? 'Edit Ad' : 'Create New Ad'}</h1>
        <form onSubmit={handleSubmit} className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter ad title" />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: '120px' }} placeholder="Describe your item..." />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Images</label>
            <ImageUpload images={images} onChange={setImages} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Video URL</label>
            <input type="url" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://..." />
          </div>
          <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Seller Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
              </div>
              <div>
                <label>Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0 }}>Locations</label>
              <button type="button" onClick={addLocation} className="secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                + Add Location
              </button>
            </div>
            {locations.map((loc, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                background: 'var(--bg)', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border)',
                position: 'relative'
              }}>
                {locations.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLocation(index)}
                    className="danger"
                    style={{ 
                      position: 'absolute', 
                      top: '0.5rem', 
                      right: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      minWidth: 'auto'
                    }}
                  >
                    ×
                  </button>
                )}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>City/Region</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={loc.city || ''} 
                      onChange={(e) => handleCityInput(index, e.target.value)}
                      onFocus={() => {
                        if (loc.city) {
                          const filtered = citySuggestions.filter(city => 
                            city.toLowerCase().includes(loc.city.toLowerCase())
                          )
                          setShowSuggestions({ ...showSuggestions, [index]: filtered.slice(0, 5) })
                        }
                      }}
                      placeholder="Enter city or region" 
                    />
                    {showSuggestions[index]?.length > 0 && (
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
                        {showSuggestions[index].map((city, i) => (
                          <div
                            key={i}
                            onClick={() => selectCity(index, city)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              borderBottom: i < showSuggestions[index].length - 1 ? '1px solid var(--border)' : 'none'
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
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Service Radius (km, optional)</label>
                  <input 
                    type="number" 
                    value={loc.radius || ''} 
                    onChange={(e) => handleLocationChange(index, 'radius', e.target.value)}
                    placeholder="e.g., 10" 
                    min="0"
                  />
                </div>
                <div>
                  <label>Coordinates (optional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      step="any"
                      value={loc.coordinates?.lat || ''} 
                      onChange={(e) => handleLocationChange(index, 'coordinates', { 
                        ...loc.coordinates, 
                        lat: e.target.value ? Number(e.target.value) : null 
                      })}
                      placeholder="Latitude" 
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="number" 
                      step="any"
                      value={loc.coordinates?.lng || ''} 
                      onChange={(e) => handleLocationChange(index, 'coordinates', { 
                        ...loc.coordinates, 
                        lng: e.target.value ? Number(e.target.value) : null 
                      })}
                      placeholder="Longitude" 
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleGetLocation(index)}
                      className="secondary"
                      style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
                    >
                      📍 Get Location
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={chatEnabled} 
                onChange={(e) => setChatEnabled(e.target.checked)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span>Enable private chat</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="secondary" style={{ fontSize: '0.875rem' }}>
                Cancel
              </button>
            )}
            <button type="submit" className="primary" style={{ fontSize: '0.875rem' }}>
              {ad ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

