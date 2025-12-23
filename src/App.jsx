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
    <div className="app-root">
      <nav>
        <div className="container">
          <div className="logo-container" onClick={() => setView(VIEWS.LISTING)}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" />
            <span className="logo-text">Open Marketplace</span>
          </div>
          <div className="nav-actions">
            <button 
              onClick={() => setView(VIEWS.LISTING)} 
              className={`nav-button ${view === VIEWS.LISTING ? 'primary' : 'secondary'}`}
            >
              Browse
            </button>
            <button 
              onClick={() => setView(VIEWS.DASHBOARD)} 
              className={`nav-button ${view === VIEWS.DASHBOARD ? 'primary' : 'secondary'}`}
            >
              My Ads
            </button>
            <button 
              onClick={handleToggleTheme}
              className="secondary theme-button"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>
      <main>
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

