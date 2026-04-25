'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Ad } from '../store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Heart,
  Search,
  MapPin,
  Clock,
  Eye,
  X,
  Wheat,
  ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== HELPERS ====================
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

function getTypeBadge(type: string) {
  switch (type) {
    case 'OFFER':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 text-xs">Offre</Badge>
    case 'DEMAND':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0 text-xs">Demande</Badge>
    case 'SERVICE':
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0 text-xs">Service</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{type}</Badge>
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

// ==================== FAVORITE AD CARD ====================
function FavoriteCard({
  ad,
  onRemove,
  onClick,
  onRemoving,
}: {
  ad: Ad
  onRemove: () => void
  onClick: () => void
  onRemoving: boolean
}) {
  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const hasImage = images.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card className="group overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <img
              src={images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={onClick}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getTypeGradient(ad.type)} flex items-center justify-center text-white/60 cursor-pointer`}
              onClick={onClick}
            >
              <Wheat className="h-10 w-10" />
            </div>
          )}

          {/* Remove favorite button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-red-100 text-red-500 shadow-sm border-0 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            disabled={onRemoving}
          >
            <Heart className="h-4 w-4 fill-current" />
          </Button>

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            {getTypeBadge(ad.type)}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3
            className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 cursor-pointer group-hover:text-emerald-700 transition-colors"
            onClick={onClick}
          >
            {ad.title}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-emerald-700 mb-2">
            {formatPrice(ad.price, ad.priceUnit)}
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
              <Eye className="h-3 w-3" />
              {ad.viewsCount}
            </span>
          </div>

          {/* Saved time */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="h-3 w-3 text-red-400 fill-current" />
              <span>Sauvegardé {formatRelativeTime(ad.createdAt)}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== SKELETON CARD ====================
function SkeletonFavoriteCard() {
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

// ==================== EMPTY STATE ====================
function EmptyState() {
  const { navigateTo } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4">
        <Heart className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Vous n&apos;avez pas encore de favoris
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
        Parcourez les annonces et sauvegardez celles qui vous intéressent pour les retrouver facilement.
      </p>
      <Button
        onClick={() => navigateTo('ads')}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Search className="h-4 w-4 mr-2" />
        Parcourir les annonces
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  )
}

// ==================== MAIN FAVORITES PAGE ====================
export default function FavoritesPage() {
  const { currentUser, navigateTo, favoriteIds, setFavoriteIds } = useAppStore()
  const [favorites, setFavorites] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/agryva/favorites/?userId=${currentUser.id}`)
      const json = await res.json()
      if (json.success) {
        setFavorites(json.data || [])
        // Sync with store
        const ids = (json.data || []).map((ad: Ad) => ad.id)
        setFavoriteIds(ids)
      }
    } catch {
      toast.error('Erreur lors du chargement des favoris')
    } finally {
      setLoading(false)
    }
  }, [currentUser, setFavoriteIds])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  async function handleRemoveFavorite(adId: string) {
    if (!currentUser) return
    setRemovingId(adId)
    try {
      const res = await fetch('/api/agryva/favorites/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, adId }),
      })
      const json = await res.json()
      if (json.success) {
        setFavorites((prev) => prev.filter((a) => a.id !== adId))
        setFavoriteIds(favoriteIds.filter((id) => id !== adId))
        toast.success('Retiré des favoris')
      } else {
        toast.error(json.error || 'Erreur lors du retrait des favoris')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setRemovingId(null)
    }
  }

  function handleAdClick(ad: Ad) {
    navigateTo('ad-detail', { id: ad.id })
  }

  // Filter favorites by search
  const filteredFavorites = favorites.filter((ad) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      ad.title.toLowerCase().includes(q) ||
      (ad.description || '').toLowerCase().includes(q) ||
      (ad.region || '').toLowerCase().includes(q) ||
      (ad.city || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Mes favoris
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {favorites.length > 0
                  ? `${favorites.length} annonce${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`
                  : 'Vos annonces préférées'}
              </p>
            </div>
          </div>

          {/* Search bar */}
          {favorites.length > 0 && (
            <div className="mt-5 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans mes favoris..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow border-0 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonFavoriteCard key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState />
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun résultat pour &quot;{searchQuery}&quot;
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Essayez un autre terme de recherche
            </p>
            <Button
              variant="outline"
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={() => setSearchQuery('')}
            >
              Effacer la recherche
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Result count */}
            {searchQuery && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-900">{filteredFavorites.length}</span>{' '}
                résultat{filteredFavorites.length > 1 ? 's' : ''} trouvé{filteredFavorites.length > 1 ? 's' : ''}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filteredFavorites.map((ad) => (
                  <FavoriteCard
                    key={ad.id}
                    ad={ad}
                    onRemove={() => handleRemoveFavorite(ad.id)}
                    onClick={() => handleAdClick(ad)}
                    onRemoving={removingId === ad.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
