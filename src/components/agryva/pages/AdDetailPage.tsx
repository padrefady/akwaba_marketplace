'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type Ad, type Category, type Advertisement } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  MapPin,
  Clock,
  Eye,
  Star,
  Zap,
  Award,
  ChevronLeft,
  Home,
  MessageCircle,
  ShoppingCart,
  Shield,
  Phone,
  Truck,
  Tag,
  Share2,
  Heart,
  ChevronRight,
  AlertTriangle,
  Link as LinkIcon,
  Check,
  Languages,
} from 'lucide-react'
import { useT } from '@/lib/i18n'
import { LanguageSelector } from '@/components/agryva/common/LanguageSelector'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

function getTypeBadge(type: string, t: (key: string) => string) {
  switch (type) {
    case 'OFFER':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">{t('ad.offer')}</Badge>
    case 'DEMAND':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0">{t('ad.demand')}</Badge>
    case 'SERVICE':
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">{t('ad.service')}</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
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

function getConditionLabel(condition?: string | null) {
  switch (condition) {
    case 'NEW': return 'Nouveau'
    case 'USED': return 'Usagé'
    case 'FRESH': return 'Frais'
    case 'PROCESSED': return 'Transformé'
    default: return condition || 'Non spécifié'
  }
}

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
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

// ==================== IMAGE GALLERY ====================
function ImageGallery({ images, title, type }: { images: string[]; title: string; type: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const hasImages = images.length > 0

  if (!hasImages) {
    return (
      <div className={`aspect-[16/10] md:aspect-[16/9] bg-gradient-to-br ${getTypeGradient(type)} rounded-xl flex items-center justify-center text-white`}>
        <span className="text-6xl opacity-30">🌾</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
        <img
          src={images[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-emerald-600 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img src={img} alt={`${title} - Miniature ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== REVIEW FORM ====================
function ReviewForm({
  adId,
  authorId,
  currentUser,
  onSubmitted,
}: {
  adId: string
  authorId: string
  currentUser: ReturnType<typeof useAppStore>['currentUser']
  onSubmitted: () => void
}) {
  const { t } = useT()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!currentUser || currentUser.id === authorId) return null

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/agryva/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          reviewerId: currentUser.id,
          reviewedId: authorId,
          rating,
          comment: comment.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Avis publié avec succès !')
        setRating(0)
        setComment('')
        onSubmitted()
      } else {
        toast.error(json.error || 'Erreur lors de la publication')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base">{t('detail.leaveReview')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('detail.yourRating')}</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)}>
                <Star
                  className={`h-8 w-8 transition-colors ${
                    i < (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 hover:text-amber-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <Textarea
          placeholder={t('detail.shareExperience')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
        >
          {submitting ? 'Publication...' : t('detail.publishReview')}
        </Button>
      </CardContent>
    </Card>
  )
}

// ==================== MAIN DETAIL PAGE ====================
export default function AdDetailPage() {
  const { t } = useT()
  const { pageParams, navigateTo, currentUser, favoriteIds, toggleFavorite, translationResult, setTranslationResult } = useAppStore()
  const adId = pageParams?.id as string

  const [ad, setAd] = useState<(Ad & { avgRating?: number; reviews?: any[]; category?: Category }) | null>(null)
  const [similarAds, setSimilarAds] = useState<Ad[]>([])
  const [adspaceBanner, setAdspaceBanner] = useState<Advertisement | null>(null)
  const [loading, setLoading] = useState(true)
  const [contacting, setContacting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const isFavorited = ad ? favoriteIds.includes(ad.id) : false

  const handleToggleFavorite = () => {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour ajouter aux favoris')
      navigateTo('login')
      return
    }
    if (!ad) return
    toggleFavorite(ad.id)
    toast.success(isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris')
  }

  const adUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = ad ? `Découvrez: ${ad.title} - agryva` : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(adUrl)
      setLinkCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  // Clear translation when leaving ad detail
  useEffect(() => {
    return () => {
      setTranslationResult(null)
    }
  }, [setTranslationResult])

  useEffect(() => {
    if (!adId) return

    async function fetchAd() {
      setLoading(true)
      try {
        const res = await fetch(`/api/agryva/ads/${adId}`)
        const json = await res.json()
        if (json.success) {
          setAd(json.data)
        } else {
          toast.error('Annonce introuvable')
          navigateTo('ads')
        }
      } catch {
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [adId, navigateTo])

  // Fetch similar ads when ad data loads
  useEffect(() => {
    if (!ad?.categorySlug || !ad?.id) return

    async function fetchSimilar() {
      try {
        const params = new URLSearchParams()
        params.set('category', ad.categorySlug)
        params.set('limit', '4')
        const res = await fetch(`/api/agryva/search/?${params.toString()}`)
        const json = await res.json()
        if (json.success) {
          setSimilarAds(json.data.filter((a: Ad) => a.id !== ad.id).slice(0, 4))
        }
      } catch { /* ignore */ }
    }
    fetchSimilar()
  }, [ad?.categorySlug, ad?.id])

  // Fetch adspace banner
  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch('/api/agryva/adspace/?position=SIDEBAR')
        const json = await res.json()
        if (json.success && json.data.length > 0) {
          setAdspaceBanner(json.data[0])
        }
      } catch { /* ignore */ }
    }
    fetchBanner()
  }, [])

  // Translation handler for LanguageSelector
  function handleTranslated(result: { translatedText: string; translatedTitle: string; translatedDescription: string; language: string }) {
    setTranslationResult({
      title: result.translatedTitle || ad?.title || '',
      description: result.translatedDescription || result.translatedText || '',
      language: result.language,
      show: true,
    })
  }

  const showTranslation = translationResult?.show === true

  async function handleContact() {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour contacter le vendeur')
      navigateTo('login')
      return
    }
    if (!ad) return

    setContacting(true)
    try {
      const res = await fetch('/api/agryva/messages/conversation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          otherUserId: ad.authorId,
          adId: ad.id,
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

  function handleBuyNow() {
    if (!currentUser) {
      toast.error('Veuillez vous connecter')
      navigateTo('login')
      return
    }
    if (!ad) return
    navigateTo('payment', { adId: ad.id, sellerId: ad.authorId })
  }

  // Loading skeleton
  if (loading || !ad) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Skeleton className="h-6 w-96 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-60 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const tags = typeof ad.tags === 'string' ? JSON.parse(ad.tags || '[]') : (ad.tags || [])
  const reviews = ad.reviews || []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={() => navigateTo('home')} className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-4 w-4" />
            {t('nav.home')}
          </button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigateTo('ads')} className="hover:text-emerald-700">
            {t('nav.ads')}
          </button>
          {ad.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-700">{ad.category.name}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium truncate max-w-xs">{ad.title}</span>
        </nav>

        {/* Back button mobile */}
        <button
          onClick={() => navigateTo('ads')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 mb-4 lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('detail.backToAds')}
        </button>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorite button - top right overlay on gallery */}
            <div className="relative">
              <ImageGallery images={images} title={ad.title} type={ad.type} />
              <button
                onClick={handleToggleFavorite}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:bg-white hover:scale-110"
                title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Title + Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getTypeBadge(ad.type, t)}
                {ad.isUrgent && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600 border-0">
                    <Zap className="h-3 w-3 mr-1" /> {t('ad.urgent')}
                  </Badge>
                )}
                {ad.isFeatured && (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0">
                    <Award className="h-3 w-3 mr-1" /> {t('ad.featuredBadge')}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>

              {/* Price */}
              <p className="text-2xl md:text-3xl font-bold text-emerald-700">
                {formatPrice(ad.price, ad.priceUnit)}
                {ad.negociable && (
                  <span className="text-sm font-normal text-gray-500 ml-3">({t('common.negociable')})</span>
                )}
              </p>
            </div>

            {/* Details Grid */}
            <Card className="border-gray-200">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ad.region && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t('detail.region')}</p>
                        <p className="text-sm font-medium">{ad.region}</p>
                      </div>
                    </div>
                  )}
                  {ad.city && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t('detail.city')}</p>
                        <p className="text-sm font-medium">{ad.city}</p>
                      </div>
                    </div>
                  )}
                  {ad.condition && ad.type !== 'SERVICE' && (
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t('detail.condition')}</p>
                        <p className="text-sm font-medium">{getConditionLabel(ad.condition)}</p>
                      </div>
                    </div>
                  )}
                  {ad.quantity && (
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t('detail.quantity')}</p>
                        <p className="text-sm font-medium">{ad.quantity}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{t('detail.delivery')}</p>
                      <p className="text-sm font-medium">{ad.delivery ? t('detail.available') : t('detail.notAvailable')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{t('detail.published')}</p>
                      <p className="text-sm font-medium">{formatDate(ad.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card id="description-card" className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg">{t('detail.description')}</CardTitle>
                  <LanguageSelector
                    variant="default"
                    title={ad?.title}
                    description={ad?.description}
                    onTranslated={handleTranslated}
                    triggerLabel={t('detail.translate')}
                    size="default"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ad.description}</p>

                {/* Translation Result - inside the description card */}
                {translationResult && showTranslation && (
                  <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">{t('detail.translationIn')} {translationResult.language}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('detail.translatedTitle')}</p>
                      <p className="font-semibold text-gray-900">{translationResult.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('detail.translatedDesc')}</p>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{translationResult.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTranslationResult(null)}
                      className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                    >
                      {t('detail.hideTranslation')}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-gray-600 hover:bg-emerald-50 hover:text-emerald-700">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Author Card */}
            {ad.author && (
              <Card className="border-gray-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={ad.author.avatar} alt={ad.author.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-semibold">
                          {ad.author.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{ad.author.name}</h3>
                          {ad.author.isVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                              Vérifié
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          {(ad.author.region || ad.author.city) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[ad.author.region, ad.author.city].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {ad.author.createdAt && (
                            <span>Membre depuis {formatDate(ad.author.createdAt)}</span>
                          )}
                        </div>
                        {ad.avgRating != null && ad.avgRating > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <RatingStars rating={ad.avgRating} />
                            <span className="text-sm text-gray-500">({reviews.length} {t('detail.reviews')})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleContact}
                        disabled={contacting}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {contacting ? 'Envoi...' : 'Contacter'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigateTo('profile')}
                        className="text-gray-600"
                      >
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  {t('detail.reviews')} ({reviews.length})
                </h2>
                {ad.avgRating != null && ad.avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{ad.avgRating}</span>
                    <RatingStars rating={ad.avgRating} size="md" />
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.reviewer?.avatar} />
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                {review.reviewer?.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{review.reviewer?.name}</p>
                              <p className="text-xs text-gray-500">{formatRelativeTime(review.createdAt)}</p>
                            </div>
                          </div>
                          <RatingStars rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <ReviewForm
                adId={ad.id}
                authorId={ad.authorId}
                currentUser={currentUser}
                onSubmitted={async () => {
                  // Refetch reviews
                  const res = await fetch(`/api/agryva/reviews/?adId=${ad.id}`)
                  const json = await res.json()
                  if (json.success) {
                    setAd(prev => prev ? {
                      ...prev,
                      reviews: json.data,
                      avgRating: json.avgRating,
                    } : prev)
                  }
                }}
              />
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card className="border-emerald-200 bg-emerald-50/50 sticky top-4">
              <CardContent className="p-5 space-y-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6"
                  onClick={handleContact}
                  disabled={contacting}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t('detail.contact')}
                </Button>

                {ad.type === 'OFFER' && (
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-6 text-base"
                    onClick={handleBuyNow}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {ad.type === 'SERVICE' ? 'Passer la commande' : t('detail.buyNow')}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={isFavorited ? 'secondary' : 'ghost'}
                    size="sm"
                    className={`flex-1 ${isFavorited ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-gray-600'}`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-red-500' : ''}`} />
                    {isFavorited ? t('detail.added') : 'Favoris'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-gray-600"
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('description-card')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    {t('detail.translate')}
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                        <Share2 className="h-4 w-4 mr-2" />
                        {t('detail.share')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="end">
                      <div className="space-y-1">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + adUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">W</div>
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(adUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">f</div>
                          Facebook
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(adUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">X</div>
                          Twitter / X
                        </a>
                        <button
                          onClick={handleCopyLink}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                            {linkCopied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                          </div>
                          {linkCopied ? t('detail.copied') : t('detail.copyLink')}
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Views & time */}
                <Separator />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {ad.viewsCount} vues
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(ad.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-5">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  {t('detail.safety')}
                </h3>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {t('detail.safety1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {t('detail.safety2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {t('detail.safety3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {t('detail.safety4')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Similar Ads */}
            {similarAds.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">{t('detail.similar')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarAds.map((similar) => (
                    <button
                      key={similar.id}
                      onClick={() => navigateTo('ad-detail', { id: similar.id })}
                      className="w-full flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {(() => {
                          const imgs = typeof similar.images === 'string' ? JSON.parse(similar.images || '[]') : (similar.images || [])
                          return imgs.length > 0 ? (
                            <img src={imgs[0]} alt={similar.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getTypeGradient(similar.type)}`} />
                          )
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{similar.title}</h4>
                        <p className="text-sm font-bold text-emerald-700">{formatPrice(similar.price, similar.priceUnit)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {[similar.region, similar.city].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Ad Space Banner */}
            {adspaceBanner && (
              <a href={adspaceBanner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <img
                    src={adspaceBanner.imageUrl}
                    alt={adspaceBanner.title}
                    className="w-full h-auto rounded-xl"
                  />
                </Card>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  )
}
