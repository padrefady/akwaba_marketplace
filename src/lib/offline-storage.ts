// Offline storage utility for agryva
// Uses localStorage for offline-first experience

export const STORAGE_KEYS = {
  USER: 'agryva_user',
  FAVORITES: 'agryva_favorites',
  LAST_VISIT: 'agryva_last_visit',
  RECENT_ADS: 'agryva_recent_ads',
  CACHED_CATEGORIES: 'agryva_categories_cache',
  CACHED_ADS: 'agryva_ads_cache',
  DRAFT_AD: 'agryva_draft_ad',
  SETTINGS: 'agryva_settings',
  OFFLINE_ACTIONS: 'agryva_offline_actions',
} as const

export interface OfflineAction {
  id: string
  type: 'CREATE_AD' | 'SEND_MESSAGE' | 'TOGGLE_FAVORITE' | 'UPDATE_PROFILE'
  payload: Record<string, unknown>
  timestamp: number
  synced: boolean
}

interface AppSettings {
  language: string
  notifications: boolean
  region: string
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'fr',
  notifications: true,
  region: '',
}

class OfflineStorage {
  // ==================== Basic get/set ====================

  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch {
      console.warn(`[OfflineStorage] Failed to parse key "${key}"`)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`[OfflineStorage] Failed to set key "${key}"`, error)
    }
  }

  remove(key: string): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`[OfflineStorage] Failed to remove key "${key}"`, error)
    }
  }

  // ==================== User ====================

  getUser(): Record<string, unknown> | null {
    return this.get<Record<string, unknown>>(STORAGE_KEYS.USER)
  }

  setUser(user: Record<string, unknown>): void {
    this.set(STORAGE_KEYS.USER, user)
  }

  clearUser(): void {
    this.remove(STORAGE_KEYS.USER)
  }

  // ==================== Favorites ====================

  getFavorites(): string[] {
    const favs = this.get<string[]>(STORAGE_KEYS.FAVORITES)
    return Array.isArray(favs) ? favs : []
  }

  addFavorite(adId: string): void {
    const favorites = this.getFavorites()
    if (!favorites.includes(adId)) {
      favorites.push(adId)
      this.set(STORAGE_KEYS.FAVORITES, favorites)
    }
  }

  removeFavorite(adId: string): void {
    const favorites = this.getFavorites()
    const filtered = favorites.filter((id) => id !== adId)
    this.set(STORAGE_KEYS.FAVORITES, filtered)
  }

  setFavorites(adIds: string[]): void {
    this.set(STORAGE_KEYS.FAVORITES, adIds)
  }

  isFavorite(adId: string): boolean {
    return this.getFavorites().includes(adId)
  }

  // ==================== Last visit tracking ====================

  getLastVisit(): string | null {
    return this.get<string>(STORAGE_KEYS.LAST_VISIT)
  }

  setLastVisit(): void {
    this.set(STORAGE_KEYS.LAST_VISIT, new Date().toISOString())
  }

  // ==================== Recent ads viewed ====================

  getRecentAds(): Record<string, unknown>[] {
    const ads = this.get<Record<string, unknown>[]>(STORAGE_KEYS.RECENT_ADS)
    return Array.isArray(ads) ? ads : []
  }

  addRecentAd(ad: Record<string, unknown>): void {
    const recent = this.getRecentAds()
    // Remove if already exists to avoid duplicates
    const filtered = recent.filter((a) => a.id !== ad.id)
    // Add to beginning
    filtered.unshift(ad)
    // Keep max 50
    const trimmed = filtered.slice(0, 50)
    this.set(STORAGE_KEYS.RECENT_ADS, trimmed)
  }

  // ==================== Cache categories ====================

  getCachedCategories(): Record<string, unknown>[] | null {
    return this.get<Record<string, unknown>[]>(STORAGE_KEYS.CACHED_CATEGORIES)
  }

  setCachedCategories(categories: Record<string, unknown>[]): void {
    this.set(STORAGE_KEYS.CACHED_CATEGORIES, categories)
  }

  // ==================== Draft ad (auto-save) ====================

  getDraftAd(): Record<string, unknown> | null {
    return this.get<Record<string, unknown>>(STORAGE_KEYS.DRAFT_AD)
  }

  setDraftAd(draft: Record<string, unknown>): void {
    this.set(STORAGE_KEYS.DRAFT_AD, draft)
  }

  clearDraftAd(): void {
    this.remove(STORAGE_KEYS.DRAFT_AD)
  }

  // ==================== Settings/preferences ====================

  getSettings(): AppSettings {
    const settings = this.get<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS)
    return { ...DEFAULT_SETTINGS, ...settings }
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings()
    this.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings })
  }

  // ==================== Offline actions queue ====================

  getOfflineActions(): OfflineAction[] {
    const actions = this.get<OfflineAction[]>(STORAGE_KEYS.OFFLINE_ACTIONS)
    return Array.isArray(actions) ? actions : []
  }

  addOfflineAction(
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>
  ): void {
    const actions = this.getOfflineActions()
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
    }
    actions.push(newAction)
    this.set(STORAGE_KEYS.OFFLINE_ACTIONS, actions)
  }

  markActionSynced(id: string): void {
    const actions = this.getOfflineActions()
    const updated = actions.map((a) =>
      a.id === id ? { ...a, synced: true } : a
    )
    this.set(STORAGE_KEYS.OFFLINE_ACTIONS, updated)
  }

  clearSyncedActions(): void {
    const actions = this.getOfflineActions()
    const pending = actions.filter((a) => !a.synced)
    this.set(STORAGE_KEYS.OFFLINE_ACTIONS, pending)
  }

  // ==================== Sync status ====================

  isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  }

  getPendingActionCount(): number {
    return this.getOfflineActions().filter((a) => !a.synced).length
  }

  // ==================== Clear all ====================

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.remove(key)
    })
  }
}

export const offlineStorage = new OfflineStorage()
