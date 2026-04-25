'use client'

import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '@/lib/offline-storage'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  })
  const [pendingActions, setPendingActions] = useState(() => {
    if (typeof window === 'undefined') return 0
    return offlineStorage.getPendingActionCount()
  })
  const [syncing, setSyncing] = useState(false)

  const refreshPendingCount = useCallback(() => {
    setPendingActions(offlineStorage.getPendingActionCount())
  }, [])

  const syncPendingActions = useCallback(async () => {
    const actions = offlineStorage.getOfflineActions().filter((a) => !a.synced)
    if (actions.length === 0) return

    setSyncing(true)

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'TOGGLE_FAVORITE':
            await fetch('/api/agryva/favorites/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            })
            break
          case 'CREATE_AD':
            await fetch('/api/agryva/ads/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            })
            break
          case 'SEND_MESSAGE':
            await fetch('/api/agryva/messages/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            })
            break
          case 'UPDATE_PROFILE':
            await fetch('/api/agryva/profile/', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            })
            break
        }
        offlineStorage.markActionSynced(action.id)
      } catch {
        // Will retry next time the user comes back online
      }
    }

    offlineStorage.clearSyncedActions()
    refreshPendingCount()
    setSyncing(false)
  }, [refreshPendingCount])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Track last visit
    offlineStorage.setLastVisit()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncPendingActions, refreshPendingCount])

  return { isOnline, pendingActions, syncing, syncPendingActions, refreshPendingCount }
}
