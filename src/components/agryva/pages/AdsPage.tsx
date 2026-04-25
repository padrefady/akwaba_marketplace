'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Category, type Ad } from '../store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Eye,
  Star,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Wheat,
  Apple,
  Fish,
  Tractor,
  TreePine,
  Bean,
  Carrot,
  FlaskConical,
  Wrench,
  MapPinIcon,
  Package,
  GalleryHorizontalEnd,
  Leaf,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr, en } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '@/lib/i18n'

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest',
  'Sud', 'Est', 'Nord', 'Extrême-Nord', 'Adamaoua',
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Wheat: <Wheat className="h-8 w-8" />,
  Apple: <Apple className="h-8 w-8" />,
  Fish: <Fish className="h-8 w-8" />,
  Tractor: <Tractor className="h-8 w-8" />,
  TreePine: <TreePine className="h-8 w-8" />,
  Bean: <Bean className="h-8 w-8" />,
  Carrot: <Carrot className="h-8 w-8" />,
  FlaskConical: <FlaskConical className="h-8 w-8" />,
  Wrench: <Wrench className="h-8 w-8" />,
  MapPin: <MapPinIcon className="h-8 w-8" />,
  Package: <Package className="h-8 w-8" />,
  GalleryHorizontalEnd: <GalleryHorizontalEnd className="h-8 w-8" />,
}

function formatPrice(price?: number | null, unit?: string | null) {
  if (price == null) return 'Prix sur demande'
  const formatted = new Intl.NumberFormat('fr-FR').format(price)
  return `${formatted} FCFA${unit ? ` / ${unit}` : ''}`
}

function formatRelativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

// ==================== AD CARD ====================
function AdCard({ ad, onClick }: { ad: Ad; onClick: () => void }) {
  const { favoriteIds, toggleFavorite, currentUser, navigateTo } = useAppStore()
  const { t } = useT()
  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const hasImage = images.length > 0
  const isFavorited = favoriteIds.includes(ad.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUser) {
      toast.error(t('ads.loginRequired'))
      navigateTo('login')
      return
    }
    toggleFavorite(ad.id)
    toast.success(isFavorited ? t('ads.removedFavorite') : t('ads.addedFavorite'))
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <img
            src={images[0]}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
            <Leaf className="h-12 w-12" />
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {ad.type === 'OFFER' && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">{t('ad.offer')}</Badge>
          )}
          {ad.type === 'DEMAND' && (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0">{t('ad.demand')}</Badge>
          )}
          {ad.type === 'SERVICE' && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">{t('ad.service')}</Badge>
          )}
          {ad.isUrgent && (
            <Badge className="bg-red-500 text-white hover:bg-red-600 border-0 text-xs">
              <Zap className="h-3 w-3 mr-1" /> {t('ad.urgent')}
            </Badge>
          )}
        </div>
        {ad.isFeatured && (
          <div className="absolute top-2 right-8">
            <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 text-xs">
              <Award className="h-3 w-3 mr-1" /> {t('ad.featuredBadge')}
            </Badge>
          </div>
        )}
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all hover:bg-white hover:scale-110"
          title={isFavorited ? t('ads.removeFavorite') : t('ads.addFavorite')}
        >
          <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
          {ad.title}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-emerald-700 mb-2">
          {ad.price != null ? formatPrice(ad.price, ad.priceUnit) : t('ad.priceOnRequest')}
        </p>

        {/* Location & Time */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {(ad.region || ad.city) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[ad.region, ad.city].filter(Boolean).join(', ')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(ad.createdAt)}
          </span>
        </div>

        {/* Author & views */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {t('ads.by')} <span className="font-medium text-gray-700">{ad.author?.name || t('ads.anonymous')}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="h-3 w-3" />
            {ad.viewsCount}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== SKELETON CARD ====================
function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== MAIN ADS PAGE ====================
export default function AdsPage() {
  const { navigateTo, searchQuery, filters, setFilters, resetFilters, pageParams } = useAppStore()
  const { t } = useT()

  const isFeaturedMode = pageParams?.featured === true

  const [ads, setAds] = useState<Ad[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('recent')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const limit = 12

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/agryva/categories/')
        const json = await res.json()
        if (json.success) setCategories(json.data)
      } catch {
        toast.error(t('ads.errorCategories'))
      }
    }
    fetchCategories()
  }, [])

  // Fetch ads
  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      if (isFeaturedMode) {
        // In featured mode, fetch from the featured API
        const res = await fetch('/api/agryva/ads/featured')
        const json = await res.json()
        if (json.success) {
          let data = json.data || []
          if (sortBy === 'popular') {
            data = [...data].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
          }
          if (sortBy === 'price-asc') {
            data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0))
          } else if (sortBy === 'price-desc') {
            data = [...data].sort((a, b) => (b.price || 0) - (a.price || 0))
          }
          setAds(data)
          setTotalResults(data.length)
          setTotalPages(1)
        }
      } else {
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (filters.type) params.set('type', filters.type)
        if (filters.category) params.set('category', filters.category)
        if (filters.region) params.set('region', filters.region)
        if (filters.minPrice) params.set('minPrice', filters.minPrice)
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
        params.set('page', currentPageNum.toString())
        params.set('limit', limit.toString())

        const res = await fetch(`/api/agryva/search/?${params.toString()}`)
        const json = await res.json()
        if (json.success) {
          let data = json.data || []
          if (sortBy === 'popular') {
            data = [...data].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
          }
          if (sortBy === 'price-asc') {
            data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0))
          } else if (sortBy === 'price-desc') {
            data = [...data].sort((a, b) => (b.price || 0) - (a.price || 0))
          }
          setAds(data)
          setTotalResults(json.count || 0)
          setTotalPages(json.totalPages || 0)
        }
      }
    } catch {
      toast.error(t('ads.errorAds'))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters, currentPageNum, sortBy, limit, isFeaturedMode])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPageNum(1)
  }, [searchQuery, filters, sortBy])

  function handleFilterChange(key: string, value: string) {
    setFilters({ [key]: value })
  }

  function handleResetFilters() {
    resetFilters()
    setCurrentPageNum(1)
  }

  function handleAdClick(ad: Ad) {
    navigateTo('ad-detail', { id: ad.id })
  }

  const activeFilterCount = [
    filters.type, filters.category, filters.region, filters.minPrice, filters.maxPrice
  ].filter(Boolean).length

  // ==================== FILTER SIDEBAR ====================
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Type filter */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">{t('ads.type')}</h3>
        <Tabs
          value={filters.type || 'all'}
          onValueChange={(v) => handleFilterChange('type', v === 'all' ? '' : v)}
        >
          <TabsList className="w-full bg-gray-100">
            <TabsTrigger value="all" className="flex-1 text-xs">{t('ads.all')}</TabsTrigger>
            <TabsTrigger value="OFFER" className="flex-1 text-xs">{t('ad.offer')}</TabsTrigger>
            <TabsTrigger value="DEMAND" className="flex-1 text-xs">{t('ad.demand')}</TabsTrigger>
            <TabsTrigger value="SERVICE" className="flex-1 text-xs">{t('ad.service')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {/* Category filter */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">{t('ads.category')}</h3>
        <Select
          value={filters.category || '_all'}
          onValueChange={(v) => handleFilterChange('category', v === '_all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('ads.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('ads.allCategories')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Region filter */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">{t('ads.region')}</h3>
        <Select
          value={filters.region || '_all'}
          onValueChange={(v) => handleFilterChange('region', v === '_all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('ads.allRegions')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('ads.allRegions')}</SelectItem>
            {CAMEROON_REGIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">{t('ads.price')}</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={t('ads.min')}
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="h-9 text-sm"
          />
          <span className="text-gray-400">—</span>
          <Input
            type="number"
            placeholder={t('ads.max')}
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Reset button */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          onClick={handleResetFilters}
        >
          <X className="h-4 w-4 mr-2" />
          {t('ads.reset')} ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {isFeaturedMode ? t('ads.featuredTitle') : t('ads.title')}
          </h1>
          <p className="text-emerald-100 text-sm md:text-base">
            {isFeaturedMode ? t('ads.featuredSubtitle') : t('ads.subtitle')}
          </p>

          {/* Search bar (only in non-featured mode) */}
          {!isFeaturedMode && (
            <div className="mt-6 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('ads.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setFilters({ type: '', category: '', region: '', minPrice: '', maxPrice: '' })}
                  className="pl-10 h-12 bg-white rounded-lg shadow-lg border-0 text-base"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top bar: mobile filter button + sort + result count */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('ads.filters')}
                  {activeFilterCount > 0 && (
                    <span className="ml-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t('ads.filters')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{totalResults}</span>{' '}
              {totalResults > 1 ? t('ads.results') : t('ads.result')}
            </p>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('ads.sortRecent')}</SelectItem>
              <SelectItem value="price-asc">{t('ads.sortPriceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('ads.sortPriceDesc')}</SelectItem>
              <SelectItem value="popular">{t('ads.sortPopular')}</SelectItem>
              <SelectItem value="nearby">{t('ads.sortNearby')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.type && (
              <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                {filters.type === 'OFFER' ? t('ad.offer') : filters.type === 'DEMAND' ? t('ad.demand') : t('ad.service')}
                <button onClick={() => handleFilterChange('type', '')} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                {categories.find(c => c.slug === filters.category)?.name || filters.category}
                <button onClick={() => handleFilterChange('category', '')} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.region && (
              <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.region}
                <button onClick={() => handleFilterChange('region', '')} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4 bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                {t('ads.filters')}
              </h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Ad grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : ads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('ads.noResults')}
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  {t('ads.noResultsDesc')}
                </p>
                <Button
                  variant="outline"
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 mr-2"
                  onClick={handleResetFilters}
                >
                  {t('ads.resetFilters')}
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600"
                  onClick={() => navigateTo('home')}
                >
                  {t('ads.backHome')}
                </Button>
                {/* Category suggestions */}
                {categories.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm text-gray-500 mb-3">{t('ads.browseCategory')}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => handleFilterChange('category', cat.slug)}
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {ads.map((ad) => (
                      <motion.div
                        key={ad.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AdCard ad={ad} onClick={() => handleAdClick(ad)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPageNum <= 1}
                      onClick={() => setCurrentPageNum((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('ads.previous')}
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPageNum) <= 1)
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                            acc.push('...')
                          }
                          acc.push(p)
                          return acc
                        }, [])
                        .map((item, idx) =>
                          typeof item === 'string' ? (
                            <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <Button
                              key={item}
                              variant={currentPageNum === item ? 'default' : 'outline'}
                              size="sm"
                              className={
                                currentPageNum === item
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'min-w-8 h-8'
                              }
                              onClick={() => setCurrentPageNum(item)}
                            >
                              {item}
                            </Button>
                          )
                        )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPageNum >= totalPages}
                      onClick={() => setCurrentPageNum((p) => p + 1)}
                    >
                      {t('ads.next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
