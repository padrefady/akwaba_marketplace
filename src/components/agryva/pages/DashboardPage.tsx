'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Ad, type Advertisement } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Package,
  Eye,
  MessageCircle,
  Banknote,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Crown,
  ImageIcon,
  Bot,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  Award,
  MapPin,
  Bell,
  ShoppingBag,
  Star,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== HELPERS ====================
function formatPrice(price?: number | null) {
  if (price == null) return '0'
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
}

function formatRelativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      )
    case 'SOLD':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0 text-xs">
          <Package className="h-3 w-3 mr-1" />
          Vendue
        </Badge>
      )
    case 'EXPIRED':
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Expirée
        </Badge>
      )
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

function getTypeGradient(type: string) {
  switch (type) {
    case 'OFFER':
      return 'from-emerald-400 to-green-600'
    case 'DEMAND':
      return 'from-orange-400 to-amber-600'
    case 'SERVICE':
      return 'from-purple-400 to-violet-600'
    default:
      return 'from-gray-400 to-gray-600'
  }
}

// ==================== INTERFACES ====================
interface DashboardStats {
  totalAds: number
  totalViews: number
  unreadMessages: number
  totalRevenue: number
}

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
  data?: Record<string, string>
}

interface DashboardData {
  stats: DashboardStats
  recentAds: Ad[]
  newAds: Ad[]
  activities: ActivityItem[]
}

// ==================== STAT CARD ====================
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  delay,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: 'green' | 'orange'
  delay: number
}) {
  const isGreen = color === 'green'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div
              className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${
                isGreen
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== COMPACT AD CARD ====================
function CompactAdCard({
  ad,
  onClick,
}: {
  ad: Ad
  onClick: () => void
}) {
  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const hasImage = images.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex">
          <div className="w-20 sm:w-24 shrink-0">
            {hasImage ? (
              <img src={images[0]} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className={`w-full h-full min-h-24 bg-gradient-to-br ${getTypeGradient(ad.type)} flex items-center justify-center text-white/60`}
              >
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{ad.title}</h4>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatPrice(ad.price)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {getStatusBadge(ad.status)}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="h-3 w-3" />
                {ad.viewsCount}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

// ==================== ACTIVITY ITEM ====================
function ActivityItem({ activity }: { activity: ActivityItem }) {
  const iconMap: Record<string, React.ElementType> = {
    message: MessageCircle,
    view: Eye,
    transaction: ShoppingBag,
    new_ad: Package,
    review: Star,
    notification: Bell,
  }

  const colorMap: Record<string, string> = {
    message: 'bg-emerald-100 text-emerald-600',
    view: 'bg-orange-100 text-orange-600',
    transaction: 'bg-green-100 text-green-600',
    new_ad: 'bg-blue-100 text-blue-600',
    review: 'bg-amber-100 text-amber-600',
    notification: 'bg-gray-100 text-gray-600',
  }

  const Icon = iconMap[activity.type] || Bell
  const colorClass = colorMap[activity.type] || 'bg-gray-100 text-gray-600'

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 line-clamp-2">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
      </div>
    </div>
  )
}

// ==================== RECOMMENDATION CARD ====================
function RecommendationCard({
  ad,
  onClick,
}: {
  ad: Ad
  onClick: () => void
}) {
  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const hasImage = images.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="overflow-hidden border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-emerald-50/30"
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <img src={images[0]} alt={ad.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-green-500 flex items-center justify-center text-white/60">
              <Sparkles className="h-8 w-8" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-emerald-600 text-white border-0 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommandé
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{ad.title}</h4>
          <p className="text-sm font-bold text-emerald-700 mt-1">{formatPrice(ad.price)}</p>
          {(ad.region || ad.city) && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[ad.region, ad.city].filter(Boolean).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== SKELETONS ====================
function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SkeletonSection() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-gray-200">
            <div className="flex">
              <Skeleton className="w-24 shrink-0 min-h-24" />
              <div className="flex-1 p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== MAIN DASHBOARD PAGE ====================
export default function DashboardPage() {
  const { currentUser, navigateTo } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recommendations, setRecommendations] = useState<Ad[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [sidebarAd, setSidebarAd] = useState<Advertisement | null>(null)

  const isVip = currentUser?.plan === 'VIP'
  const isPremium = currentUser?.plan === 'PREMIUM'
  const isPaidUser = isVip || isPremium

  const fetchDashboard = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/agryva/dashboard/?userId=${currentUser.id}`)
      const json = await res.json()
      if (json.success) {
        setDashboardData(json.data)
      }
    } catch {
      toast.error('Erreur lors du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  const fetchRecommendations = useCallback(async () => {
    if (!currentUser || !isVip) return
    setLoadingRecommendations(true)
    try {
      const res = await fetch('/api/agryva/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      const json = await res.json()
      if (json.success) {
        setRecommendations(json.data || [])
      }
    } catch {
      // Silently fail for recommendations
    } finally {
      setLoadingRecommendations(false)
    }
  }, [currentUser, isVip])

  const fetchSidebarAd = useCallback(async () => {
    if (!currentUser || isPaidUser) return
    try {
      const res = await fetch('/api/agryva/adspace/?position=SIDEBAR')
      const json = await res.json()
      if (json.success && json.data) {
        setSidebarAd(json.data)
      }
    } catch {
      // Silently fail
    }
  }, [currentUser, isPaidUser])

  useEffect(() => {
    if (!currentUser) {
      navigateTo('login')
      return
    }
    fetchDashboard()
    fetchSidebarAd()
  }, [currentUser, navigateTo, fetchDashboard, fetchSidebarAd])

  useEffect(() => {
    if (isVip) {
      fetchRecommendations()
    }
  }, [isVip, fetchRecommendations])

  if (!currentUser) return null

  const stats = dashboardData?.stats || { totalAds: 0, totalViews: 0, unreadMessages: 0, totalRevenue: 0 }
  const recentAds = dashboardData?.recentAds || []
  const newAds = dashboardData?.newAds || []
  const activities = dashboardData?.activities || []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Tableau de bord
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Bienvenue, {currentUser.name} 👋
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isVip && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
              {isPremium && !isVip && (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {loading ? (
          <SkeletonStatCards />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Mes annonces"
              value={stats.totalAds.toString()}
              icon={Package}
              color="green"
              delay={0}
            />
            <StatCard
              title="Vues totales"
              value={stats.totalViews.toString()}
              icon={Eye}
              color="orange"
              delay={0.05}
            />
            <StatCard
              title="Messages"
              value={stats.unreadMessages.toString()}
              icon={MessageCircle}
              color="green"
              delay={0.1}
            />
            <StatCard
              title="Revenus"
              value={formatPrice(stats.totalRevenue)}
              icon={Banknote}
              color="orange"
              delay={0.15}
            />
          </div>
        )}

        {/* Ad Space Usage Indicator (FREE users only) */}
        {!loading && !isPaidUser && stats.totalAds !== undefined && (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Espace publicitaire
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700">
                {stats.totalAds}/2 annonce(s)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-emerald-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min((stats.totalAds / 2) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-emerald-600">
                {stats.totalAds < 2
                  ? `Il vous reste ${2 - stats.totalAds} annonce(s) gratuite(s).`
                  : 'Limite atteinte ! Passez à un plan supérieur.'
                }
              </p>
              {stats.totalAds >= 2 && (
                <button
                  onClick={() => navigateTo('pricing')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Passer Premium →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Ads */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Annonces récentes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                  onClick={() => navigateTo('my-ads')}
                >
                  Voir toutes mes annonces
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {loading ? (
                <SkeletonSection />
              ) : recentAds.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aucune annonce pour le moment</p>
                    <Button
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-sm"
                      onClick={() => navigateTo('create-ad')}
                    >
                      Créer ma première annonce
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {recentAds.slice(0, 5).map((ad) => (
                      <CompactAdCard
                        key={ad.id}
                        ad={ad}
                        onClick={() => navigateTo('ad-detail', { id: ad.id })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* Recommendations (VIP only) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Recommandations pour vous
                  {isVip && (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 text-xs">
                      <Crown className="h-3 w-3 mr-0.5" /> VIP
                    </Badge>
                  )}
                </h2>
              </div>

              {!isVip ? (
                <Card className="border-2 border-dashed border-amber-200 bg-amber-50/30">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Crown className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Recommandations IA
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                      Passez au plan VIP pour obtenir des recommandations personnalisées basées sur vos préférences et votre historique.
                    </p>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => navigateTo('pricing')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Obtenir des recommandations IA
                    </Button>
                  </CardContent>
                </Card>
              ) : loadingRecommendations ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <CardContent className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Bot className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Aucune recommandation disponible pour le moment. Continuez à parcourir les annonces pour affiner vos préférences.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {recommendations.slice(0, 4).map((ad) => (
                      <RecommendationCard
                        key={ad.id}
                        ad={ad}
                        onClick={() => navigateTo('ad-detail', { id: ad.id })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* New Ads */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Nouvelles annonces
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                  onClick={() => navigateTo('ads')}
                >
                  Voir toutes les annonces
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {loading ? (
                <SkeletonSection />
              ) : newAds.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Aucune nouvelle annonce depuis votre dernière visite.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {newAds.slice(0, 5).map((ad) => (
                      <CompactAdCard
                        key={ad.id}
                        ad={ad}
                        onClick={() => navigateTo('ad-detail', { id: ad.id })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <section>
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune activité récente</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {activities.slice(0, 8).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Sidebar Ad Space (FREE users only) */}
            {!isPaidUser && sidebarAd && (
              <section>
                <Card className="border-0 overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    {sidebarAd.imageUrl ? (
                      <a
                        href={sidebarAd.linkUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          // Track click in background
                          fetch(`/api/agryva/adspace/${sidebarAd.id}/click`, { method: 'POST' }).catch(() => {})
                        }}
                      >
                        <img
                          src={sidebarAd.imageUrl}
                          alt={sidebarAd.title}
                          className="w-full h-auto"
                        />
                      </a>
                    ) : (
                      <div className="bg-gradient-to-br from-emerald-100 to-orange-100 p-6 text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">{sidebarAd.title}</p>
                        <p className="text-xs text-gray-400 mt-1">Espace publicitaire</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Quick Actions */}
            <section>
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                    onClick={() => navigateTo('create-ad')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Publier une annonce
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    onClick={() => navigateTo('messages')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mes messages
                    {stats.unreadMessages > 0 && (
                      <Badge className="ml-auto bg-emerald-600 text-white border-0 text-xs">
                        {stats.unreadMessages}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    onClick={() => navigateTo('favorites')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Mes favoris
                  </Button>
                  {isVip && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => navigateTo('ai-assistant')}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Assistant IA
                    </Button>
                  )}
                  {!isPaidUser && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                      onClick={() => navigateTo('pricing')}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Passer à Premium/VIP
                    </Button>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
