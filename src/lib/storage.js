import { normalizeLocations } from './location'

const ADS_KEY = 'marketplace_ads'
const USER_KEY = 'marketplace_user'

const migrateAd = (ad) => {
  if (ad.locations && Array.isArray(ad.locations) && ad.locations.length > 0 && typeof ad.locations[0] === 'string') {
    ad.locations = normalizeLocations(ad.locations)
  }
  return ad
}

export const getAds = () => {
  const data = localStorage.getItem(ADS_KEY)
  if (!data) return []
  
  const ads = JSON.parse(data)
  return ads.map(migrateAd)
}

export const saveAd = (ad) => {
  const ads = getAds()
  const newAd = { ...ad, id: ad.id || Date.now().toString(), createdAt: ad.createdAt || Date.now() }
  ads.push(newAd)
  localStorage.setItem(ADS_KEY, JSON.stringify(ads))
  return newAd
}

export const updateAd = (id, updates) => {
  const ads = getAds()
  const index = ads.findIndex(ad => ad.id === id)
  if (index === -1) return null
  ads[index] = { ...ads[index], ...updates }
  localStorage.setItem(ADS_KEY, JSON.stringify(ads))
  return ads[index]
}

export const deleteAd = (id) => {
  const ads = getAds()
  const filtered = ads.filter(ad => ad.id !== id)
  localStorage.setItem(ADS_KEY, JSON.stringify(filtered))
  return filtered.length < ads.length
}

export const getAd = (id) => {
  const ads = getAds()
  return ads.find(ad => ad.id === id) || null
}

export const getUser = () => {
  const data = localStorage.getItem(USER_KEY)
  return data ? JSON.parse(data) : { profilePicture: '' }
}

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

