'use client'

import { Heart } from 'lucide-react'
import { useAppStore } from '@/components/agryva/store'
import { offlineStorage } from '@/lib/offline-storage'
import { useOffline } from '@/hooks/use-offline'
import { useState } from 'react'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  adId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({
  adId,
  size = 'md',
  showLabel = false,
  className = '',
}: FavoriteButtonProps) {
  const { currentUser } = useAppStore()
  const { isOnline } = useOffline()
  const [isFav, setIsFav] = useState(() => offlineStorage.isFavorite(adId))
  const [loading, setLoading] = useState(false)

  const toggleFavorite = async () => {
    if (!currentUser) {
      toast.error('Connectez-vous pour ajouter aux favoris')
      return
    }
    setLoading(true)

    if (isOnline) {
      try {
        await fetch('/api/agryva/favorites/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, adId }),
        })
      } catch {
        // Silently continue — we still update locally
      }
    } else {
      // Queue the action for offline sync
      offlineStorage.addOfflineAction({
        type: 'TOGGLE_FAVORITE',
        payload: { userId: currentUser.id, adId },
      })
    }

    const newState = !isFav
    setIsFav(newState)

    if (newState) {
      offlineStorage.addFavorite(adId)
      toast.success('Ajouté aux favoris')
    } else {
      offlineStorage.removeFavorite(adId)
      toast.success('Retiré des favoris')
    }

    setLoading(false)
  }

  const sizeClasses: Record<string, string> = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }
  const iconSizes: Record<string, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite()
      }}
      disabled={loading}
      className={`group flex items-center gap-1.5 rounded-full transition-colors ${
        isFav
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-400'
      } ${className}`}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`${iconSizes[size]} ${isFav ? 'fill-current' : ''} transition-transform group-hover:scale-110`}
      />
      {showLabel && (
        <span className="text-xs font-medium">
          {isFav ? 'Sauvegardé' : 'Favoris'}
        </span>
      )}
    </button>
  )
}
