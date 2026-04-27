// ==================== URL ROUTING ====================
// Maps between Zustand page/params and browser URL paths
// Format: /{lang}/{page}/{param1}/{param2}
// Ad detail: /{lang}/annonces/{category}/{title-slug}

import { LANGUAGES } from './i18n'
import type { Page } from '@/components/agryva/store'

export type UrlParams = Record<string, any>

// French URL paths for each page
const PAGE_SLUGS: Record<Page, string> = {
  home: '',
  login: 'connexion',
  register: 'inscription',
  ads: 'annonces',
  'ad-detail': '',       // Handled specially — uses /annonces/{category}/{slug}
  'create-ad': 'publier',
  'edit-ad': 'modifier',
  profile: 'profil',
  'my-ads': 'mes-annonces',
  messages: 'messages',
  notifications: 'notifications',
  pricing: 'tarifs',
  payment: 'paiement',
  dashboard: 'tableau-de-bord',
  favorites: 'favoris',
  'ai-assistant': 'assistant-ia',
  terms: 'conditions',
  privacy: 'confidentialite',
  faq: 'faq',
  support: 'aide',
  market: 'marche',
  'user-profile': 'profil',
}

// Reverse mapping: slug → Page
const SLUG_TO_PAGE: Record<string, Page> = Object.entries(PAGE_SLUGS).reduce(
  (acc, [page, slug]) => {
    if (slug) acc[slug] = page as Page
    return acc
  },
  {} as Record<string, Page>
)

/**
 * Convert a Page + params to a URL path
 * e.g. pageToUrl('ads', {}, 'fr') → '/fr/annonces'
 * e.g. pageToUrl('ad-detail', { categorySlug: 'epices', title: 'Gingembre frais' }, 'fr')
 *       → '/fr/annonces/epices/gingembre-frais'
 */
export function pageToUrl(page: Page, params: UrlParams = {}, lang?: string): string {
  const urlLang = lang || 'fr'
  const slug = PAGE_SLUGS[page]

  const segments: string[] = [urlLang]

  switch (page) {
    case 'ad-detail': {
      // /{lang}/annonces/{category}/{title-slug}
      const category = params.categorySlug || params.category || 'categorie'
      const titleSlug = slugify(params.title || 'annonce')
      segments.push('annonces', category, titleSlug)
      break
    }
    case 'ads': {
      // /{lang}/annonces  or  /{lang}/annonces/{category}
      segments.push('annonces')
      if (params.category) {
        segments.push(params.category)
      }
      break
    }
    case 'edit-ad': {
      // /{lang}/modifier/{id}
      const editId = params.id || params.adId || ''
      segments.push(slug, editId)
      break
    }
    case 'user-profile': {
      // /{lang}/profil/{userId}/{userName}
      const userId = params.userId || ''
      const nameSlug = slugify(params.userName || userId)
      segments.push(slug, userId, nameSlug)
      break
    }
    case 'messages': {
      // /{lang}/messages/{conversationId}
      segments.push(slug)
      if (params.conversationId) {
        segments.push(params.conversationId)
      }
      break
    }
    case 'payment': {
      // /{lang}/paiement/{adId}
      segments.push(slug)
      if (params.adId) {
        segments.push(params.adId)
      }
      break
    }
    default: {
      if (slug) segments.push(slug)
    }
  }

  return '/' + segments.filter(Boolean).join('/')
}

/**
 * Parse a URL path back to Page + params
 * e.g. '/fr/annonces' → { page: 'ads', params: {}, lang: 'fr' }
 * e.g. '/fr/annonces/epices/gingembre-frais' → { page: 'ad-detail', params: { category: 'epices', slug: 'gingembre-frais' }, lang: 'fr' }
 */
export function urlToPage(pathname: string): { page: Page; params: UrlParams; lang: string } | null {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (segments.length === 0) {
    return { page: 'home', params: {}, lang: 'fr' }
  }

  // First segment: language
  const langCode = getLangFromUrl(segments[0])
  const lang = langCode || 'fr'
  const rest = langCode ? segments.slice(1) : segments

  // No path after language → home
  if (rest.length === 0) {
    return { page: 'home', params: {}, lang }
  }

  // First remaining segment: page slug
  const pageSlug = rest[0].toLowerCase()
  const params: UrlParams = {}
  const pathRest = rest.slice(1)

  // Special handling for 'annonces' (shared by ads listing and ad-detail)
  if (pageSlug === 'annonces') {
    if (pathRest.length >= 2) {
      // /annonces/{category}/{slug} → ad-detail
      params.category = pathRest[0]
      params.slug = pathRest.slice(1).join('-')
      return { page: 'ad-detail', params, lang }
    } else if (pathRest.length === 1) {
      // /annonces/{category} → ads with category filter
      params.category = pathRest[0]
      return { page: 'ads', params, lang }
    } else {
      // /annonces → ads listing
      return { page: 'ads', params: {}, lang }
    }
  }

  // Other pages
  const page = SLUG_TO_PAGE[pageSlug]

  if (!page) {
    // Unknown page → treat as home
    return { page: 'home', params: {}, lang }
  }

  switch (page) {
    case 'edit-ad':
      // /modifier/{id}
      if (pathRest[0]) {
        params.id = pathRest[0]
        params.adId = pathRest[0]
      }
      break
    case 'user-profile':
      // /profil/{userId}/{name-slug}
      if (pathRest[0]) params.userId = pathRest[0]
      break
    case 'messages':
      // /messages/{conversationId}
      if (pathRest[0]) params.conversationId = pathRest[0]
      break
    case 'payment':
      // /paiement/{adId}
      if (pathRest[0]) params.adId = pathRest[0]
      break
  }

  return { page, params, lang }
}

/**
 * Get the language code from a URL segment
 */
export function getLangFromUrl(segment: string): string | null {
  const lang = LANGUAGES.find((l) => l.urlCode === segment.toLowerCase())
  return lang?.urlCode || null
}

/**
 * Slugify a string for URL use
 * e.g. "Régimes de plantains mûrs" → "regimes-de-plantains-murs"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60) // Limit length
}

/**
 * Push a new URL to browser history
 */
export function pushUrl(url: string): void {
  if (typeof window === 'undefined') return
  window.history.pushState({}, '', url)
}

/**
 * Replace current URL without adding to history
 */
export function replaceUrl(url: string): void {
  if (typeof window === 'undefined') return
  window.history.replaceState({}, '', url)
}

/**
 * Get current browser URL path
 */
export function getCurrentPathname(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

/**
 * Get the full canonical URL for the current page
 */
export function getCanonicalUrl(page: Page, params: UrlParams = {}, lang?: string): string {
  const url = pageToUrl(page, params, lang)
  if (typeof window === 'undefined') return url
  return window.location.origin + url
}
