'use client'

import { create } from 'zustand'

// ==================== TYPES ====================

export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'ads'
  | 'ad-detail'
  | 'create-ad'
  | 'edit-ad'
  | 'profile'
  | 'my-ads'
  | 'messages'
  | 'notifications'
  | 'pricing'
  | 'payment'
  | 'dashboard'
  | 'favorites'
  | 'ai-assistant'
  | 'terms'
  | 'privacy'
  | 'faq'
  | 'support'
  | 'market'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  bio?: string
  location?: string
  region?: string
  city?: string
  role: string
  plan: string
  planExpiresAt?: string
  isVerified: boolean
  isOnline: boolean
  lastSeen: string
  createdAt: string
  adCount?: number
  avgRating?: number
}

export interface Ad {
  id: string
  title: string
  description: string
  price?: number
  priceUnit?: string
  type: string
  categorySlug: string
  condition?: string
  quantity?: string
  location?: string
  region?: string
  city?: string
  images: string
  status: string
  isFeatured: boolean
  isUrgent: boolean
  viewsCount: number
  phone?: string
  negociable: boolean
  delivery: boolean
  tags: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  authorId: string
  author?: User
}

export interface Category {
  id: string
  name: string
  icon?: string
  slug: string
  order: number
  adCount?: number
}

export interface Conversation {
  id: string
  user1Id: string
  user2Id: string
  adId?: string
  lastMessageAt: string
  otherUser?: User
  lastMessage?: Message
  unreadCount?: number
}

export interface Message {
  id: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
  senderId: string
  receiverId: string
  conversationId: string
}

export interface Notification {
  id: string
  type: string
  title: string
  content: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  adId?: string
  buyerId: string
  sellerId: string
  amount: number
  platformFee: number
  sellerAmount: number
  currency: string
  status: string
  paymentMethod: string
  description?: string
  createdAt: string
  ad?: Ad
  buyer?: User
  seller?: User
}

export interface PaymentPlan {
  id: string
  name: string
  displayName: string
  price: number
  features: string[]
  maxAds: number
  isPopular: boolean
}

export interface Advertisement {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  position: string
  clicksCount: number
  impressionsCount: number
}

// ==================== APP STATE ====================

export interface TranslationResult {
  title: string
  description: string
  language: string
  show: boolean
}

interface AppState {
  // Navigation
  currentPage: Page
  pageParams: Record<string, any>
  navigateTo: (page: Page, params?: Record<string, any>) => void

  // Auth
  currentUser: User | null
  setUser: (user: User | null) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Ad filters
  filters: {
    type: string
    category: string
    region: string
    minPrice: string
    maxPrice: string
  }
  setFilters: (filters: Partial<AppState['filters']>) => void
  resetFilters: () => void

  // Favorites
  favoriteIds: string[]
  setFavoriteIds: (ids: string[]) => void
  isFavorite: (adId: string) => boolean
  toggleFavorite: (adId: string) => void

  // Notifications
  unreadNotificationCount: number
  setUnreadNotificationCount: (count: number) => void

  // Unread message count
  unreadMessageCount: number
  setUnreadMessageCount: (count: number) => void

  // Mobile menu
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void

  // Translation
  translationResult: TranslationResult | null
  setTranslationResult: (result: TranslationResult | null) => void

  // Language / i18n
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void

  // Splash loader control
  homeDataReady: boolean
  setHomeDataReady: (ready: boolean) => void

  // Dynamic translations cache
  dynamicTranslations: Record<string, string>
  setDynamicTranslations: (translations: Record<string, string>) => void
  translationVersion: number
  incrementTranslationVersion: () => void
}

const defaultFilters = {
  type: '',
  category: '',
  region: '',
  minPrice: '',
  maxPrice: '',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key)
    if (stored) {
      try { return JSON.parse(stored) } catch { return fallback }
    }
  }
  return fallback
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'home',
  pageParams: {},
  navigateTo: (page, params = {}) => {
    window.scrollTo(0, 0)
    set({ currentPage: page, pageParams: params, mobileMenuOpen: false })
  },

  // Auth
  currentUser: loadFromStorage<User | null>('agryva_user', null),
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('agryva_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('agryva_user')
      }
    }
    set({ currentUser: user })
  },

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Filters
  filters: { ...defaultFilters },
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  // Favorites
  favoriteIds: loadFromStorage<string[]>('agryva_favorites', []),
  setFavoriteIds: (ids) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agryva_favorites', JSON.stringify(ids))
    }
    set({ favoriteIds: ids })
  },
  isFavorite: (adId) => {
    return get().favoriteIds.includes(adId)
  },
  toggleFavorite: (adId) => {
    set((state) => {
      const exists = state.favoriteIds.includes(adId)
      const newIds = exists
        ? state.favoriteIds.filter((id) => id !== adId)
        : [...state.favoriteIds, adId]
      if (typeof window !== 'undefined') {
        localStorage.setItem('agryva_favorites', JSON.stringify(newIds))
      }
      return { favoriteIds: newIds }
    })
  },

  // Notifications
  unreadNotificationCount: 0,
  setUnreadNotificationCount: (count) => set({ unreadNotificationCount: count }),

  // Messages
  unreadMessageCount: 0,
  setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),

  // Mobile menu
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // Translation
  translationResult: null,
  setTranslationResult: (result) => set({ translationResult: result }),

  // Language / i18n
  currentLanguage: loadFromStorage<string>('agryva_language', 'fr'),
  setCurrentLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agryva_language', lang)
    }
    set({ currentLanguage: lang })
  },

  // Splash loader control
  homeDataReady: false,
  setHomeDataReady: (ready) => set({ homeDataReady: ready }),

  // Dynamic translations
  dynamicTranslations: {},
  setDynamicTranslations: (translations) => set({ dynamicTranslations: translations }),
  translationVersion: 0,
  incrementTranslationVersion: () => set((state) => ({ translationVersion: state.translationVersion + 1 })),
}))