'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Sparkles,
  Crown,
  Star,
  Zap,
  Loader2,
  ArrowLeft,
  Leaf,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type PaymentPlan } from '@/components/agryva/store'
import { toast } from 'sonner'

const planIcons: Record<string, React.ElementType> = {
  FREE: Leaf,
  PREMIUM: Star,
  VIP: Crown,
}

const planGradients: Record<string, string> = {
  FREE: 'from-gray-50 to-gray-100 border-gray-200',
  PREMIUM: 'from-emerald-50 to-green-50 border-emerald-300',
  VIP: 'from-amber-50 to-yellow-50 border-amber-300',
}

const planButtonStyles: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  PREMIUM: 'bg-emerald-600 text-white hover:bg-emerald-700',
  VIP: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600',
}

export function PricingPage() {
  const { currentUser, navigateTo } = useAppStore()
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/agryva/payments/plans')
        const json = await res.json()
        if (json.success) setPlans(json.data)
      } catch {
        toast.error('Erreur lors du chargement des offres')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const handleSelectPlan = (planName: string) => {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour souscrire à une offre')
      navigateTo('login')
      return
    }
    navigateTo('payment', { plan: planName })
  }

  const currentPlan = currentUser?.plan || 'FREE'

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigateTo('home')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <Sparkles className="h-4 w-4" />
          Offres et tarifs
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choisissez votre offre
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-gray-500">
          Trouvez le plan qui correspond le mieux à vos besoins. Changez ou annulez à tout moment.
        </p>
      </motion.div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-6">
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="mb-1 h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-6 h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const IconComp = planIcons[plan.name] || Leaf
            const isCurrent = currentPlan === plan.name

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all hover:shadow-lg bg-gradient-to-b ${planGradients[plan.name] || 'from-white to-white border-gray-200'} ${
                    plan.name === 'PREMIUM' ? 'ring-2 ring-emerald-500 md:-translate-y-2' : ''
                  } ${plan.name === 'VIP' ? 'ring-2 ring-amber-400' : ''}`}
                >
                  {/* Badges */}
                  <div className="absolute right-4 top-4 flex flex-col gap-1">
                    {plan.isPopular && (
                      <Badge className="bg-emerald-600 text-white">
                        <Zap className="mr-1 h-3 w-3" /> Populaire
                      </Badge>
                    )}
                    {plan.name === 'VIP' && (
                      <Badge className="bg-amber-500 text-white">
                        <Crown className="mr-1 h-3 w-3" /> Best Value
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="outline" className="bg-white/80">
                        Plan actuel
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          plan.name === 'VIP'
                            ? 'bg-amber-100 text-amber-600'
                            : plan.name === 'PREMIUM'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {plan.displayName || plan.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString('fr-FR')}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-gray-500">
                            FCFA/mois
                          </span>
                        )}
                      </div>
                      {plan.maxAds > 0 ? (
                        <p className="mt-1 text-xs text-gray-500">
                          Jusqu&apos;à {plan.maxAds === 999 ? 'illimité' : `${plan.maxAds} annonces`}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Annonces illimitées
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              plan.name === 'VIP'
                                ? 'text-amber-500'
                                : plan.name === 'PREMIUM'
                                  ? 'text-emerald-500'
                                  : 'text-gray-400'
                            }`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full ${planButtonStyles[plan.name] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleSelectPlan(plan.name)}
                      disabled={isCurrent}
                    >
                      {isCurrent
                        ? 'Plan actuel'
                        : plan.name === 'VIP' ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Obtenir VIP
                          </>
                        ) : (
                          `Obtenir ${plan.displayName || plan.name}`
                        )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-gray-400"
      >
        Tous les prix sont en Franc CFA (FCFA). Paiement via Orange Money ou MTN Mobile Money.
        <br />
        Vous pouvez changer de plan ou annuler à tout moment.
      </motion.p>
    </div>
  )
}
