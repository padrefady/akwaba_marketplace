'use client'

import { useAppStore, type Page } from '../store'
import { useT } from '@/lib/i18n'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
} from 'lucide-react'

interface NavItem {
  page: Page
  labelKey: string
  icon: React.ElementType
  isCenter?: boolean
}

export function BottomNav() {
  const { currentPage, navigateTo, currentUser, unreadMessageCount } = useAppStore()
  const { t } = useT()

  const navItems: NavItem[] = [
    { page: 'home', labelKey: 'nav.home', icon: Home },
    { page: 'ads', labelKey: 'nav.products', icon: Search },
    { page: currentUser ? 'create-ad' : 'login', labelKey: 'nav.sell', icon: PlusCircle, isCenter: true },
    { page: currentUser ? 'messages' : 'login', labelKey: 'nav.messages', icon: MessageCircle },
    { page: currentUser ? 'profile' : 'login', labelKey: 'nav.profile', icon: User },
  ]

  const isActive = (page: Page) => {
    if (page === 'ads') return currentPage === 'ads' || currentPage === 'market'
    if (page === 'profile') return currentPage === 'profile' || currentPage === 'dashboard'
    return currentPage === page
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item, idx) => {
          const active = isActive(item.page)
          const Icon = item.icon
          const showBadge = item.page === 'messages' && unreadMessageCount > 0

          if (item.isCenter) {
            return (
              <button
                key={`${item.page}-${idx}`}
                onClick={() => navigateTo(item.page)}
                className="relative -mt-5 flex flex-col items-center"
                aria-label={t(item.labelKey)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="mt-1 text-[10px] font-medium text-emerald-700">
                  {t(item.labelKey)}
                </span>
              </button>
            )
          }

          return (
            <button
              key={`${item.page}-${idx}`}
              onClick={() => navigateTo(item.page)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
              aria-label={t(item.labelKey)}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </div>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 h-0.5 w-8 rounded-full bg-emerald-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {t(item.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
