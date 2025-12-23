import { useState, useEffect } from 'react'
import { getAds, saveAd, updateAd, getAd, deleteAd } from './lib/storage'
import { getTheme, toggleTheme } from './lib/theme'
import Listing from './pages/Listing'
import Dashboard from './pages/Dashboard'
import AdDetail from './components/AdDetail'
import AdForm from './components/AdForm'

const VIEWS = {
  LISTING: 'listing',
  DASHBOARD: 'dashboard',
  DETAIL: 'detail',
  CREATE: 'create',
  EDIT: 'edit',
}

export default function App() {
  const [view, setView] = useState(VIEWS.LISTING)
  const [currentAdId, setCurrentAdId] = useState(null)
  const [ads, setAds] = useState([])
  const [theme, setThemeState] = useState(getTheme())

  useEffect(() => {
    setAds(getAds())
  }, [])

  const handleToggleTheme = () => {
    const newTheme = toggleTheme()
    setThemeState(newTheme)
  }

  const refreshAds = () => setAds(getAds())

  const handleSaveAd = (adData) => {
    if (adData.id) {
      updateAd(adData.id, adData)
    } else {
      saveAd(adData)
    }
    refreshAds()
    setView(VIEWS.DASHBOARD)
  }

  const handleDeleteAd = (id) => {
    if (confirm('Delete this ad?')) {
      deleteAd(id)
      refreshAds()
      setView(VIEWS.DASHBOARD)
    }
  }

  const currentAd = currentAdId ? getAd(currentAdId) : null

  if (view === VIEWS.CREATE) {
    return <AdForm onSubmit={handleSaveAd} onCancel={() => setView(VIEWS.DASHBOARD)} />
  }

  if (view === VIEWS.EDIT) {
    return <AdForm ad={currentAd} onSubmit={handleSaveAd} onCancel={() => setView(VIEWS.DASHBOARD)} />
  }

  if (view === VIEWS.DETAIL) {
    return (
      <AdDetail
        ad={currentAd}
        onEdit={() => setView(VIEWS.EDIT)}
        onDelete={() => handleDeleteAd(currentAdId)}
        onBack={() => setView(VIEWS.LISTING)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border)', 
        boxShadow: '0 1px 3px var(--shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => setView(VIEWS.LISTING)}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Marketplace" style={{ height: '32px', width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => setView(VIEWS.LISTING)} 
              className={view === VIEWS.LISTING ? 'primary' : 'secondary'}
              style={{ fontSize: '0.875rem' }}
            >
              Browse
            </button>
            <button 
              onClick={() => setView(VIEWS.DASHBOARD)} 
              className={view === VIEWS.DASHBOARD ? 'primary' : 'secondary'}
              style={{ fontSize: '0.875rem' }}
            >
              My Ads
            </button>
            <button 
              onClick={handleToggleTheme}
              className="secondary"
              style={{ fontSize: '1.25rem', padding: '0.5rem 0.75rem', minWidth: 'auto' }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1 }}>
        {view === VIEWS.LISTING && <Listing onAdClick={(id) => { setCurrentAdId(id); setView(VIEWS.DETAIL) }} />}
        {view === VIEWS.DASHBOARD && (
          <Dashboard
            onCreateAd={() => setView(VIEWS.CREATE)}
            onEditAd={(id) => { setCurrentAdId(id); setView(VIEWS.EDIT) }}
            onViewAd={(id) => { setCurrentAdId(id); setView(VIEWS.DETAIL) }}
          />
        )}
      </main>
    </div>
  )
}

