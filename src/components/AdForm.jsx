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
    <div className="page-wrapper">
      <div className="container form-container">
        <h1 className="form-title">{ad ? 'Edit Ad' : 'Create New Ad'}</h1>
        <form onSubmit={handleSubmit} className="card">
          <div className="form-section">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter ad title" />
          </div>
          <div className="form-section">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea-large" placeholder="Describe your item..." />
          </div>
          <div className="form-section">
            <label>Images</label>
            <ImageUpload images={images} onChange={setImages} />
          </div>
          <div className="form-section">
            <label>Video URL</label>
            <input type="url" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://..." />
          </div>
          <div className="seller-section">
            <h3>Seller Information</h3>
            <div className="seller-fields">
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
          <div className="form-section">
            <div className="location-header">
              <label>Locations</label>
              <button type="button" onClick={addLocation} className="secondary add-location-btn">
                + Add Location
              </button>
            </div>
            {locations.map((loc, index) => (
              <div key={index} className="location-item">
                {locations.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLocation(index)}
                    className="danger remove-location-btn"
                  >
                    ×
                  </button>
                )}
                <div className="location-field">
                  <label>City/Region</label>
                  <div className="location-input-wrapper">
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
                      <div className="city-suggestions">
                        {showSuggestions[index].map((city, i) => (
                          <div
                            key={i}
                            onClick={() => selectCity(index, city)}
                            className="city-suggestion-item"
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="location-field">
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
                  <div className="coords-inputs">
                    <input 
                      type="number" 
                      step="any"
                      value={loc.coordinates?.lat || ''} 
                      onChange={(e) => handleLocationChange(index, 'coordinates', { 
                        ...loc.coordinates, 
                        lat: e.target.value ? Number(e.target.value) : null 
                      })}
                      placeholder="Latitude" 
                      className="coords-input"
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
                      className="coords-input"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleGetLocation(index)}
                      className="secondary get-location-btn"
                    >
                      📍 Get Location
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="form-section form-section-large">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={chatEnabled} 
                onChange={(e) => setChatEnabled(e.target.checked)}
              />
              <span>Enable private chat</span>
            </label>
          </div>
          <div className="form-actions">
            {onCancel && (
              <button type="button" onClick={onCancel} className="secondary form-button">
                Cancel
              </button>
            )}
            <button type="submit" className="primary form-button">
              {ad ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

