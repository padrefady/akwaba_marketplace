'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Notification } from '@/components/agryva/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  MessageCircle,
  CheckCircle,
  ShoppingBag,
  Star,
  Banknote,
  AlertCircle,
  Bell,
  BellOff,
  Trash2,
  CheckCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

const NOTIFICATION_ICONS: Record<string, { icon: any; color: string; bgColor: string }> = {
  NEW_MESSAGE: { icon: MessageCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  AD_APPROVED: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  AD_SOLD: { icon: ShoppingBag, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  NEW_REVIEW: { icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  PAYMENT_RECEIVED: { icon: Banknote, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  PLAN_EXPIRED: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  SYSTEM: { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-50' },
}

function getNotificationConfig(type: string) {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.SYSTEM
}

function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

export default function NotificationsPage() {
  const { currentUser, navigateTo, setUnreadNotificationCount } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const userId = currentUser?.id

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/agryva/notifications/?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data || [])
        // Update unread count
        const unreadCount = (json.data || []).filter((n: Notification) => !n.isRead).length
        setUnreadNotificationCount(unreadCount)
      }
    } catch {
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoading(false)
    }
  }, [userId, setUnreadNotificationCount])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/agryva/notifications/read/${notificationId}`, {
        method: 'PUT',
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      // Update unread count
      const unreadCount = notifications.filter((n) => n.id !== notificationId && !n.isRead).length
      setUnreadNotificationCount(unreadCount)
    } catch {
      // silent
    }
  }

  const handleMarkAllRead = async () => {
    if (!userId) return
    setMarkingAll(true)
    try {
      await fetch(`/api/agryva/notifications/read-all?userId=${userId}`, {
        method: 'PUT',
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadNotificationCount(0)
      toast.success('Toutes les notifications ont été marquées comme lues')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!userId) return
    // Delete all by marking them as read and clearing state
    setNotifications([])
    setUnreadNotificationCount(0)
    toast.success('Toutes les notifications ont été supprimées')
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Navigate if there's a link
    if (notification.link) {
      // Parse simple link format
      const link = notification.link
      if (link.includes('messages')) {
        navigateTo('messages')
      } else if (link.includes('ads')) {
        navigateTo('ads')
      } else if (link.includes('transactions') || link.includes('dashboard')) {
        navigateTo('profile')
      } else {
        navigateTo('home')
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              {markingAll ? '...' : 'Tout marquer comme lu'}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Supprimer tout
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="pt-16 text-center">
              <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune notification</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Vous n&apos;avez pas encore de notifications. Elles apparaîtront ici lorsque vous recevrez des messages, des avis ou des paiements.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => {
              const config = getNotificationConfig(notification.type)
              const IconComponent = config.icon

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      !notification.isRead
                        ? 'border-l-3 border-l-emerald-500 bg-emerald-50/30'
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                {notification.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.isRead && (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="text-[11px] text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.link && (
                              <span className="text-[11px] text-emerald-600 ml-1">→ Voir</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
