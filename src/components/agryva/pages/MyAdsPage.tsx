'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Ad } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Plus,
  Eye,
  Clock,
  Star,
  Zap,
  Award,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  PlusCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

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

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      )
    case 'SOLD':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
          <Package className="h-3 w-3 mr-1" />
          Vendue
        </Badge>
      )
    case 'EXPIRED':
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
          <XCircle className="h-3 w-3 mr-1" />
          Expirée
        </Badge>
      )
    case 'REJECTED':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
          <XCircle className="h-3 w-3 mr-1" />
          Rejetée
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
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

// ==================== COMPACT AD CARD ====================
function MyAdCard({
  ad,
  onEdit,
  onDelete,
  onFeature,
}: {
  ad: Ad
  onEdit: (ad: Ad) => void
  onDelete: (adId: string) => void
  onFeature: (ad: Ad) => void
}) {
  const { navigateTo } = useAppStore()
  const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : (ad.images || [])
  const hasImage = images.length > 0

  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
      <div className="flex">
        {/* Image */}
        <div
          className="w-28 sm:w-36 shrink-0 cursor-pointer"
          onClick={() => navigateTo('ad-detail', { id: ad.id })}
        >
          {hasImage ? (
            <img
              src={images[0]}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full min-h-32 bg-gradient-to-br ${getTypeGradient(ad.type)} flex items-center justify-center text-white opacity-50`}>
              <Package className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className="font-semibold text-sm text-gray-900 line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors"
                onClick={() => navigateTo('ad-detail', { id: ad.id })}
              >
                {ad.title}
              </h3>

              {/* Dropdown actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-1 -mr-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigateTo('ad-detail', { id: ad.id })}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(ad)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  {ad.status === 'ACTIVE' && !ad.isFeatured && (
                    <DropdownMenuItem onClick={() => onFeature(ad)}>
                      <Award className="h-4 w-4 mr-2" />
                      Mettre en avant
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {getTypeBadge(ad.type)}
              {getStatusBadge(ad.status)}
              {ad.isUrgent && (
                <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                  <Zap className="h-2.5 w-2.5 mr-0.5" /> Urgent
                </Badge>
              )}
              {ad.isFeatured && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                  <Award className="h-2.5 w-2.5 mr-0.5" /> En vedette
                </Badge>
              )}
            </div>

            <p className="text-base font-bold text-emerald-700 mb-2">
              {formatPrice(ad.price, ad.priceUnit)}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {ad.viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(ad.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// ==================== SKELETON CARD ====================
function SkeletonMyAdCard() {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <Skeleton className="w-36 shrink-0 min-h-32" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// ==================== EMPTY STATE ====================
function EmptyState({ activeTab }: { activeTab: string }) {
  const { navigateTo } = useAppStore()

  const messages: Record<string, { title: string; desc: string }> = {
    all: {
      title: 'Vous n\'avez pas encore d\'annonces',
      desc: 'Commencez à vendre vos produits agricoles en créant votre première annonce.',
    },
    active: {
      title: 'Aucune annonce active',
      desc: 'Vos annonces actives apparaîtront ici.',
    },
    pending: {
      title: 'Aucune annonce en attente',
      desc: 'Vos annonces en attente de validation apparaîtront ici.',
    },
    sold: {
      title: 'Aucune annonce vendue',
      desc: 'Vos annonces marquées comme vendues apparaîtront ici.',
    },
    expired: {
      title: 'Aucune annonce expirée',
      desc: 'Vos annonces expirées apparaîtront ici.',
    },
  }

  const msg = messages[activeTab] || messages.all

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <PlusCircle className="h-10 w-10 text-emerald-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{msg.title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{msg.desc}</p>
      <Button
        onClick={() => navigateTo('create-ad')}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Créer une annonce
      </Button>
    </motion.div>
  )
}

// ==================== MAIN MY ADS PAGE ====================
export default function MyAdsPage() {
  const { currentUser, navigateTo } = useAppStore()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const fetchAds = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/agryva/ads/my?userId=${currentUser.id}`)
      const json = await res.json()
      if (json.success) {
        setAds(json.data)
      }
    } catch {
      toast.error('Erreur lors du chargement de vos annonces')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      navigateTo('login')
      return
    }
    fetchAds()
  }, [currentUser, navigateTo, fetchAds])

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigateTo('login')
    }
  }, [currentUser, navigateTo])

  async function handleDelete(adId: string) {
    if (!currentUser) return
    setDeleting(adId)
    try {
      const res = await fetch(`/api/agryva/ads/${adId}?userId=${currentUser.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Annonce supprimée avec succès')
        setAds((prev) => prev.filter((a) => a.id !== adId))
      } else {
        toast.error(json.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setDeleting(null)
    }
  }

  function handleEdit(ad: Ad) {
    navigateTo('edit-ad', { id: ad.id })
  }

  function handleFeature(ad: Ad) {
    toast.info('La fonctionnalité "Mettre en avant" est réservée aux abonnés Premium et VIP.')
    navigateTo('pricing')
  }

  // Filter ads by tab
  const filteredAds = ads.filter((ad) => {
    switch (activeTab) {
      case 'active':
        return ad.status === 'ACTIVE'
      case 'pending':
        return ad.status === 'PENDING' || ad.status === 'REJECTED'
      case 'sold':
        return ad.status === 'SOLD'
      case 'expired':
        return ad.status === 'EXPIRED'
      default:
        return true
    }
  })

  const tabCounts = {
    all: ads.length,
    active: ads.filter((a) => a.status === 'ACTIVE').length,
    pending: ads.filter((a) => a.status === 'PENDING' || a.status === 'REJECTED').length,
    sold: ads.filter((a) => a.status === 'SOLD').length,
    expired: ads.filter((a) => a.status === 'EXPIRED').length,
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mes annonces</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Gérez toutes vos annonces en un seul endroit
              </p>
            </div>
            <Button
              onClick={() => navigateTo('create-ad')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une annonce
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-gray-100 h-auto p-1 flex flex-wrap">
            <TabsTrigger value="all" className="flex-1 min-w-0 text-xs sm:text-sm">
              Toutes ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 min-w-0 text-xs sm:text-sm">
              Actives ({tabCounts.active})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 min-w-0 text-xs sm:text-sm">
              En attente ({tabCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="sold" className="flex-1 min-w-0 text-xs sm:text-sm">
              Vendues ({tabCounts.sold})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex-1 min-w-0 text-xs sm:text-sm">
              Expirées ({tabCounts.expired})
            </TabsTrigger>
          </TabsList>

          {/* Tab content rendered for all tabs using the filtered list */}
          {loading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonMyAdCard key={i} />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="mt-6">
              <EmptyState activeTab={activeTab} />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <AnimatePresence>
                {filteredAds.map((ad) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MyAdCard
                      ad={ad}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onFeature={handleFeature}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Tabs>
      </div>

      {/* FAB - Mobile create button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          onClick={() => navigateTo('create-ad')}
          className="bg-emerald-600 hover:bg-emerald-700 h-14 w-14 rounded-full shadow-xl"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
