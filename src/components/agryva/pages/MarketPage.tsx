'use client'

import { useState } from 'react'
import { useAppStore } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface MarketPrediction {
  product: string
  currentPrice: number
  predictedPrice: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  bestRegion: string
  season: string
  reason: string
}

interface MarketData {
  predictions: MarketPrediction[]
  generalAdvice: string
  analysisDate: string
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-5 w-5 text-green-600" />
    case 'down':
      return <ArrowDownRight className="h-5 w-5 text-red-500" />
    case 'stable':
      return <Minus className="h-5 w-5 text-gray-400" />
  }
}

function TrendBadge({ trend, percentage }: { trend: 'up' | 'down' | 'stable'; percentage: number }) {
  const config = {
    up: { bg: 'bg-green-100 text-green-700', label: `+${percentage}%` },
    down: { bg: 'bg-red-100 text-red-600', label: `-${percentage}%` },
    stable: { bg: 'bg-gray-100 text-gray-600', label: `${percentage}%` },
  }
  const c = config[trend]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg}`}>
      {trend === 'up' && <TrendingUp className="h-3 w-3" />}
      {trend === 'down' && <TrendingDown className="h-3 w-3" />}
      {trend === 'stable' && <Minus className="h-3 w-3" />}
      {c.label}
    </span>
  )
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function PredictionCard({ prediction, index }: { prediction: MarketPrediction; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all h-full">
        <CardContent className="p-5 space-y-4">
          {/* Header: product name + trend */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                prediction.trend === 'up' ? 'bg-green-100' : prediction.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <TrendArrow trend={prediction.trend} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{prediction.product}</h3>
                <TrendBadge trend={prediction.trend} percentage={prediction.trendPercentage} />
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Prix actuel</span>
              <span className="text-sm font-medium text-gray-700">{formatFCFA(prediction.currentPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Prix prédit</span>
              <span className={`text-sm font-bold ${
                prediction.trend === 'up' ? 'text-green-700' : prediction.trend === 'down' ? 'text-red-600' : 'text-gray-700'
              }`}>
                {formatFCFA(prediction.predictedPrice)}
              </span>
            </div>
            {/* Visual price bar */}
            <div className="relative h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                  prediction.trend === 'up' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  prediction.trend === 'down' ? 'bg-gradient-to-r from-red-400 to-orange-400' :
                  'bg-gradient-to-r from-gray-300 to-gray-400'
                }`}
                style={{ width: `${Math.min(Math.max((prediction.predictedPrice / Math.max(prediction.currentPrice, 1)) * 100, 10), 100)}%` }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Meilleure région : <strong className="text-gray-900">{prediction.bestRegion}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span>Saison : <strong className="text-gray-900">{prediction.season}</strong></span>
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              <Lightbulb className="h-3 w-3 inline-block text-amber-500 mr-1 mb-0.5" />
              {prediction.reason}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}

export default function MarketPage() {
  const { currentUser, navigateTo } = useAppStore()
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyzeMarket() {
    if (!currentUser) {
      toast.error('Veuillez vous connecter pour analyser le marché')
      navigateTo('login')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/agryva/ai/market-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setMarketData(json.data)
        toast.success('Analyse du marché terminée !')
      } else {
        toast.error(json.error || 'Erreur lors de l\'analyse')
      }
    } catch {
      toast.error('Erreur réseau lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Prédictions du Marché
              </h1>
              <p className="text-sm text-gray-500">
                Analyses IA des tendances des prix agricoles au Cameroun
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Analyze Button */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Analyse intelligente</h2>
                <p className="text-sm text-gray-600">
                  Obtenez des prédictions sur les prix des produits agricoles basées sur les tendances du marché, les saisons et les régions.
                </p>
              </div>
              <Button
                onClick={handleAnalyzeMarket}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-orange-500 hover:from-emerald-700 hover:to-orange-600 text-white whitespace-nowrap shrink-0"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Analyser le marché
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {!loading && marketData && (
          <>
            {/* Predictions Grid */}
            {marketData.predictions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketData.predictions.map((prediction, index) => (
                  <PredictionCard key={prediction.product} prediction={prediction} index={index} />
                ))}
              </div>
            )}

            {/* General Advice */}
            {marketData.generalAdvice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-orange-500" />
                      Conseil général du marché
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{marketData.generalAdvice}</p>
                    {marketData.analysisDate && (
                      <p className="text-xs text-gray-400 mt-3">
                        Analyse générée le {marketData.analysisDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !marketData && (
          <div className="text-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
              <BarChart3 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune analyse encore</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Cliquez sur &quot;Analyser le marché&quot; pour obtenir des prédictions sur les tendances des prix des produits agricoles au Cameroun.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
