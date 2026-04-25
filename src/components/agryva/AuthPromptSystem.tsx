'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Leaf, Sparkles, Shield, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/components/agryva/store'

// ============================================================
// Hook : gère la logique d'affichage du popup (timing, fréquence)
// ============================================================
function useAuthPrompt() {
  const currentUser = useAppStore((s) => s.currentUser)
  const currentPage = useAppStore((s) => s.currentPage)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const sessionShownRef = useRef(false)

  const getInitialDismissed = () => {
    if (typeof window === 'undefined') return 0
    try {
      const raw = localStorage.getItem('agryva_prompt_dismissed')
      return raw ? (parseInt(raw, 10) || 0) : 0
    } catch { return 0 }
  }

  const [showPopup, setShowPopup] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const [dismissedSessions, setDismissedSessions] = useState(getInitialDismissed)

  const isAuthPage = currentPage === 'login' || currentPage === 'register'
  const shouldShow = !currentUser && !isAuthPage

  // Masquer si connecté ou sur page d'auth
  useEffect(() => {
    if (!shouldShow) {
      const t = setTimeout(() => { setShowPopup(false); setShowBar(false) }, 0)
      return () => clearTimeout(t)
    }
  }, [shouldShow])

  // Lire le compteur de rejet
  useEffect(() => {
    const val = getInitialDismissed()
    if (val !== dismissedSessions) {
      const t = setTimeout(() => setDismissedSessions(val), 0)
      return () => clearTimeout(t)
    }
  }, [])

  // ---- Barre d'incitation : apparaît après 10 secondes, cooldown 8h ----
  useEffect(() => {
    if (!shouldShow) return

    const barDismissed = localStorage.getItem('agryva_bar_dismissed_at')
    if (barDismissed) {
      const elapsed = Date.now() - parseInt(barDismissed, 10)
      if (elapsed < 8 * 60 * 60 * 1000) return // 8 h de cooldown
    }

    const t = setTimeout(() => setShowBar(true), 10000)
    return () => clearTimeout(t)
  }, [shouldShow])

  // ---- Popup : apparaît après 60 s UNIQUEMENT si barre pas encore visible ----
  useEffect(() => {
    if (!shouldShow) return
    // Ne pas montrer 2 fois par session
    if (sessionShownRef.current) return

    // Si déjà beaucoup rejeté (≥5), ne plus jamais montrer
    if (dismissedSessions >= 5) return

    // Vérifier le cooldown du popup
    const popupDismissed = localStorage.getItem('agryva_popup_dismissed_at')
    if (popupDismissed) {
      const elapsed = Date.now() - parseInt(popupDismissed, 10)
      // Cooldowns progressifs : 2h → 8h → 48h → 7 jours → ∞
      const cooldowns = [
        0,
        2 * 60 * 60 * 1000,        // 2 heures
        8 * 60 * 60 * 1000,        // 8 heures
        48 * 60 * 60 * 1000,       // 48 heures
        7 * 24 * 60 * 60 * 1000,   // 7 jours
      ]
      const cooldown = cooldowns[Math.min(dismissedSessions, cooldowns.length - 1)]
      if (elapsed < cooldown) return
    }

    const timer = setTimeout(() => {
      sessionShownRef.current = true
      setShowBar(false)
      setShowPopup(true)
    }, 60000) // 60 secondes

    return () => clearTimeout(timer)
  }, [shouldShow, dismissedSessions])

  // ---- Plus de popup au scroll (trop intrusif) ----
  // Supprimé : le popup ne se déclenche plus au scroll

  const handleOpenRegister = useCallback(() => {
    setShowPopup(false)
    setShowBar(false)
    navigateTo('register')
  }, [navigateTo])

  const handleOpenLogin = useCallback(() => {
    setShowPopup(false)
    setShowBar(false)
    navigateTo('login')
  }, [navigateTo])

  const handleDismissBar = useCallback(() => {
    setShowBar(false)
    localStorage.setItem('agryva_bar_dismissed_at', Date.now().toString())
  }, [])

  const handleDismissPopup = useCallback(() => {
    setShowPopup(false)
    const next = dismissedSessions + 1
    setDismissedSessions(next)
    localStorage.setItem('agryva_prompt_dismissed', next.toString())
    localStorage.setItem('agryva_popup_dismissed_at', Date.now().toString())
  }, [dismissedSessions])

  return {
    showPopup,
    showBar,
    handleOpenRegister,
    handleOpenLogin,
    handleDismissBar,
    handleDismissPopup,
  }
}

// ============================================================
// Barre d'incitation discrète (en haut)
// ============================================================
function AuthPromptBar({
  onRegister,
  onDismiss,
}: {
  onRegister: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      key="auth-bar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-white shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Leaf className="h-4 w-4 animate-bounce" />
          <span className="hidden sm:inline">
            Rejoignez <strong>agryva</strong> gratuitement — Achetez et vendez directement aux agriculteurs camerounais
          </span>
          <span className="sm:hidden">
            Rejoignez <strong>agryva</strong> gratuitement 🌾
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={onRegister}
            className="h-7 rounded-full bg-white px-4 text-xs font-bold text-emerald-700 shadow-md hover:bg-emerald-50"
          >
            S'inscrire
          </Button>
          <button
            onClick={onDismiss}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// Popup principal — design chaleureux, non intrusif
// ============================================================
function AuthPopup({
  onRegister,
  onLogin,
  onDismiss,
}: {
  onRegister: () => void
  onLogin: () => void
  onDismiss: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="auth-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Popup */}
      <motion.div
        key="auth-popup"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-[61] flex items-center justify-center p-4"
      >
        <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bandeau décoratif */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-500">
            {/* Motif décoratif */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1.5px, transparent 1.5px)',
                  backgroundSize: '40px 40px, 60px 60px',
                }}
              />
            </div>
            <div className="relative flex h-full flex-col items-center justify-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Bienvenue sur agryva 🌾
              </h2>
            </div>
            {/* Bouton fermer */}
            <button
              onClick={onDismiss}
              className="absolute right-3 top-3 rounded-full bg-black/20 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/30 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contenu */}
          <div className="space-y-5 px-6 py-6">
            {/* Avantages */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: 'Transactions sécurisées', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Users, label: 'Communauté agricole', color: 'text-amber-600 bg-amber-50' },
                { icon: TrendingUp, label: 'Offres & demandes', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Sparkles, label: 'Inscription gratuite', color: 'text-amber-600 bg-amber-50' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 p-2.5"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Créez votre compte en 30 secondes
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Boutons */}
            <Button
              onClick={onRegister}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-base font-bold text-white shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-emerald-600"
            >
              S'inscrire gratuitement
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              onClick={onLogin}
              className="h-11 w-full rounded-xl border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              J'ai déjà un compte — Se connecter
            </Button>

            {/* Trust */}
            <p className="text-center text-[11px] text-gray-400">
              🔒 Vos données sont protégées. Aucun spam garanti.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ============================================================
// Toast de bienvenue (affiché une seule fois, au tout premier visit)
// ============================================================
function WelcomeToast({ onRegister }: { onRegister: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = localStorage.getItem('agryva_welcome_seen')
    if (seen) return

    const t = setTimeout(() => {
      setShow(true)
      localStorage.setItem('agryva_welcome_seen', '1')
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 40, x: '-50%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-6 left-1/2 z-50 w-[90vw] max-w-sm rounded-2xl bg-white shadow-2xl border border-emerald-100"
    >
      <div className="mx-auto -mt-0.5 h-3 w-16 rounded-b-xl bg-gradient-to-r from-emerald-500 to-amber-500" />
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Bienvenue sur agryva ! 🌾
          </p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            La plateforme agricole n°1 du Cameroun. Créez votre compte pour publier vos annonces et contacter les vendeurs.
          </p>
          <button
            onClick={() => { setShow(false); onRegister() }}
            className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            S'inscrire gratuitement →
          </button>
        </div>
        <button
          onClick={() => setShow(false)}
          className="shrink-0 rounded-full p-1 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ============================================================
// Composant principal — combine tous les éléments
// ============================================================
export function AuthPromptSystem() {
  const {
    showPopup,
    showBar,
    handleOpenRegister,
    handleOpenLogin,
    handleDismissBar,
    handleDismissPopup,
  } = useAuthPrompt()

  const currentUser = useAppStore((s) => s.currentUser)

  // Ne rien montrer si connecté
  if (currentUser) return null

  return (
    <>
      {/* Toast de bienvenue (première visite uniquement) */}
      <WelcomeToast onRegister={handleOpenRegister} />

      {/* Barre d'incitation (après 10 s, cooldown 8 h) */}
      <AnimatePresence>
        {showBar && (
          <AuthPromptBar
            key="auth-bar"
            onRegister={handleOpenRegister}
            onDismiss={handleDismissBar}
          />
        )}
      </AnimatePresence>

      {/* Popup principal (après 60 s, cooldowns progressifs) */}
      <AnimatePresence>
        {showPopup && (
          <AuthPopup
            key="auth-popup-wrapper"
            onRegister={handleOpenRegister}
            onLogin={handleOpenLogin}
            onDismiss={handleDismissPopup}
          />
        )}
      </AnimatePresence>
    </>
  )
}
