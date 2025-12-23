import { normalizeLocations } from '../lib/location'

export default function AdCard({ ad, distance, onClick }) {
  const image = ad.images?.[0]
  const title = ad.title || 'Untitled'
  const description = ad.description ? ad.description.slice(0, 120) + '...' : ''
  const locations = normalizeLocations(ad.locations)

  return (
    <div onClick={onClick} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
      {image && (
        <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'var(--bg)' }}>
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', lineHeight: '1.3' }}>{title}</h3>
        {description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>{description}</p>}
        {locations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>📍</span>
              <span>{locations[0].city}{locations.length > 1 ? ` +${locations.length - 1}` : ''}</span>
            </div>
            {distance !== null && distance !== undefined && (
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500 }}>
                {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

