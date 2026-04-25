'use client'

import { useOffline } from '@/hooks/use-offline'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'

export function OfflineBanner() {
  const { isOnline, pendingActions, syncing, syncPendingActions } = useOffline()

  if (isOnline && pendingActions === 0) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[90%] max-w-md">
      {!isOnline ? (
        <div className="flex items-center gap-3 w-full rounded-xl bg-amber-500 px-4 py-3 text-white shadow-lg">
          <WifiOff className="h-5 w-5 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Mode hors ligne</p>
            <p className="text-xs text-amber-100">
              Vos actions seront synchronisées automatiquement
            </p>
          </div>
        </div>
      ) : pendingActions > 0 ? (
        <div className="flex items-center gap-3 w-full rounded-xl bg-amber-500/90 backdrop-blur-sm px-4 py-3 text-white shadow-lg">
          {syncing ? (
            <RefreshCw className="h-5 w-5 shrink-0 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {syncing
                ? 'Synchronisation en cours…'
                : `${pendingActions} action(s) en attente`}
            </p>
            <p className="text-xs text-amber-100">
              Vos modifications locales seront envoyées au serveur
            </p>
          </div>
          {!syncing && (
            <button
              onClick={syncPendingActions}
              className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Synchroniser
              </span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
