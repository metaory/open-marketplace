import { normalizeLocations } from '../lib/location'

export default function AdDetail({ ad, onEdit, onDelete, onBack }) {
  if (!ad) return null
  
  const locations = normalizeLocations(ad.locations)

  return (
    <div className="page-wrapper">
      <div className="container detail-container">
        <div className="detail-actions">
          <button onClick={onBack} className="secondary detail-back-btn">← Back</button>
          {onEdit && <button onClick={onEdit} className="primary detail-edit-btn">Edit</button>}
          {onDelete && <button onClick={onDelete} className="danger detail-delete-btn">Delete</button>}
        </div>
        <div className="card detail-card">
          <h1 className="detail-title">{ad.title || 'Untitled'}</h1>
          {ad.images?.length > 0 && (
            <div className={`detail-images ${ad.images.length === 1 ? 'single' : 'multiple'}`}>
              {ad.images.map((img, i) => (
                <img key={i} src={img} alt={`${ad.title} ${i + 1}`} className="detail-image" />
              ))}
            </div>
          )}
          {ad.video && (
            <div className="detail-video-wrapper">
              <video src={ad.video} controls className="detail-video" />
            </div>
          )}
          {ad.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{ad.description}</p>
            </div>
          )}
        </div>
        <div className="card">
          <div className="seller-info">
            <h3>Seller Information</h3>
            <div className="seller-info-fields">
              {ad.seller?.phone && (
                <div className="seller-info-item">
                  <strong>Phone:</strong>
                  <p>{ad.seller.phone}</p>
                </div>
              )}
              {ad.seller?.email && (
                <div className="seller-info-item">
                  <strong>Email:</strong>
                  <p>{ad.seller.email}</p>
                </div>
              )}
              {ad.seller?.address && (
                <div className="seller-info-item">
                  <strong>Address:</strong>
                  <p>{ad.seller.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {locations.length > 0 && (
          <div className="card locations-card">
            <h3>Locations</h3>
            <div className="locations-list">
              {locations.map((loc, i) => (
                <div key={i} className="location-card">
                  <div className={`location-header-row ${loc.radius || loc.coordinates ? '' : 'no-margin'}`}>
                    <span>📍</span>
                    <span className="location-city">{loc.city}</span>
                  </div>
                  {loc.radius && (
                    <div className="location-radius">
                      Service radius: {loc.radius} km
                    </div>
                  )}
                  {loc.coordinates && (
                    <div className="location-coords">
                      {loc.coordinates.lat.toFixed(6)}, {loc.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {ad.chatEnabled && (
          <div className="card chat-badge">
            <p>
              <span>💬</span>
              <span>Private chat enabled</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

