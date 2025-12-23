import { useState, useEffect } from 'react'
import { getAds, deleteAd } from '../lib/storage'
import AdCard from '../components/AdCard'

export default function Dashboard({ onCreateAd, onEditAd, onViewAd }) {
  const [ads, setAds] = useState([])

  useEffect(() => {
    setAds(getAds())
  }, [])

  const handleDelete = (id) => {
    if (confirm('Delete this ad?')) {
      deleteAd(id)
      setAds(getAds())
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Ads</h1>
          <button onClick={onCreateAd} className="primary dashboard-create-btn">
            + Create New Ad
          </button>
        </div>
        {ads.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>You haven't created any ads yet.</p>
            <button onClick={onCreateAd} className="primary">Create Your First Ad</button>
          </div>
        ) : (
          <div className="ads-grid">
            {ads.map(ad => (
              <div key={ad.id} className="ad-card-wrapper">
                <AdCard ad={ad} onClick={() => onViewAd(ad.id)} />
                <div className="ad-card-actions">
                  <button 
                    onClick={() => onEditAd(ad.id)} 
                    className="secondary ad-card-action-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id)} 
                    className="danger ad-card-action-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

