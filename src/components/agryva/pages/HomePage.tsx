'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Wheat,
  Bean,
  Carrot,
  Apple,
  Beef,
  Fish,
  TreePine,
  FlaskConical,
  Tractor,
  Wrench,
  MapPinIcon,
  Package,
  CheckCircle2,
  Shield,
  Users,
  Leaf,
  ShoppingBag,
  Briefcase,
  Handshake,
  Eye,
  Clock,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAppStore } from '../store'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useT } from '@/lib/i18n'

// ==================== ICON MAP ====================
const iconMap: Record<string, React.ElementType> = {
  Wheat,
  Bean,
  Carrot,
  Apple,
  Beef,
  Fish,
  TreePine,
  FlaskConical,
  Tractor,
  Wrench,
  MapPinIcon,
  Package,
}

function getCategoryIcon(iconName?: string): React.ElementType {
  if (iconName && iconMap[iconName]) return iconMap[iconName]
  return Leaf
}

// ==================== ANIMATION VARIANTS ====================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ==================== COMPONENTS ====================
function HeroSection() {
  const { navigateTo, searchQuery, setSearchQuery, setFilters } = useAppStore()
  const { t } = useT()
  const [heroSearch, setHeroSearch] = useState(searchQuery)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Real stats from database
  const [platformStats, setPlatformStats] = useState<{ totalAds: number; totalUsers: number; totalRegions: number } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/agryva/categories?action=stats')
        const json = await res.json()
        if (json.success) setPlatformStats(json.data)
      } catch { /* silently fail */ }
    }
    fetchStats()
  }, [])

  const regions = [
    'Centre',
    'Littoral',
    'Ouest',
    'Nord-Ouest',
    'Sud-Ouest',
    'Sud',
    'Est',
    'Nord',
    'Extrême-Nord',
    'Adamaoua',
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(heroSearch)
    const filters: Record<string, string> = {}
    if (selectedCategory !== 'all') filters.category = selectedCategory
    if (selectedRegion !== 'all') filters.region = selectedRegion
    setFilters(filters)
    navigateTo('ads')
  }

  const stats = [
    { value: platformStats ? platformStats.totalAds.toLocaleString('fr-FR') + '+' : '...', label: t('hero.adsCount') },
    { value: platformStats ? platformStats.totalUsers.toLocaleString('fr-FR') + '+' : '...', label: t('hero.farmersCount') },
    { value: platformStats ? String(platformStats.totalRegions) : '...', label: t('hero.regionsCount') },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 75% 20%, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '50px 50px, 70px 70px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t('hero.welcome')}{' '}
              <span className="inline-flex items-center gap-2">
                <Leaf className="inline h-8 w-8 sm:h-10 sm:w-10" />
                Agryva
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-emerald-100 sm:text-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSearch}
            className="mx-auto mb-12 max-w-3xl"
          >
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row sm:items-center sm:gap-2 sm:p-2">
              {/* Category Select */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 w-full rounded-xl border-0 bg-gray-50 sm:w-40">
                  <SelectValue placeholder={t('hero.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hero.all')}</SelectItem>
                  <SelectItem value="cereales">Céréales</SelectItem>
                  <SelectItem value="legumineuses">Légumineuses</SelectItem>
                  <SelectItem value="tubercules">Tubercules</SelectItem>
                  <SelectItem value="fruits-legumes">Fruits & Légumes</SelectItem>
                  <SelectItem value="betail-volaille">Bétail & Volaille</SelectItem>
                  <SelectItem value="poissons">Poissons</SelectItem>
                  <SelectItem value="engrais">Engrais & Intrants</SelectItem>
                  <SelectItem value="equipements">Équipements</SelectItem>
                  <SelectItem value="services">Services Agricoles</SelectItem>
                  <SelectItem value="terres">Terres</SelectItem>
                  <SelectItem value="aliments">Aliments Transformés</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="h-12 rounded-xl border-0 bg-gray-50 pl-10 text-base"
                />
              </div>

              {/* Region Select */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="h-12 w-full rounded-xl border-0 bg-gray-50 sm:w-40">
                  <SelectValue placeholder={t('hero.region')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hero.allRegions')}</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-emerald-600 px-8 text-base font-semibold hover:bg-emerald-700 sm:w-auto"
              >
                <Search className="mr-2 h-5 w-5" />
                {t('hero.search')}
              </Button>
            </div>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mx-auto flex max-w-lg justify-center gap-6 sm:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="text-sm text-emerald-200">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CategoriesGrid({ onLoaded }: { onLoaded?: () => void }) {
  const { navigateTo, setFilters } = useAppStore()
  const { t } = useT()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/agryva/categories')
        const json = await res.json()
        if (json.success) setCategories(json.data)
      } catch {
        toast.error(t('common.error'))
      } finally {
        setLoading(false)
        onLoaded?.()
      }
    }
    fetchCategories()
  }, [onLoaded])

  const handleCategoryClick = (slug: string) => {
    setFilters({ category: slug })
    navigateTo('ads')
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('cat.popular')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('cat.browse')}
          </p>
        </div>
        <button
          onClick={() => navigateTo('ads')}
          className="hidden items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:flex"
        >
          {t('cat.seeAll')} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
        >
          {categories.map((cat, i) => {
            const IconComp = getCategoryIcon(cat.icon)
            return (
              <motion.div key={cat.id} variants={fadeUp} custom={i}>
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="text-center text-xs font-medium text-gray-700 group-hover:text-emerald-700 sm:text-sm">
                    {cat.name}
                  </span>
                  {cat.adCount !== undefined && (
                    <span className="text-[10px] text-gray-400">
                      {cat.adCount} {t('cat.ads')}
                    </span>
                  )}
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}

function FeaturedAdsSection({ onLoaded }: { onLoaded?: () => void }) {
  const { navigateTo } = useAppStore()
  const { t } = useT()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/agryva/ads/featured')
        const json = await res.json()
        if (json.success) setAds(json.data)
      } catch {
        toast.error(t('common.error'))
      } finally {
        setLoading(false)
        onLoaded?.()
      }
    }
    fetchFeatured()
  }, [onLoaded])

  const typeLabels: Record<string, string> = {
    OFFER: t('ad.offer'),
    DEMAND: t('ad.demand'),
    SERVICE: t('ad.service'),
  }

  const typeColors: Record<string, string> = {
    OFFER: 'bg-emerald-100 text-emerald-700',
    DEMAND: 'bg-blue-100 text-blue-700',
    SERVICE: 'bg-purple-100 text-purple-700',
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('ad.featured')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('ad.featuredDesc')}
            </p>
          </div>
          <button
            onClick={() => navigateTo('ads', { featured: true })}
            className="hidden items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:flex"
          >
            {t('ad.seeAll')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="gap-0 overflow-hidden p-0">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-1 h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ads.map((ad, i) => (
              <motion.div key={ad.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
                  onClick={() => navigateTo('ad-detail', { id: ad.id })}
                >
                  {/* Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-50">
                    {ad.images && ad.images.length > 0 && ad.images[0] ? (
                      <Image
                        src={ad.images[0]}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-12 w-12 text-emerald-300" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex gap-1">
                      <Badge
                        className={`text-xs ${typeColors[ad.type] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {typeLabels[ad.type] || ad.type}
                      </Badge>
                      {ad.isUrgent && (
                        <Badge className="bg-red-500 text-xs text-white">
                          <Zap className="mr-1 h-3 w-3" /> {t('ad.urgent')}
                        </Badge>
                      )}
                      {ad.isFeatured && (
                        <Badge className="bg-amber-500 text-xs text-white">
                          <Star className="mr-1 h-3 w-3" /> {t('ad.featuredBadge')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                      {ad.title}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-xs text-gray-500">
                      {ad.description}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        {ad.price !== undefined && ad.price !== null ? (
                          <p className="text-lg font-bold text-emerald-600">
                            {ad.price.toLocaleString('fr-FR')}{' '}
                            <span className="text-xs font-normal text-gray-400">
                              FCFA
                            </span>
                            {ad.priceUnit && (
                              <span className="text-xs font-normal text-gray-400">
                                /{ad.priceUnit}
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-gray-500">
                            {t('ad.priceOnRequest')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {ad.region || ad.city || 'Cameroun'}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigateTo('ads', { featured: true })}
            className="text-emerald-600"
          >
            {t('ad.seeAll')} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function AdBanner() {
  const { t } = useT()
  const [banner, setBanner] = useState<Advertisement | null>(null)

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch('/api/agryva/adspace/?position=BANNER_TOP')
        const json = await res.json()
        if (json.success && json.data && json.data.length > 0) {
          setBanner(json.data[0])
          await fetch(`/api/agryva/adspace/${json.data[0].id}/click`, {
            method: 'POST',
          }).catch(() => {})
        }
      } catch {
        // Silently fail
      }
    }
    fetchBanner()
  }, [])

  if (!banner) return null

  const handleClick = async () => {
    try {
      await fetch(`/api/agryva/adspace/${banner.id}/click`, { method: 'POST' })
    } catch {
      // Silently fail
    }
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl"
        onClick={handleClick}
      >
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            width={1200}
            height={200}
            className="h-40 w-full object-cover sm:h-52"
          />
        ) : (
          <div className="flex h-40 items-center justify-center bg-gradient-to-r from-emerald-600 to-green-500 sm:h-52">
            <p className="text-lg font-semibold text-white">{banner.title}</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
          {t('ad.ad')}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const { t } = useT()

  const steps = [
    {
      icon: Users,
      title: t('how.step1.title'),
      description: t('how.step1.desc'),
    },
    {
      icon: Search,
      title: t('how.step2.title'),
      description: t('how.step2.desc'),
    },
    {
      icon: Shield,
      title: t('how.step3.title'),
      description: t('how.step3.desc'),
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('how.title')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('how.subtitle')}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="relative text-center"
          >
            {i < steps.length - 1 && (
              <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-emerald-200 sm:block" />
            )}

            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <step.icon className="h-10 w-10" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function PremiumCTASection() {
  const { navigateTo } = useAppStore()
  const { t } = useT()

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 p-8 text-white sm:p-12"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/30" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-green-500/20" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-300">
              <Crown className="h-4 w-4" />
              {t('premium.badge')}
            </div>
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              {t('premium.title')}
            </h2>
            <p className="mb-4 max-w-xl text-emerald-100">
              {t('premium.desc')}
            </p>
            <ul className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                t('premium.feature1'),
                t('premium.feature2'),
                t('premium.feature3'),
                t('premium.feature4'),
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0">
            <Button
              size="lg"
              onClick={() => navigateTo('pricing')}
              className="h-14 rounded-xl bg-white px-8 text-base font-bold text-emerald-700 shadow-lg hover:bg-gray-50"
            >
              <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
              {t('premium.cta')}
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ==================== QUICK ACCESS SECTION ====================
function QuickAccessSection() {
  const { navigateTo, currentUser } = useAppStore()
  const { t } = useT()

  const actions = [
    { key: 'quick.sell', label: t('quick.sell'), icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white', page: 'create-ad' },
    { key: 'quick.buy', label: t('quick.buy'), icon: Handshake, color: 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white', page: 'ads' },
    { key: 'quick.services', label: t('quick.services'), icon: Briefcase, color: 'bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white', page: 'ads' as const, filterType: 'SERVICE' },
    { key: 'quick.jobs', label: t('quick.jobs'), icon: Users, color: 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white', page: 'ads' as const },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
      >
        {actions.map((action) => (
          <motion.button
            key={action.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (action.page === 'create-ad' && !currentUser) {
                navigateTo('login')
                return
              }
              navigateTo(action.page, action.filterType ? { type: action.filterType } : undefined)
            }}
            className="flex flex-col items-center gap-3"
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 shadow-md ${action.color}`}>
              <action.icon className="h-7 w-7" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}

// ==================== NEW ADS SECTION ====================
function NewAdsSection({ onLoaded }: { onLoaded?: () => void }) {
  const { navigateTo } = useAppStore()
  const { t } = useT()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNewAds() {
      try {
        const res = await fetch('/api/agryva/search/?limit=4&sort=recent')
        const json = await res.json()
        if (json.success) setAds(json.data || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
        onLoaded?.()
      }
    }
    fetchNewAds()
  }, [onLoaded])

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('ad.newAds')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('ad.newAdsDesc')}</p>
          </div>
          <button
            onClick={() => navigateTo('ads')}
            className="hidden items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:flex"
          >
            {t('cat.seeAll')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="gap-0 overflow-hidden p-0">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-3">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {ads.slice(0, 4).map((ad, i) => (
              <motion.div key={ad.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
                  onClick={() => navigateTo('ad-detail', { id: ad.id })}
                >
                  <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-green-50">
                    {ad.images && ad.images.length > 0 && ad.images[0] ? (
                      <Image src={ad.images[0]} alt={ad.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-10 w-10 text-emerald-300" />
                      </div>
                    )}
                    <Badge className="absolute right-2 top-2 bg-orange-500 text-white border-0 text-[10px]">
                      {t('ad.new')}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">{ad.title}</h3>
                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      {ad.price != null ? `${ad.price.toLocaleString('fr-FR')} FCFA` : t('ad.priceOnRequest')}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {ad.region || ad.city || 'Cameroun'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ==================== POPULAR ADS SECTION ====================
function PopularAdsSection({ onLoaded }: { onLoaded?: () => void }) {
  const { navigateTo } = useAppStore()
  const { t } = useT()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPopularAds() {
      try {
        const res = await fetch('/api/agryva/search/?limit=12')
        const json = await res.json()
        if (json.success) {
          const sorted = [...(json.data || [])].sort((a: Ad, b: Ad) => (b.viewsCount || 0) - (a.viewsCount || 0))
          setAds(sorted.slice(0, 4))
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
        onLoaded?.()
      }
    }
    fetchPopularAds()
  }, [onLoaded])

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('ad.popularAds')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('ad.popularAdsDesc')}</p>
          </div>
          <button
            onClick={() => navigateTo('ads')}
            className="hidden items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 sm:flex"
          >
            {t('cat.seeAll')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="gap-0 overflow-hidden p-0">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-3">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {ads.map((ad, i) => (
              <motion.div key={ad.id} variants={fadeUp} custom={i}>
                <Card
                  className="group cursor-pointer gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
                  onClick={() => navigateTo('ad-detail', { id: ad.id })}
                >
                  <div className="relative h-40 bg-gradient-to-br from-orange-100 to-amber-50">
                    {ad.images && ad.images.length > 0 && ad.images[0] ? (
                      <Image src={ad.images[0]} alt={ad.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Eye className="h-10 w-10 text-orange-300" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                      <Eye className="h-3 w-3" />
                      {ad.viewsCount || 0}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">{ad.title}</h3>
                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      {ad.price != null ? `${ad.price.toLocaleString('fr-FR')} FCFA` : t('ad.priceOnRequest')}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {ad.region || ad.city || 'Cameroun'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ==================== TRUST INDICATORS SECTION ====================
function TrustIndicatorsSection() {
  const { t } = useT()

  const indicators = [
    { icon: Users, text: t('trust.farmers'), color: 'text-emerald-600' },
    { icon: Shield, text: t('trust.secure'), color: 'text-orange-500' },
    { icon: CheckCircle2, text: t('trust.support'), color: 'text-emerald-600' },
  ]

  return (
    <section className="border-y border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {indicators.map((item) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 sm:text-base">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ==================== MAIN HOMEPAGE ====================
export function HomePage() {
  const { setHomeDataReady } = useAppStore()
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [featuredLoaded, setFeaturedLoaded] = useState(false)
  const [newAdsLoaded, setNewAdsLoaded] = useState(false)
  const [popularLoaded, setPopularLoaded] = useState(false)

  // Signal splash loader when all main data is loaded
  useEffect(() => {
    if (categoriesLoaded && featuredLoaded && newAdsLoaded && popularLoaded) {
      setHomeDataReady(true)
    }
  }, [categoriesLoaded, featuredLoaded, newAdsLoaded, popularLoaded, setHomeDataReady])

  return (
    <div>
      <HeroSection />
      <QuickAccessSection />
      <CategoriesGrid onLoaded={() => setCategoriesLoaded(true)} />
      <FeaturedAdsSection onLoaded={() => setFeaturedLoaded(true)} />
      <NewAdsSection onLoaded={() => setNewAdsLoaded(true)} />
      <PopularAdsSection onLoaded={() => setPopularLoaded(true)} />
      <TrustIndicatorsSection />
      <AdBanner />
      <HowItWorksSection />
      <PremiumCTASection />
    </div>
  )
}