'use client'

import { Suspense, lazy, useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, type Page } from '@/components/agryva/store'
import { getLangFromUrl, LANGUAGES } from '@/lib/i18n'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { OfflineBanner } from '@/components/agryva/OfflineBanner'
import { AuthPromptSystem } from '@/components/agryva/AuthPromptSystem'
import { PageLoader } from '@/components/agryva/common/PageLoader'
import { SplashLoader } from '@/components/agryva/common/SplashLoader'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/components/agryva/pages/HomePage').then(m => ({ default: m.HomePage })))
const AuthPage = lazy(() => import('@/components/agryva/pages/AuthPage').then(m => ({ default: m.AuthPage })))
const PricingPage = lazy(() => import('@/components/agryva/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const AdsPage = lazy(() => import('@/components/agryva/pages/AdsPage'))
const AdDetailPage = lazy(() => import('@/components/agryva/pages/AdDetailPage'))
const CreateAdPage = lazy(() => import('@/components/agryva/pages/CreateAdPage'))
const ProfilePage = lazy(() => import('@/components/agryva/pages/ProfilePage'))
const MyAdsPage = lazy(() => import('@/components/agryva/pages/MyAdsPage'))
const MessagesPage = lazy(() => import('@/components/agryva/pages/MessagesPage'))
const NotificationsPage = lazy(() => import('@/components/agryva/pages/NotificationsPage'))
const PaymentPage = lazy(() => import('@/components/agryva/pages/PaymentPage'))
const DashboardPage = lazy(() => import('@/components/agryva/pages/DashboardPage'))
const FavoritesPage = lazy(() => import('@/components/agryva/pages/FavoritesPage'))
const AiAssistantPage = lazy(() => import('@/components/agryva/pages/AiAssistantPage'))
const TermsPage = lazy(() => import('@/components/agryva/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/components/agryva/pages/PrivacyPage'))
const FaqPage = lazy(() => import('@/components/agryva/pages/FaqPage'))
const SupportPage = lazy(() => import('@/components/agryva/pages/SupportPage'))
const MarketPage = lazy(() => import('@/components/agryva/pages/MarketPage'))

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
}

// Pages where the bottom nav should be hidden
const HIDE_BOTTOM_NAV_PAGES = new Set([
  'login',
  'register',
  'ad-detail',
  'create-ad',
  'edit-ad',
  'payment',
  'terms',
  'privacy',
  'faq',
  'support',
])

// Reverse mapping: URL path segment → page name
const URL_TO_PAGE: Record<string, Page> = {
  'annonces': 'ads',
  'connexion': 'login',
  'inscription': 'register',
  'publier': 'create-ad',
  'profil': 'profile',
  'mes-annonces': 'my-ads',
  'messages': 'messages',
  'notifications': 'notifications',
  'offres': 'pricing',
  'paiement': 'payment',
  'tableau-de-bord': 'dashboard',
  'favoris': 'favorites',
  'assistant-ia': 'ai-assistant',
  'conditions': 'terms',
  'confidentialite': 'privacy',
  'faq': 'faq',
  'aide': 'support',
  'marche': 'market',
  'modifier': 'edit-ad',
}

function PageRouter() {
  const { currentPage } = useAppStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'login':
        return <AuthPage mode="login" />
      case 'register':
        return <AuthPage mode="register" />
      case 'ads':
        return <AdsPage />
      case 'ad-detail':
        return <AdDetailPage />
      case 'create-ad':
        return <CreateAdPage />
      case 'edit-ad':
        return <CreateAdPage />
      case 'profile':
        return <ProfilePage />
      case 'my-ads':
        return <MyAdsPage />
      case 'messages':
        return <MessagesPage />
      case 'notifications':
        return <NotificationsPage />
      case 'pricing':
        return <PricingPage />
      case 'payment':
        return <PaymentPage />
      case 'dashboard':
        return <DashboardPage />
      case 'favorites':
        return <FavoritesPage />
      case 'ai-assistant':
        return <AiAssistantPage />
      case 'terms':
        return <TermsPage />
      case 'privacy':
        return <PrivacyPage />
      case 'faq':
        return <FaqPage />
      case 'support':
        return <SupportPage />
      case 'market':
        return <MarketPage />
      default:
        return <HomePage />
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  )
}

export function AppLayout() {
  const [showSplash, setShowSplash] = useState(true)
  const { setCurrentLanguage, currentPage, homeDataReady } = useAppStore()

  // Derive splash visibility from store + fallback timer
  const splashVisible = useMemo(() => showSplash && !homeDataReady, [showSplash, homeDataReady])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  // Hide splash when home data is ready (categories + ads loaded)
  useEffect(() => {
    if (homeDataReady) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setShowSplash(false))
    }
  }, [homeDataReady])

  // Detect language from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '') // Remove leading /
      const firstSegment = path.split('/')[0]
      if (firstSegment) {
        const langCode = getLangFromUrl(firstSegment)
        if (langCode) {
          setCurrentLanguage(langCode)
        }
      }
    }
  }, [setCurrentLanguage])

  // Parse URL on mount to restore page state from URL
  useEffect(() => {
    if (typeof window === 'undefined') return

    const { navigateTo, setCurrentLanguage: setLang, currentLanguage: lang } = useAppStore.getState()
    const rawPath = window.location.pathname.replace(/^\//, '')
    const segments = rawPath.split('/').filter(Boolean)
    if (segments.length === 0) return

    // Determine if first segment is a language prefix
    const firstIsLang = LANGUAGES.some(l => l.urlCode === segments[0])
    const offset = firstIsLang ? 1 : 0

    // Set language from URL if detected
    if (firstIsLang) {
      const langCode = getLangFromUrl(segments[0])
      if (langCode && langCode !== lang) {
        setLang(langCode)
      }
    }

    const pathSegments = segments.slice(offset)

    // Handle ad-detail: /annonces/{categorySlug}/{titleSlug-shortId}
    if (pathSegments[0] === 'annonces' && pathSegments.length === 3) {
      const categorySlug = pathSegments[1]
      const slugSegment = pathSegments[2]
      // Extract short ID: last 7 chars after the final hyphen
      const lastHyphenIdx = slugSegment.lastIndexOf('-')
      if (lastHyphenIdx > 0) {
        const shortId = slugSegment.slice(lastHyphenIdx + 1)
        // The full ID is at least 7 chars, shortId is the first 7
        // We navigate to ad-detail with just the id; the page will load full data
        // Use shortId as the id to load (the API should handle partial IDs or we load by full match)
        // Actually, we need the full ID. Since we only have the short version from the URL,
        // navigate with it and let AdDetailPage load the ad. The shortId is enough to find the ad.
        navigateTo('ad-detail', { id: shortId, categorySlug, title: slugSegment.slice(0, lastHyphenIdx).replace(/-/g, ' ') })
      }
      return
    }

    // Handle edit-ad: /modifier/{id}
    if (pathSegments[0] === 'modifier' && pathSegments.length === 2) {
      navigateTo('edit-ad', { id: pathSegments[1] })
      return
    }

    // Handle standard pages
    if (pathSegments.length === 1) {
      const page = URL_TO_PAGE[pathSegments[0]]
      if (page) {
        navigateTo(page)
      }
      return
    }

    // Handle /annonces with no further segments → ads list
    if (pathSegments[0] === 'annonces' && pathSegments.length === 1) {
      navigateTo('ads')
    }
  }, [])

  // Safety fallback: hide splash after 8s max even if data not loaded
  useEffect(() => {
    const fallback = setTimeout(() => {
      setShowSplash(false)
    }, 8000)
    return () => clearTimeout(fallback)
  }, [])

  if (splashVisible) {
    return <SplashLoader onComplete={handleSplashComplete} />
  }

  const showBottomNav = !HIDE_BOTTOM_NAV_PAGES.has(currentPage)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <PageRouter />
      </main>
      <Footer />
      {showBottomNav && <BottomNav />}
      <OfflineBanner />
      <AuthPromptSystem />
    </div>
  )
}
