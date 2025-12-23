import { normalizeLocations } from '../lib/location'

export default function AdCard({ ad, distance, onClick }) {
  const image = ad.images?.[0]
  const title = ad.title || 'Untitled'
  const description = ad.description ? ad.description.slice(0, 120) + '...' : ''
  const locations = normalizeLocations(ad.locations)

  return (
    <div onClick={onClick} className="card ad-card">
      {image && (
        <div className="ad-card-image-wrapper">
          <img src={image} alt={title} className="ad-card-image" />
        </div>
      )}
      <div className="ad-card-content">
        <h3 className="ad-card-title">{title}</h3>
        {description && <p className="ad-card-description">{description}</p>}
        {locations.length > 0 && (
          <div className="ad-card-locations">
            <div className="ad-card-location">
              <span>📍</span>
              <span>{locations[0].city}{locations.length > 1 ? ` +${locations.length - 1}` : ''}</span>
            </div>
            {distance !== null && distance !== undefined && (
              <div className="ad-card-distance">
                {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

