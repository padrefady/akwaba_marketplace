'use client'

import { motion } from 'framer-motion'
import { Leaf, Loader2 } from 'lucide-react'
import { useT } from '@/lib/i18n'

/**
 * Full-screen splash loader shown on first app load.
 * Displays the Agryva branding with an animated loading indicator.
 * The bar loops until onComplete() is called.
 */
export function SplashLoader({ onComplete }: { onComplete: () => void }) {
  const { t } = useT()

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl">
          <Leaf className="h-10 w-10 text-white" />
        </div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-2 flex items-center gap-0.5"
      >
        <span className="text-4xl font-bold text-emerald-700">Ag</span>
        <span className="text-4xl font-bold text-orange-500">r</span>
        <span className="text-4xl font-bold text-emerald-700">yva</span>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mb-8 text-sm text-gray-500"
      >
        {t('splash.tagline')}
      </motion.p>

      {/* Loading bar — loops until onComplete is called */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}