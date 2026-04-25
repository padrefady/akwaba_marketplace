'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type User, type Transaction } from '@/components/agryva/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ShoppingBag,
  Crown,
  Sparkles,
  Upload,
  Save,
  Heart,
  Bot,
  LayoutDashboard,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'

const priceFormatter = new Intl.NumberFormat('fr-FR')

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest',
  'Sud', 'Est', 'Nord', 'Extrême-Nord', 'Adamaoua'
]

const ROLE_OPTIONS = [
  { value: 'BUYER', label: 'Acheteur' },
  { value: 'SELLER', label: 'Vendeur' },
  { value: 'BOTH', label: 'Acheteur & Vendeur' },
]

const PLAN_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; label: string }> = {
  FREE: { color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200', label: 'Gratuit' },
  PREMIUM: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Premium' },
  VIP: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', label: 'VIP' },
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    PENDING: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    COMPLETED: { variant: 'default', className: 'bg-emerald-600 text-white' },
    FAILED: { variant: 'destructive', className: 'bg-red-600 text-white' },
    REFUNDED: { variant: 'secondary', className: 'bg-gray-100 text-gray-600' },
  }
  const c = config[status] || config.PENDING
  return <Badge variant={c.variant} className={c.className}>{status}</Badge>
}

function PaymentMethodBadge({ method }: { method: string }) {
  const config: Record<string, { className: string; label: string }> = {
    CARD: { className: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Carte bancaire' },
    ORANGE_MONEY: { className: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Orange Money' },
    MTN_MONEY: { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'MTN MoMo' },
  }
  const c = config[method] || config.CARD
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { currentUser, setUser, navigateTo, pageParams } = useAppStore()
  const [activeTab, setActiveTab] = useState('info')

  // Profile data
  const [profileData, setProfileData] = useState<Record<string, string>>({})
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  // Purchases (buyer transactions)
  const [purchases, setPurchases] = useState<Transaction[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  const userId = currentUser?.id || pageParams.userId

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/agryva/profile?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        const d = json.data
        setProfileData({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          bio: d.bio || '',
          location: d.location || '',
          region: d.region || '',
          city: d.city || '',
          role: d.role || 'BOTH',
          avatar: d.avatar || '',
        })
        setAvgRating(d.avgRating || 0)
        setTotalReviews(d.totalReviews || 0)
      }
    } catch {
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoadingProfile(false)
    }
  }, [userId])

  const fetchReviews = useCallback(async () => {
    if (!userId) return
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/agryva/profile/reviews?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setReviews(json.data || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des avis')
    } finally {
      setLoadingReviews(false)
    }
  }, [userId])

  const fetchTransactions = useCallback(async () => {
    if (!userId) return
    setLoadingTransactions(true)
    try {
      const res = await fetch(`/api/agryva/payments/?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        const allTx = json.data || []
        setTransactions(allTx)
        setPurchases(allTx.filter((t: Transaction) => t.buyerId === userId))
      }
    } catch {
      toast.error('Erreur lors du chargement des transactions')
    } finally {
      setLoadingTransactions(false)
      setLoadingPurchases(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
    fetchReviews()
    fetchTransactions()
  }, [fetchProfile, fetchReviews, fetchTransactions])

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const res = await fetch('/api/agryva/profile/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: profileData.name,
          phone: profileData.phone,
          bio: profileData.bio,
          location: profileData.location,
          region: profileData.region,
          city: profileData.city,
          role: profileData.role,
          avatar: profileData.avatar,
        }),
      })
      const json = await res.json()
      if (json.success) {
        if (currentUser?.id === userId) {
          setUser({ ...currentUser, ...profileData } as User)
        }
        toast.success('Profil mis à jour avec succès !')
      } else {
        toast.error(json.error || 'Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy à HH:mm', { locale: fr })
    } catch {
      return dateStr
    }
  }

  const formatDateShort = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: fr })
    } catch {
      return dateStr
    }
  }

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const plan = currentUser?.plan || 'FREE'
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE
  const planExpiry = currentUser?.planExpiresAt

  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserIcon className="w-7 h-7 text-emerald-600" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
              <Badge className={`px-3 py-1 border-0 ${
                plan === 'VIP' ? 'bg-amber-100 text-amber-700' :
                plan === 'PREMIUM' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {plan === 'FREE' ? 'Standard' : plan}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="info" className="text-xs sm:text-sm">
            <UserIcon className="w-4 h-4 mr-1.5" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm">
            <Crown className="w-4 h-4 mr-1.5" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">
            <Star className="w-4 h-4 mr-1.5" />
            Mes avis
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">
            <CreditCard className="w-4 h-4 mr-1.5" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs sm:text-sm">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Mes achats
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 - Informations personnelles */}
        <TabsContent value="info">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
                <CardDescription>Modifiez vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-emerald-200">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
                      {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Changer la photo
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG — Max 2 Mo</p>
                  </div>
                </div>

                {/* Quick Links (only for own profile) */}
                {isOwnProfile && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => navigateTo('dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => navigateTo('favorites')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Mes favoris
                    </Button>
                    {currentUser?.plan === 'VIP' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => navigateTo('ai-assistant')}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Assistant IA
                      </Button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                      Nom complet
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name || ''}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={profileData.email || ''}
                      readOnly
                      className="bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                      Rôle
                    </Label>
                    <Select
                      value={profileData.role || 'BOTH'}
                      onValueChange={(val) => setProfileData({ ...profileData, role: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <Label htmlFor="region" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      Région
                    </Label>
                    <Select
                      value={profileData.region || ''}
                      onValueChange={(val) => setProfileData({ ...profileData, region: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMEROON_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={profileData.city || ''}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Votre ville"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Parlez-nous de vous et de vos activités agricoles..."
                    rows={4}
                  />
                </div>

                {/* Save */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tab 2 - Mon abonnement */}
        <TabsContent value="subscription">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <Card className={`border-2 ${planConfig.borderColor}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Mon abonnement actuel
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {planExpiry ? `Expire le ${formatDateShort(planExpiry)}` : 'Pas de date d\'expiration'}
                    </CardDescription>
                  </div>
                  <Badge className={`${planConfig.bgColor} ${planConfig.color} text-sm px-3 py-1`}>
                    {planConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
                  {plan === 'VIP' && <Sparkles className="w-5 h-5 text-yellow-500" />}
                  {plan === 'PREMIUM' && <Crown className="w-5 h-5 text-emerald-500" />}
                  {plan === 'FREE' && <UserIcon className="w-5 h-5 text-gray-400" />}
                  <span className="font-medium">
                    {plan === 'VIP' && 'Accès illimité à toutes les fonctionnalités'}
                    {plan === 'PREMIUM' && 'Jusqu\'à 50 annonces et fonctionnalités avancées'}
                    {plan === 'FREE' && 'Plan de base avec 5 annonces'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            {plan !== 'VIP' && (
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-lg mb-1">
                        Passez au plan supérieur !
                      </h3>
                      <p className="text-emerald-700 text-sm">
                        {plan === 'FREE'
                          ? 'Débloquez plus d\'annonces et des fonctionnalités premium.'
                          : 'Accédez à toutes les fonctionnalités avec le plan VIP.'}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigateTo('pricing')}
                      className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Changer d&apos;offre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparaison des offres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fonctionnalité</TableHead>
                        <TableHead className="text-center">Gratuit</TableHead>
                        <TableHead className="text-center">Premium</TableHead>
                        <TableHead className="text-center">VIP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { feature: 'Annonces actives', free: '5', premium: '50', vip: 'Illimité' },
                        { feature: 'Annonces en vedette', free: '✗', premium: '✓', vip: '✓' },
                        { feature: 'Messagerie illimitée', free: '✗', premium: '✓', vip: '✓' },
                        { feature: 'Statistiques détaillées', free: '✗', premium: '✓', vip: '✓' },
                        { feature: 'Support prioritaire', free: '✗', premium: '✗', vip: '✓' },
                        { feature: 'Frais réduits', free: '2%', premium: '1.5%', vip: '1%' },
                      ].map((row) => (
                        <TableRow key={row.feature}>
                          <TableCell className="font-medium">{row.feature}</TableCell>
                          <TableCell className={`text-center ${plan === 'FREE' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                            {row.free}
                          </TableCell>
                          <TableCell className={`text-center ${plan === 'PREMIUM' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                            {row.premium}
                          </TableCell>
                          <TableCell className={`text-center ${plan === 'VIP' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                            {row.vip}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tab 3 - Mes avis */}
        <TabsContent value="reviews">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{avgRating}</div>
                    <StarRating rating={Math.round(avgRating)} size="md" />
                    <p className="text-sm text-gray-500 mt-1">{totalReviews} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r: any) => r.rating === star).length
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-3">{star}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-yellow-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: star * 0.1 }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun avis</h3>
                  <p className="text-sm text-gray-400">Vous n&apos;avez pas encore reçu d&apos;avis.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {reviews.map((review: any, i: number) => (
                  <motion.div
                    key={review.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                                {(review.reviewer?.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {review.reviewer?.name || 'Anonyme'}
                              </p>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} />
                                <span className="text-xs text-gray-400">
                                  {review.createdAt && formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Tab 4 - Mes transactions */}
        <TabsContent value="transactions">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des transactions</CardTitle>
                <CardDescription>Toutes vos transactions (achats et ventes)</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucune transaction</h3>
                    <p className="text-sm text-gray-400">Vos transactions apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Annonce</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="text-right">Frais (2%)</TableHead>
                          <TableHead>Méthode</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx: Transaction) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                              {tx.createdAt && formatDateShort(tx.createdAt)}
                            </TableCell>
                            <TableCell className="font-medium text-sm max-w-[150px] truncate">
                              {tx.ad?.title || tx.description || '—'}
                            </TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">
                              {priceFormatter.format(tx.amount)} FCFA
                            </TableCell>
                            <TableCell className="text-right text-xs text-gray-500 whitespace-nowrap">
                              {priceFormatter.format(tx.platformFee)} FCFA
                            </TableCell>
                            <TableCell>
                              <PaymentMethodBadge method={tx.paymentMethod} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={tx.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tab 5 - Mes achats */}
        <TabsContent value="purchases">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mes achats</CardTitle>
                <CardDescription>Historique de vos achats sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPurchases ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun achat</h3>
                    <p className="text-sm text-gray-400">
                      <button
                        onClick={() => navigateTo('ads')}
                        className="text-emerald-600 hover:underline"
                      >
                        Parcourez les annonces
                      </button>{' '}
                      pour effectuer votre premier achat.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Annonce</TableHead>
                          <TableHead>Vendeur</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="text-right">Frais (2%)</TableHead>
                          <TableHead>Méthode</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((tx: Transaction) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                              {tx.createdAt && formatDateShort(tx.createdAt)}
                            </TableCell>
                            <TableCell>
                              <button
                                className="font-medium text-sm text-emerald-700 hover:underline max-w-[150px] truncate block"
                                onClick={() => tx.ad && navigateTo('ad-detail', { adId: tx.ad.id })}
                              >
                                {tx.ad?.title || '—'}
                              </button>
                            </TableCell>
                            <TableCell className="text-sm">
                              {tx.seller?.name || '—'}
                            </TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">
                              {priceFormatter.format(tx.amount)} FCFA
                            </TableCell>
                            <TableCell className="text-right text-xs text-gray-500 whitespace-nowrap">
                              {priceFormatter.format(tx.platformFee)} FCFA
                            </TableCell>
                            <TableCell>
                              <PaymentMethodBadge method={tx.paymentMethod} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={tx.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
