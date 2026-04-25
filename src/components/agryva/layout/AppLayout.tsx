'use client'

import { Suspense, lazy, useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/components/agryva/store'
import { getLangFromUrl } from '@/lib/i18n'
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

  const splashVisible = useMemo(() => showSplash && !homeDataReady, [showSplash, homeDataReady])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  // Hide splash when home data is ready
  useEffect(() => {
    if (homeDataReady) {
      queueMicrotask(() => setShowSplash(false))
    }
  }, [homeDataReady])

  // Detect language from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '')
      const firstSegment = path.split('/')[0]
      if (firstSegment) {
        const langCode = getLangFromUrl(firstSegment)
        if (langCode) {
          setCurrentLanguage(langCode)
        }
      }
    }
  }, [setCurrentLanguage])

  // Safety fallback: hide splash after 8s max
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