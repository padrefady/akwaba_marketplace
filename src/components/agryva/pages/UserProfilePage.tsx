'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type Ad } from '../store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  MessageCircle,
  Shield,
  Crown,
  Eye,
  Calendar,
  Package,
  BadgeCheck,
  Circle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'

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

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: fr })
  } catch {
    return dateStr
  }
}

function getTypeGradient(type: string) {
  switch (type) {
    case 'OFFER': return 'from-emerald-400 to-green-600'
    case 'DEMAND': return 'from-orange-400 to-amber-600'
    case 'SERVICE': return 'from-purple-400 to-violet-600'
    default: return 'from-gray-400 to-gray-600'
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'OFFER': return <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">Offre</Badge>
    case 'DEMAND': return <Badge className="bg-orange-100 text-orange-800 border-0 text-xs">Demande</Badge>
    case 'SERVICE': return <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">Service</Badge>
    default: return <Badge variant="secondary" className="text-xs">{type}</Badge>
  }
}

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

const PLAN_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: typeof Crown }> = {
  FREE: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Standard', icon: Circle },
  PREMIUM: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', label: 'Premium', icon: Crown },
  VIP: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'VIP', icon: Crown },
}

export default function UserProfilePage() {
  const { pageParams, navigateTo, currentUser } = useAppStore()
  const userId = pageParams?.userId as string

  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contacting, setContacting] = useState(false)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (!userId) return

    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await fetch(`/api/agryva/user?userId=${userId}`)
        const json = await res.json()
        if (json.success) {
          setUser(json.data)
          setAds(json.data.ads || [])
          setReviews(json.data.reviews || [])
        } else {
          toast.error('Utilisateur introuvable')
          navigateTo('home')
        }
      } catch {
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, navigateTo])

  async function handleContact() {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour contacter ce vendeur')
      navigateTo('login')
      return
    }
    if (!ads.length || !userId) return

    setContacting(true)
    try {
      const res = await fetch('/api/agryva/messages/conversation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          otherUserId: userId,
          adId: ads[0].id,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Conversation créée !')
        navigateTo('messages', { conversationId: json.data.id })
      } else {
        toast.error(json.error || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setContacting(false)
    }
  }

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-40 mb-8" />
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-28 h-28 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const plan = user.plan || 'FREE'
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE
  const PlanIcon = planConfig.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <button
          onClick={() => navigateTo('ads')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </button>

        {/* Profile Header Card */}
        <Card className="border-0 shadow-sm overflow-hidden mb-8">
          {/* Banner gradient */}
          <div className={`h-28 md:h-36 bg-gradient-to-r ${
            plan === 'VIP' ? 'from-amber-400 via-yellow-500 to-orange-400' :
            plan === 'PREMIUM' ? 'from-emerald-400 via-teal-500 to-cyan-400' :
            'from-emerald-500 via-green-500 to-teal-400'
          } relative`}>
            {/* Avatar overlap */}
            <div className="absolute -bottom-14 left-6 md:left-8">
              <div className="relative">
                <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                  user.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>
          </div>

          <CardContent className="pt-18 pb-6 px-6 md:px-8">
            <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* User info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                  {user.isVerified && (
                    <BadgeCheck className="h-6 w-6 text-emerald-600" />
                  )}
                  <Badge className={`${planConfig.bgColor} ${planConfig.color} border-0 gap-1`}>
                    <PlanIcon className="h-3 w-3" />
                    {planConfig.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {(user.region || user.city) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[user.region, user.city].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Membre depuis {formatDate(user.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Circle className={`h-2.5 w-2.5 ${user.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400 fill-gray-400'}`} />
                    {user.isOnline ? 'En ligne' : `Vu ${formatRelativeTime(user.lastSeen)}`}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-gray-600 leading-relaxed max-w-2xl">{user.bio}</p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-900">{user._count?.ads || 0}</span>
                    <span className="text-sm text-gray-500">annonces</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">{user.avgRating || '—'}</span>
                    <span className="text-sm text-gray-500">({user.totalReviews || 0} avis)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isOwnProfile && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleContact}
                    disabled={contacting}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {contacting ? 'Envoi...' : 'Contacter'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main content: Ads + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Ads */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Annonces ({ads.length})
              </h2>
            </div>

            {ads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune annonce active pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ads.map((ad, index) => {
                  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
                  return (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 group"
                        onClick={() => navigateTo('ad-detail', { id: ad.id, title: ad.title, categorySlug: ad.categorySlug })}
                      >
                        {/* Image */}
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                          {images.length > 0 ? (
                            <img
                              src={images[0]}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getTypeGradient(ad.type)} flex items-center justify-center`}>
                              <span className="text-4xl opacity-30">🌾</span>
                            </div>
                          )}
                          {/* Badges overlay */}
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            {getTypeBadge(ad.type)}
                            {ad.isFeatured && (
                              <Badge className="bg-amber-500 text-white border-0 text-xs shadow">
                                ⭐ Vedette
                              </Badge>
                            )}
                          </div>
                          {/* Views */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white bg-black/50 rounded-full px-2 py-0.5">
                            <Eye className="h-3 w-3" />
                            {ad.viewsCount}
                          </div>
                        </div>

                        {/* Content */}
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-base font-bold text-emerald-700 mb-2">
                            {formatPrice(ad.price, ad.priceUnit)}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[ad.region, ad.city].filter(Boolean).join(', ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(ad.createdAt)}
                            </span>
                          </div>
                          {ad.delivery && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                                🚚 Livraison disponible
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Reviews sidebar */}
          <div className="space-y-6">
            {/* Rating summary */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  Avis ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.avgRating > 0 ? (
                  <div className="space-y-4">
                    {/* Average */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{user.avgRating}</div>
                      <RatingStars rating={user.avgRating} size="md" />
                      <p className="text-sm text-gray-500 mt-1">{user.totalReviews} avis</p>
                    </div>

                    <Separator />

                    {/* Distribution */}
                    <div className="space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r: any) => r.rating === star).length
                        const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3">{star}</span>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-amber-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: star * 0.1 }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Star className="h-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucun avis pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent reviews */}
            {reviews.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Avis récents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                  {reviews.slice(0, 10).map((review: any) => (
                    <div key={review.id} className="space-y-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={review.reviewer?.avatar} />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {review.reviewer?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900">{review.reviewer?.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{formatRelativeTime(review.createdAt)}</span>
                      </div>
                      <RatingStars rating={review.rating} />
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      )}
                      {review.ad && (
                        <button
                          onClick={() => navigateTo('ad-detail', { id: review.ad.id, title: review.ad.title, categorySlug: review.ad.categorySlug })}
                          className="text-xs text-emerald-600 hover:underline line-clamp-1"
                        >
                          Sur : {review.ad.title}
                        </button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Safety tips */}
            {!isOwnProfile && (
              <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2 text-sm">
                    <Shield className="h-4 w-4" />
                    Conseils de sécurité
                  </h3>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Rencontre en lieu public pour les échanges
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Vérifiez le produit avant de payer
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Signalez toute activité suspecte
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
