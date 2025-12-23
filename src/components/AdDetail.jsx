import { normalizeLocations } from '../lib/location'

export default function AdDetail({ ad, onEdit, onDelete, onBack }) {
  if (!ad) return null
  
  const locations = normalizeLocations(ad.locations)

  return (
    <div style={{ flex: 1, padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onBack} className="secondary" style={{ fontSize: '0.875rem' }}>← Back</button>
          {onEdit && <button onClick={onEdit} className="primary" style={{ fontSize: '0.875rem' }}>Edit</button>}
          {onDelete && <button onClick={onDelete} className="danger" style={{ fontSize: '0.875rem' }}>Delete</button>}
        </div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>{ad.title || 'Untitled'}</h1>
          {ad.images?.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: ad.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem',
              borderRadius: 'var(--radius)',
              overflow: 'hidden'
            }}>
              {ad.images.map((img, i) => (
                <img key={i} src={img} alt={`${ad.title} ${i + 1}`} style={{ width: '100%', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
              ))}
            </div>
          )}
          {ad.video && (
            <div style={{ marginBottom: '2rem', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <video src={ad.video} controls style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          {ad.description && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text-secondary)' }}>{ad.description}</p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Seller Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ad.seller?.phone && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Phone:</strong>
                <p style={{ marginTop: '0.25rem' }}>{ad.seller.phone}</p>
              </div>
            )}
            {ad.seller?.email && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email:</strong>
                <p style={{ marginTop: '0.25rem' }}>{ad.seller.email}</p>
              </div>
            )}
            {ad.seller?.address && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Address:</strong>
                <p style={{ marginTop: '0.25rem' }}>{ad.seller.address}</p>
              </div>
            )}
          </div>
        </div>
        {locations.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Locations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {locations.map((loc, i) => (
                <div key={i} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: loc.radius || loc.coordinates ? '0.5rem' : 0 }}>
                    <span>📍</span>
                    <span style={{ fontWeight: 500 }}>{loc.city}</span>
                  </div>
                  {loc.radius && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Service radius: {loc.radius} km
                    </div>
                  )}
                  {loc.coordinates && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                      {loc.coordinates.lat.toFixed(6)}, {loc.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {ad.chatEnabled && (
          <div className="card" style={{ marginTop: '1.5rem', background: 'var(--primary-light)' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💬</span>
              <span>Private chat enabled</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

