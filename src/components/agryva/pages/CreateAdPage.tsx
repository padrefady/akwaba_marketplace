'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type Category } from '../store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Upload,
  Plus,
  X,
  ArrowLeft,
  Loader2,
  ImagePlus,
  Tag,
  Sparkles,
  AlertTriangle,
  Crown,
  Camera,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest',
  'Sud', 'Est', 'Nord', 'Extrême-Nord', 'Adamaoua',
]

const PRICE_UNITS = [
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'tonne', label: 'Tonne' },
  { value: 'sac', label: 'Sac' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'm²', label: 'Mètre carré (m²)' },
  { value: 'hectare', label: 'Hectare' },
  { value: 'lot', label: 'Lot' },
  { value: 'forfait', label: 'Forfait' },
]

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'Nouveau' },
  { value: 'USED', label: 'Usagé' },
  { value: 'FRESH', label: 'Frais' },
  { value: 'PROCESSED', label: 'Transformé' },
]

// ==================== ZOD SCHEMA ====================
const adSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  type: z.enum(['OFFER', 'DEMAND', 'SERVICE'], { required_error: 'Veuillez sélectionner un type' }),
  categorySlug: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  price: z.coerce.number().min(0, 'Le prix doit être positif').nullable().optional(),
  priceUnit: z.string().optional(),
  quantity: z.string().optional(),
  condition: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  tags: z.string().optional(),
  negociable: z.boolean().default(true),
  delivery: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  images: z.array(z.string()).default([]),
})

type AdFormData = z.infer<typeof adSchema>

// ==================== IMAGE URL INPUT ====================
function ImageUrlInput({
  images,
  onChange,
}: {
  images: string[]
  onChange: (imgs: string[]) => void
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    if (!url.trim()) return
    try {
      new URL(url.trim())
      if (images.includes(url.trim())) {
        setError('Cette image est déjà ajoutée')
        return
      }
      if (images.length >= 5) {
        setError('Maximum 5 images autorisées')
        return
      }
      onChange([...images, url.trim()])
      setUrl('')
      setError('')
    } catch {
      setError('URL invalide')
    }
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Images</Label>
      <p className="text-xs text-gray-500">Ajoutez jusqu&apos;à 5 URL d&apos;images</p>

      <div className="flex gap-2">
        <Input
          placeholder="https://exemple.com/image.jpg"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError('') }}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button type="button" variant="outline" size="icon" onClick={handleAdd} disabled={images.length >= 5}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {idx === 0 && (
                <Badge className="absolute bottom-1 left-1 text-[10px] bg-emerald-600 text-white border-0">
                  Principale
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImagePlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucune image ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Les annonces avec photos obtiennent plus de vues</p>
        </div>
      )}
    </div>
  )
}

function Badge({ className, children, ...props }: { className?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

// ==================== MAIN CREATE AD PAGE ====================
export default function CreateAdPage() {
  const { pageParams, navigateTo, currentUser } = useAppStore()
  const editId = pageParams?.id as string | undefined
  const isEdit = !!editId

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingAd, setLoadingAd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [analyzedImagePreview, setAnalyzedImagePreview] = useState<string | null>(null)

  // Ad limit tracking
  const [adLimit, setAdLimit] = useState<{ current: number; max: number; plan: string } | null>(null)
  const [checkingLimit, setCheckingLimit] = useState(true)

  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: '',
      type: 'OFFER',
      categorySlug: '',
      price: null,
      priceUnit: '',
      quantity: '',
      condition: '',
      region: '',
      city: '',
      description: '',
      tags: '',
      negociable: true,
      delivery: false,
      isUrgent: false,
      images: [],
    },
  })

  const watchType = form.watch('type')
  const watchImages = form.watch('images')

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true)
      try {
        const res = await fetch('/api/agryva/categories/')
        const json = await res.json()
        if (json.success) setCategories(json.data)
      } catch {
        toast.error('Erreur lors du chargement des catégories')
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch existing ad for edit mode
  useEffect(() => {
    if (!editId) return

    async function fetchAd() {
      setLoadingAd(true)
      try {
        const res = await fetch(`/api/agryva/ads/${editId}`)
        const json = await res.json()
        if (json.success) {
          const ad = json.data
          form.reset({
            title: ad.title,
            type: ad.type,
            categorySlug: ad.categorySlug,
            price: ad.price,
            priceUnit: ad.priceUnit || '',
            quantity: ad.quantity || '',
            condition: ad.condition || '',
            region: ad.region || '',
            city: ad.city || '',
            description: ad.description,
            tags: Array.isArray(ad.tags) ? ad.tags.join(', ') : (typeof ad.tags === 'string' ? ad.tags : ''),
            negociable: ad.negociable,
            delivery: ad.delivery,
            isUrgent: ad.isUrgent,
            images: Array.isArray(ad.images) ? ad.images : [],
          })
        } else {
          toast.error('Annonce introuvable')
          navigateTo('my-ads')
        }
      } catch {
        toast.error('Erreur lors du chargement')
      } finally {
        setLoadingAd(false)
      }
    }
    fetchAd()
  }, [editId, form, navigateTo])

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour créer une annonce')
      navigateTo('login')
    }
  }, [currentUser, navigateTo])

  // Check ad limit for current user
  useEffect(() => {
    if (!currentUser || isEdit) {
      setCheckingLimit(false)
      return
    }

    async function checkAdLimit() {
      try {
        const res = await fetch(`/api/agryva/ads?authorId=${currentUser.id}&limit=1`)
        const json = await res.json()
        const currentCount = json.count || 0

        // Get plan info from pricing API
        const planRes = await fetch('/api/agryva/pricing')
        const planJson = await planRes.json()
        const plans = planJson.data || []
        const userPlan = plans.find((p: { name: string }) => p.name === currentUser.plan)
        const maxAds = userPlan?.maxAds ?? 999

        setAdLimit({ current: currentCount, max: maxAds, plan: currentUser.plan })
      } catch {
        // On error, allow creation (don't block)
        setAdLimit({ current: 0, max: 999, plan: currentUser.plan })
      } finally {
        setCheckingLimit(false)
      }
    }
    checkAdLimit()
  }, [currentUser, isEdit])

  async function onSubmit(data: AdFormData) {
    if (!currentUser) return

    setSubmitting(true)
    try {
      const tagsArray = data.tags
        ? data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        : []

      const payload = {
        userId: currentUser.id,
        title: data.title,
        type: data.type,
        categorySlug: data.categorySlug,
        price: data.price || null,
        priceUnit: data.priceUnit || null,
        quantity: data.quantity || null,
        condition: data.type !== 'SERVICE' ? (data.condition || null) : null,
        region: data.region || null,
        city: data.city || null,
        description: data.description,
        tags: tagsArray,
        negociable: data.negociable,
        delivery: data.delivery,
        isUrgent: data.isUrgent,
        images: data.images,
      }

      const url = isEdit ? `/api/agryva/ads/${editId}` : '/api/agryva/ads/'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(isEdit ? 'Annonce modifiée avec succès !' : 'Annonce créée avec succès !')
        navigateTo('ad-detail', { id: json.data.id })
      } else {
        if (json.code === 'AD_LIMIT_REACHED') {
          setAdLimit({ current: json.currentAds, max: json.maxAds, plan: currentUser.plan })
          toast.error('Limite d\'annonces atteinte ! Passez à un plan supérieur.')
        } else {
          toast.error(json.error || 'Erreur lors de la sauvegarde')
        }
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  function handleTagsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const value = input.value.trim()
      if (!value) return

      const currentTags = form.getValues('tags') || ''
      const tagArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(Boolean) : []
      if (tagArray.length >= 10) {
        toast.error('Maximum 10 tags autorisés')
        return
      }
      if (tagArray.includes(value)) {
        toast.error('Ce tag existe déjà')
        return
      }

      const newTags = [...tagArray, value].join(', ')
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  async function handleAiGenerateDescription() {
    if (!currentUser) return
    const title = form.getValues('title')
    const categorySlug = form.getValues('categorySlug')
    const price = form.getValues('price')
    const priceUnit = form.getValues('priceUnit')
    const condition = form.getValues('condition')
    const city = form.getValues('city')
    const region = form.getValues('region')

    if (!title || !categorySlug) {
      toast.error('Veuillez remplir le titre et la catégorie pour utiliser l\'IA')
      return
    }

    setAiGeneratingDesc(true)
    try {
      const res = await fetch('/api/agryva/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title,
          category: categorySlug,
          price: price || undefined,
          priceUnit: priceUnit || undefined,
          condition: condition || undefined,
          location: city || undefined,
          region: region || undefined,
        }),
      })
      const json = await res.json()
      if (json.success && json.data?.description) {
        form.setValue('description', json.data.description)
        if (json.data.suggestedTags?.length) {
          const existingTags = (form.getValues('tags') || '').split(',').map(t => t.trim()).filter(Boolean)
          const merged = [...new Set([...existingTags, ...json.data.suggestedTags])].slice(0, 10).join(', ')
          form.setValue('tags', merged)
        }
        toast.success('Description générée par l\'IA avec succès !')
      } else {
        toast.error(json.error || 'Erreur lors de la génération')
      }
    } catch {
      toast.error('Erreur réseau lors de la génération')
    } finally {
      setAiGeneratingDesc(false)
    }
  }

  async function handleImageAnalysis(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setAnalyzingImage(true)
    try {
      const base64DataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/agryva/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          imageDataUri: base64DataUri,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        if (json.data.suggestedTitle) form.setValue('title', json.data.suggestedTitle)
        if (json.data.category) form.setValue('categorySlug', json.data.category)
        if (json.data.condition) form.setValue('condition', json.data.condition)
        if (json.data.suggestedTags?.length) {
          const existingTags = (form.getValues('tags') || '').split(',').map(t => t.trim()).filter(Boolean)
          const merged = [...new Set([...existingTags, ...json.data.suggestedTags])].slice(0, 10).join(', ')
          form.setValue('tags', merged)
        }
        setAnalyzedImagePreview(base64DataUri)
        toast.success('Image analysée avec succès !')
      } else {
        toast.error(json.error || 'Erreur lors de l\'analyse de l\'image')
      }
    } catch {
      toast.error('Erreur réseau lors de l\'analyse')
    } finally {
      setAnalyzingImage(false)
    }
  }

  function removeTag(index: number) {
    const currentTags = form.getValues('tags') || ''
    const tagArray = currentTags.split(',').map(t => t.trim()).filter(Boolean)
    tagArray.splice(index, 1)
    form.setValue('tags', tagArray.join(', '))
  }

  if (!currentUser) return null

  if (loadingAd) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentTags = (form.watch('tags') || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <button
            onClick={() => navigateTo(isEdit ? 'ad-detail' : 'ads', isEdit ? { id: editId } : undefined)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'annonce' : 'Créer une annonce'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? 'Modifiez les informations de votre annonce' : 'Remplissez les informations pour publier votre annonce'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Ad Limit Reached Banner */}
        {adLimit && !isEdit && adLimit.current >= adLimit.max && (
          <div className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-amber-800">Limite d'annonces atteinte</h3>
            <p className="mt-1 text-sm text-amber-700">
              Vous avez <strong>{adLimit.current}</strong> annonce(s) sur <strong>{adLimit.max}</strong> autorisée(s) avec le plan Gratuit.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Passez à un plan supérieur pour publier plus d'annonces.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigateTo('pricing')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6"
              >
                <Crown className="h-4 w-4 mr-2" />
                Voir les offres Premium & VIP
              </Button>
              <Button variant="outline" onClick={() => navigateTo('my-ads')} className="border-amber-300 text-amber-700">
                Voir mes annonces
              </Button>
            </div>
          </div>
        )}

        {/* Ad Limit Info Bar (when not at limit) */}
        {adLimit && !isEdit && adLimit.current < adLimit.max && adLimit.max < 999 && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-800">
                Espace publicitaire
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {adLimit.current}/{adLimit.max} annonce(s)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-emerald-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min((adLimit.current / adLimit.max) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-600">
              {adLimit.max - adLimit.current > 0
                ? `Il vous reste ${adLimit.max - adLimit.current} annonce(s) gratuite(s). Passez à Premium pour en publier davantage.`
                : 'Limite atteinte.'
              }
            </p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titre <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-2">({form.watch('title')?.length || 0}/100)</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Plantains mûrs à vendre - Yaoundé"
                  {...form.register('title')}
                  maxLength={100}
                  className={form.formState.errors.title ? 'border-red-500' : ''}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type d&apos;annonce <span className="text-red-500">*</span></Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(v) => form.setValue('type', v as 'OFFER' | 'DEMAND' | 'SERVICE')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFER">Offre (Je vends)</SelectItem>
                    <SelectItem value="DEMAND">Demande (Je cherche)</SelectItem>
                    <SelectItem value="SERVICE">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categorySlug">Catégorie <span className="text-red-500">*</span></Label>
                {loadingCategories ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={form.watch('categorySlug')}
                    onValueChange={(v) => form.setValue('categorySlug', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {form.formState.errors.categorySlug && (
                  <p className="text-xs text-red-500">{form.formState.errors.categorySlug.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Quantity */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                💰 Prix et quantité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    {...form.register('price')}
                    min={0}
                  />
                  {form.formState.errors.price && (
                    <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceUnit">Unité de prix</Label>
                  <Select
                    value={form.watch('priceUnit') || '_none'}
                    onValueChange={(v) => form.setValue('priceUnit', v === '_none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucune unité</SelectItem>
                      {PRICE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  placeholder="Ex: 50 kg, 100 sacs, 5 tonnes"
                  {...form.register('quantity')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Condition (hidden for SERVICE) */}
          {watchType !== 'SERVICE' && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  📦 Condition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch('condition') || '_none'}
                  onValueChange={(v) => form.setValue('condition', v === '_none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non spécifié</SelectItem>
                    {CONDITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📍 Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région</Label>
                <Select
                  value={form.watch('region') || '_none'}
                  onValueChange={(v) => form.setValue('region', v === '_none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non spécifié</SelectItem>
                    {CAMEROON_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ex: Yaoundé, Douala, Bafoussam"
                  {...form.register('city')}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Description Generator */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-600" />
                Générateur IA de description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Laissez l&apos;intelligence artificielle rédiger une description professionnelle pour votre annonce. Remplissez d&apos;abord le titre, la catégorie et le prix pour de meilleurs résultats.
              </p>
              <Button
                type="button"
                onClick={handleAiGenerateDescription}
                disabled={aiGeneratingDesc}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                {aiGeneratingDesc ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    L&apos;IA rédige votre description...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer avec l&apos;IA ✨
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Image Analysis */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-600" />
                📷 Analyser une image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Importez une photo de votre produit. L&apos;IA analysera l&apos;image et remplira automatiquement la catégorie, la condition, les tags et le titre.
              </p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageAnalysis}
                    disabled={analyzingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={analyzingImage}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    asChild
                  >
                    <span>
                      {analyzingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Choisir une image
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                {analyzedImagePreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-300">
                    <img src={analyzedImagePreview} alt="Image analysée" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📝 Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Décrivez votre produit ou service en détail. Incluez des informations sur la qualité, la quantité, les conditions de livraison, etc."
                rows={6}
                {...form.register('description')}
                className={form.formState.errors.description ? 'border-red-500' : ''}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag (Entrée pour ajouter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagsKeyDown}
                />
              </div>
              <p className="text-xs text-gray-500">
                Appuyez sur Entrée ou , pour ajouter. Maximum 10 tags.
              </p>
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {currentTags.map((tag, idx) => (
                      <motion.div
                        key={`${tag}-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1 pr-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="ml-1 hover:text-red-600 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUrlInput
                images={watchImages || []}
                onChange={(imgs) => form.setValue('images', imgs)}
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="negociable" className="text-sm font-medium">Négociable</Label>
                  <p className="text-xs text-gray-500">Les acheteurs peuvent négocier le prix</p>
                </div>
                <Switch
                  id="negociable"
                  checked={form.watch('negociable')}
                  onCheckedChange={(checked) => form.setValue('negociable', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="delivery" className="text-sm font-medium">Livraison disponible</Label>
                  <p className="text-xs text-gray-500">Vous proposez la livraison de la marchandise</p>
                </div>
                <Switch
                  id="delivery"
                  checked={form.watch('delivery')}
                  onCheckedChange={(checked) => form.setValue('delivery', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isUrgent" className="text-sm font-medium text-red-600">Urgent</Label>
                  <p className="text-xs text-gray-500">Votre annonce apparaîtra en priorité</p>
                </div>
                <Switch
                  id="isUrgent"
                  checked={form.watch('isUrgent')}
                  onCheckedChange={(checked) => form.setValue('isUrgent', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Button
              type="submit"
              disabled={submitting || (adLimit !== null && !isEdit && adLimit.current >= adLimit.max)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-6 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEdit ? 'Modification...' : 'Publication...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isEdit ? 'Enregistrer les modifications' : 'Publier l\'annonce'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateTo(isEdit ? 'my-ads' : 'ads')}
              className="py-6"
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
