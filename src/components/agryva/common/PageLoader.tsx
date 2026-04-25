'use client'

import { Loader2, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { useT } from '@/lib/i18n'

/**
 * Inline page loader shown during lazy-loaded page transitions.
 * Compact and minimal, doesn't take over the full screen.
 */
export function PageLoader() {
  const { t } = useT()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
        <Leaf className="h-6 w-6 text-emerald-500 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        <span>{t('common.loading')}</span>
      </div>
    </motion.div>
  )
}
