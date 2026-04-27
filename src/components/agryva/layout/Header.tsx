'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  Search,
  Bell,
  MessageCircle,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Plus,
  FileText,
  Home,
  Tag,
  X,
  Heart,
  Bot,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useAppStore } from '@/components/agryva/store'
import { useT } from '@/lib/i18n'
import { HeaderTranslate } from '@/components/agryva/common/HeaderTranslate'

export function Header() {
  const {
    currentUser,
    setUser,
    navigateTo,
    currentPage,
    searchQuery,
    setSearchQuery,
    unreadNotificationCount,
    unreadMessageCount,
    mobileMenuOpen,
    setMobileMenuOpen,
    favoriteIds,
  } = useAppStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigateTo('ads', { search: searchQuery.trim() })
      setSearchOpen(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    navigateTo('home')
  }

  const { t } = useT()

  const navLinks = [
    { label: t('nav.home'), page: 'home' as const, icon: Home },
    ...(currentUser ? [{ label: t('nav.dashboard'), page: 'dashboard' as const, icon: LayoutDashboard }] : []),
    { label: t('nav.ads'), page: 'ads' as const, icon: FileText },
    { label: t('nav.favorites'), page: 'favorites' as const, icon: Heart, showCount: true },
    ...(currentUser ? [{ label: t('nav.aiAssistant'), page: 'ai-assistant' as const, icon: Bot }] : []),
    { label: t('nav.market'), page: 'market' as const, icon: TrendingUp },
    { label: t('nav.pricing'), page: 'pricing' as const, icon: Tag },
  ]

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigateTo('home')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-md">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-xl font-bold text-emerald-700">Ag</span>
            <span className="text-xl font-bold text-orange-500">r</span>
            <span className="text-xl font-bold text-emerald-700">yva</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigateTo(link.page)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === link.page
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {link.showCount && favoriteIds.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {favoriteIds.length}
                </span>
              )}
              {link.showVipBadge && (
                <Badge className="ml-1 bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">VIP</Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Language Selector */}
          <HeaderTranslate />

          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="flex items-center overflow-hidden"
                >
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search')}
                    className="h-9 rounded-r-none border-r-0 pr-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchOpen(false)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 rounded-l-none"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.form>
              ) : (
                <motion.div key="search-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                    className="text-gray-600 hover:text-emerald-700"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentUser ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('notifications')}
                className="relative text-gray-600 hover:text-emerald-700"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('messages')}
                className="relative text-gray-600 hover:text-emerald-700"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 pl-2 pr-1"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={currentUser.avatar || undefined}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[100px] truncate text-sm font-medium lg:block">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                      {currentUser.plan && (
                        <Badge
                          variant="secondary"
                          className={`mt-1 w-fit text-xs ${
                            currentUser.plan === 'VIP'
                              ? 'bg-amber-100 text-amber-700'
                              : currentUser.plan === 'PREMIUM'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ''
                          }`}
                        >
                          {currentUser.plan}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('nav.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('my-ads')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('nav.myAds')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    {t('nav.favorites')}
                    {favoriteIds.length > 0 && (
                      <Badge className="ml-auto bg-red-100 text-red-700 border-0 text-[10px] px-1.5 py-0">{favoriteIds.length}</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('ai-assistant')}>
                    <Bot className="mr-2 h-4 w-4" />
                    {t('nav.aiAssistant')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('create-ad')}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('nav.createAd')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigateTo('login')}
                className="text-gray-600 hover:text-emerald-700"
              >
                {t('nav.login')}
              </Button>
              <Button
                onClick={() => navigateTo('register')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t('nav.register')}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: Icons + Menu */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Language Selector in header */}
          <HeaderTranslate compact />

          {currentUser && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('notifications')}
                className="relative h-9 w-9 text-gray-600"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('messages')}
                className="relative h-9 w-9 text-gray-600"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </Button>
            </>
          )}

          {/* Create ad shortcut on mobile */}
          {currentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo('create-ad')}
              className="h-9 w-9 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-emerald-700">
                  <Leaf className="h-5 w-5" />
                  agryva
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1 px-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search')}
                      className="pl-9"
                    />
                  </div>
                </form>

                {/* Navigation Links */}
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.page}>
                    <button
                      onClick={() => navigateTo(link.page)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        currentPage === link.page
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                      {link.showCount && favoriteIds.length > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {favoriteIds.length}
                        </span>
                      )}
                    </button>
                  </SheetClose>
                ))}

                <div className="my-3 h-px bg-gray-100" />

                {currentUser ? (
                  <>
                    {/* User Info */}
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={currentUser.avatar || undefined}
                          alt={currentUser.name}
                        />
                        <AvatarFallback className="bg-emerald-100 text-sm text-emerald-700">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {currentUser.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <button
                        onClick={() => navigateTo('profile')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <User className="h-5 w-5" />
                        {t('nav.profile')}
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => navigateTo('dashboard')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        {t('nav.dashboard')}
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => navigateTo('my-ads')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <FileText className="h-5 w-5" />
                        {t('nav.myAds')}
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => navigateTo('create-ad')}
                        className="flex w-full items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plus className="h-5 w-5" />
                        {t('nav.publishAd')}
                      </button>
                    </SheetClose>

                    <div className="my-3 h-px bg-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigateTo('login')}
                      >
                        {t('nav.login')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigateTo('register')}
                      >
                        {t('nav.register')}
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
