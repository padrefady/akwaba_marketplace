'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/components/agryva/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Zap,
  Star,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const priceFormatter = new Intl.NumberFormat('fr-FR')

const PLAN_FEATURES: Record<string, { name: string; price: number; features: string[] }> = {
  PREMIUM: {
    name: 'Premium',
    price: 5000,
    features: [
      'Jusqu\'à 50 annonces actives',
      'Annonces en vedette',
      'Messagerie illimitée',
      'Statistiques détaillées',
      'Frais réduits (1.5%)',
    ],
  },
  VIP: {
    name: 'VIP',
    price: 15000,
    features: [
      'Annonces illimitées',
      'Mise en avant prioritaire',
      'Toutes les fonctionnalités Premium',
      'Support prioritaire',
      'Frais réduits (1%)',
      'Badge VIP exclusif',
    ],
  },
}

export default function PaymentPage() {
  const { currentUser, navigateTo, pageParams } = useAppStore()
  const [adData, setAdData] = useState<any>(null)
  const [loadingAd, setLoadingAd] = useState(!!pageParams.adId)

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'PAYPAL'>('CARD')
  const [contactMessage, setContactMessage] = useState('')

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  const [cardName, setCardName] = useState('')

  // Mobile money fields
  const [mobileNumber, setMobileNumber] = useState('')

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState('')

  // State
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isPurchaseMode = !!pageParams.adId
  const planMode = (pageParams.plan as string) || null
  const planInfo = planMode ? PLAN_FEATURES[planMode] : null

  // Fetch ad data if purchase mode
  useEffect(() => {
    if (pageParams.adId) {
      fetchAd()
    }
  }, [pageParams.adId])

  const fetchAd = async () => {
    setLoadingAd(true)
    try {
      const res = await fetch(`/api/agryva/ads/${pageParams.adId}`)
      const json = await res.json()
      if (json.success) {
        setAdData(json.data)
      }
    } catch {
      toast.error('Erreur lors du chargement de l\'annonce')
    } finally {
      setLoadingAd(false)
    }
  }

  // Format card number
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 16)
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    setCardNumber(formatted)
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' })
  }

  // Format expiry
  const handleExpiryChange = (value: string) => {
    let cleaned = value.replace(/\D/g, '').substring(0, 4)
    if (cleaned.length >= 3) {
      cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2)
    }
    setCardExpiry(cleaned)
    if (errors.cardExpiry) setErrors({ ...errors, cardExpiry: '' })
  }

  const handleCVVChange = (value: string) => {
    setCardCVV(value.replace(/\D/g, '').substring(0, 3))
    if (errors.cardCVV) setErrors({ ...errors, cardCVV: '' })
  }

  const handleMobileNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 9)
    setMobileNumber(cleaned)
    if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' })
  }

  const handlePaypalEmailChange = (value: string) => {
    setPaypalEmail(value)
    if (errors.paypalEmail) setErrors({ ...errors, paypalEmail: '' })
  }

  // Validate
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (paymentMethod === 'CARD') {
      const cleanCardNum = cardNumber.replace(/\s/g, '')
      if (cleanCardNum.length < 16) {
        newErrors.cardNumber = 'Numéro de carte invalide'
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Format MM/YY requis'
      }
      if (cardCVV.length < 3) {
        newErrors.cardCVV = 'CVV invalide'
      }
      if (!cardName.trim()) {
        newErrors.cardName = 'Nom requis'
      }
    } else if (paymentMethod === 'PAYPAL') {
      if (!paypalEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
        newErrors.paypalEmail = 'Email PayPal invalide'
      }
    } else {
      if (!mobileNumber.startsWith('6') || mobileNumber.length !== 9) {
        newErrors.mobileNumber = 'Numéro invalide (doit commencer par 6 et contenir 9 chiffres)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit payment
  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Veuillez vous connecter')
      navigateTo('login')
      return
    }

    if (!validate()) {
      toast.error('Veuillez corriger les erreurs')
      return
    }

    setProcessing(true)

    try {
      let amount = 0
      let sellerId = ''
      let adId = pageParams.adId || null
      let description = ''

      if (isPurchaseMode && adData) {
        amount = adData.price || 0
        sellerId = adData.authorId
        description = `Achat: ${adData.title}`
      } else if (planInfo) {
        amount = planInfo.price
        sellerId = 'SYSTEM'
        description = `Abonnement ${planInfo.name}`
      }

      // Initiate payment
      const initiateRes = await fetch('/api/agryva/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser.id,
          sellerId,
          adId,
          amount,
          paymentMethod,
          description: description + (contactMessage ? ` - ${contactMessage}` : ''),
        }),
      })

      const initiateJson = await initiateRes.json()

      if (!initiateJson.success) {
        toast.error(initiateJson.error || 'Erreur lors de l\'initialisation')
        setProcessing(false)
        return
      }

      const txId = initiateJson.data.id
      setTransactionId(txId)

      // Simulate payment processing (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Confirm payment
      const confirmRes = await fetch('/api/agryva/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      })

      const confirmJson = await confirmRes.json()

      if (confirmJson.success) {
        setSuccess(true)
        toast.success('Paiement effectué avec succès !')

        // Navigate to transactions after a short delay
        setTimeout(() => {
          navigateTo('profile')
        }, 3000)
      } else {
        toast.error(confirmJson.error || 'Erreur lors de la confirmation')
        setProcessing(false)
      }
    } catch {
      toast.error('Erreur serveur')
      setProcessing(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
          <p className="text-gray-500 mb-8">
            {isPurchaseMode
              ? 'Votre achat a été confirmé. Le vendeur sera notifié.'
              : `Votre abonnement ${planInfo?.name || ''} est maintenant actif.`}
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Référence</span>
                <span className="text-sm font-mono font-medium">{transactionId?.substring(0, 12)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Méthode</span>
                <span className="text-sm font-medium">
                  {paymentMethod === 'CARD' && 'Carte bancaire'}
                  {paymentMethod === 'ORANGE_MONEY' && 'Orange Money'}
                  {paymentMethod === 'MTN_MONEY' && 'MTN Mobile Money'}
                  {paymentMethod === 'PAYPAL' && 'PayPal'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Montant</span>
                <span className="text-lg font-bold text-emerald-600">
                  {isPurchaseMode && adData ? priceFormatter.format(adData.price || 0) : planInfo ? priceFormatter.format(planInfo.price) : '0'} FCFA
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigateTo('home')}
            >
              Retour à l&apos;accueil
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigateTo('profile')}
            >
              Voir mes transactions
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Redirection automatique vers vos transactions...
          </p>
        </motion.div>
      </div>
    )
  }

  // Calculate prices
  const productPrice = isPurchaseMode && adData ? (adData.price || 0) : (planInfo?.price || 0)
  const platformFee = Math.round(productPrice * 0.02)
  const totalAmount = productPrice + platformFee

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 text-gray-500 hover:text-gray-700"
        onClick={() => navigateTo('home')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-7 h-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiement</h1>
          <p className="text-sm text-gray-500">
            {isPurchaseMode ? 'Finalisez votre achat' : 'Obtenez votre abonnement'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Ad summary / Plan info */}
        {isPurchaseMode ? (
          loadingAd ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : adData ? (
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {(() => {
                    const images = typeof adData.images === 'string'
                      ? JSON.parse(adData.images)
                      : (adData.images || [])
                    return images.length > 0 ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={images[0]} alt={adData.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-emerald-300" />
                      </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{adData.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Vendeur : {adData.author?.name || 'Vendeur'}
                    </p>
                    {adData.location && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {adData.location}</p>
                    )}
                    <p className="text-lg font-bold text-emerald-600 mt-2">
                      {priceFormatter.format(adData.price || 0)} FCFA
                    </p>
                  </div>
                </div>

                {/* Contact message */}
                <div className="mt-4">
                  <Label className="text-xs text-gray-500">Message pour le vendeur (optionnel)</Label>
                  <Textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Ajoutez un message pour le vendeur..."
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ) : null
        ) : planInfo ? (
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {planMode === 'VIP' ? (
                  <Star className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Zap className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="font-bold text-gray-900">Abonnement {planInfo.name}</h3>
              </div>
              <div className="space-y-1.5">
                {planInfo.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Prix mensuel</span>
                <span className="text-xl font-bold text-emerald-600">
                  {priceFormatter.format(planInfo.price)} FCFA
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Price Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {isPurchaseMode ? 'Prix du produit' : 'Prix de l\'abonnement'}
                </span>
                <span className="font-medium">{priceFormatter.format(productPrice)} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission plateforme (2%)</span>
                <span className="font-medium text-amber-600">{priceFormatter.format(platformFee)} FCFA</span>
              </div>
              {isPurchaseMode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant vendeur</span>
                  <span className="font-medium text-emerald-600">{priceFormatter.format(productPrice)} FCFA</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-600">{priceFormatter.format(totalAmount)} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mode de paiement</CardTitle>
            <CardDescription>Choisissez votre méthode de paiement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Card Payment */}
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'CARD'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentMethod === 'CARD' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-5 h-5 ${
                    paymentMethod === 'CARD' ? 'text-emerald-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Carte bancaire</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">VISA</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">MC</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Visa, Mastercard</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'CARD' ? 'border-emerald-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </div>
              </div>

              {/* Card fields */}
              {paymentMethod === 'CARD' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3 pl-13"
                >
                  <div>
                    <Label className="text-xs text-gray-500">Numéro de carte</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="mt-1 font-mono"
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Date d&apos;expiration</Label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        className="mt-1 font-mono"
                        maxLength={5}
                      />
                      {errors.cardExpiry && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardExpiry}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">CVV</Label>
                      <Input
                        value={cardCVV}
                        onChange={(e) => handleCVVChange(e.target.value)}
                        placeholder="123"
                        className="mt-1 font-mono"
                        maxLength={3}
                        type="password"
                      />
                      {errors.cardCVV && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardCVV}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Nom sur la carte</Label>
                    <Input
                      value={cardName}
                      onChange={(e) => { setCardName(e.target.value); if (errors.cardName) setErrors({ ...errors, cardName: '' }) }}
                      placeholder="Nom complet"
                      className="mt-1"
                    />
                    {errors.cardName && (
                      <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </button>

            {/* Orange Money */}
            <button
              onClick={() => setPaymentMethod('ORANGE_MONEY')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'ORANGE_MONEY'
                  ? 'border-orange-500 bg-orange-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentMethod === 'ORANGE_MONEY' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <Phone className={`w-5 h-5 ${
                    paymentMethod === 'ORANGE_MONEY' ? 'text-orange-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Orange Money</span>
                  <p className="text-xs text-gray-500">Paiement par Orange Money</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'ORANGE_MONEY' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                </div>
              </div>

              {paymentMethod === 'ORANGE_MONEY' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pl-13"
                >
                  <Label className="text-xs text-gray-500">Numéro Orange Money</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 font-medium">+237</span>
                    <Input
                      value={mobileNumber}
                      onChange={(e) => handleMobileNumberChange(e.target.value)}
                      placeholder="6XX XXX XXX"
                      className="font-mono"
                      maxLength={9}
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>
                  )}
                  <p className="text-xs text-orange-600 mt-2">
                    💡 Vous recevrez une notification de confirmation sur votre téléphone Orange.
                  </p>
                </motion.div>
              )}
            </button>

            {/* MTN Mobile Money */}
            <button
              onClick={() => setPaymentMethod('MTN_MONEY')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'MTN_MONEY'
                  ? 'border-yellow-500 bg-yellow-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentMethod === 'MTN_MONEY' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Phone className={`w-5 h-5 ${
                    paymentMethod === 'MTN_MONEY' ? 'text-yellow-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">MTN Mobile Money</span>
                  <p className="text-xs text-gray-500">Paiement par MTN MoMo</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'MTN_MONEY' ? 'border-yellow-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'MTN_MONEY' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                </div>
              </div>

              {paymentMethod === 'MTN_MONEY' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pl-13"
                >
                  <Label className="text-xs text-gray-500">Numéro MTN Mobile Money</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 font-medium">+237</span>
                    <Input
                      value={mobileNumber}
                      onChange={(e) => handleMobileNumberChange(e.target.value)}
                      placeholder="6XX XXX XXX"
                      className="font-mono"
                      maxLength={9}
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>
                  )}
                  <p className="text-xs text-yellow-600 mt-2">
                    💡 Vous recevrez une notification de confirmation sur votre téléphone MTN.
                  </p>
                </motion.div>
              )}
            </button>

            {/* PayPal */}
            <button
              onClick={() => setPaymentMethod('PAYPAL')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'PAYPAL'
                  ? 'border-amber-500 bg-amber-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentMethod === 'PAYPAL' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <Wallet className={`w-5 h-5 ${
                    paymentMethod === 'PAYPAL' ? 'text-amber-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">PayPal</span>
                  <p className="text-xs text-gray-500">Paiement sécurisé par PayPal</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'PAYPAL' ? 'border-amber-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'PAYPAL' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
              </div>

              {paymentMethod === 'PAYPAL' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pl-13"
                >
                  <Label className="text-xs text-gray-500">Email PayPal</Label>
                  <Input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => handlePaypalEmailChange(e.target.value)}
                    placeholder="votre@email.com"
                    className="mt-1"
                  />
                  {errors.paypalEmail && (
                    <p className="text-xs text-red-500 mt-1">{errors.paypalEmail}</p>
                  )}
                  <p className="text-xs text-amber-600 mt-2">
                    💡 Vous serez redirigé vers PayPal pour confirmer le paiement.
                  </p>
                </motion.div>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={processing || !currentUser}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Confirmer le paiement — {priceFormatter.format(totalAmount)} FCFA
              </>
            )}
          </Button>

          {!currentUser && (
            <p className="text-center text-sm text-red-500">
              <button onClick={() => navigateTo('login')} className="underline">
                Connectez-vous
              </button>{' '}
              pour effectuer un paiement
            </p>
          )}

          {/* Security footer */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Sécurisé et protégé</span>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              La plateforme prélève 2% sur chaque transaction pour assurer la sécurité de vos paiements.
            </p>
            <p className="text-[11px] text-gray-400">
              En effectuant ce paiement, vous acceptez nos{' '}
              <button className="text-emerald-600 hover:underline">conditions d&apos;utilisation</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
