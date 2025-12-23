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
    <div style={{ flex: 1, padding: '2rem 0' }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1>My Ads</h1>
          <button onClick={onCreateAd} className="primary" style={{ fontSize: '0.875rem' }}>
            + Create New Ad
          </button>
        </div>
        {ads.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>You haven't created any ads yet.</p>
            <button onClick={onCreateAd} className="primary">Create Your First Ad</button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem'
          }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <AdCard ad={ad} onClick={() => onViewAd(ad.id)} />
                <div style={{ 
                  marginTop: '0.75rem', 
                  display: 'flex', 
                  gap: '0.5rem',
                  padding: '0 0.25rem'
                }}>
                  <button 
                    onClick={() => onEditAd(ad.id)} 
                    className="secondary"
                    style={{ flex: 1, fontSize: '0.875rem' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id)} 
                    className="danger"
                    style={{ flex: 1, fontSize: '0.875rem' }}
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

