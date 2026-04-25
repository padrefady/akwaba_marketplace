'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore, type Conversation, type Message } from '@/components/agryva/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageCircle,
  Search,
  Send,
  ChevronLeft,
  ExternalLink,
  Check,
  CheckCheck,
  Circle,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

const priceFormatter = new Intl.NumberFormat('fr-FR')

function formatMessageTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return format(date, 'HH:mm', { locale: fr })
    }
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier ' + format(date, 'HH:mm', { locale: fr })
    }
    return format(date, 'd MMM HH:mm', { locale: fr })
  } catch {
    return dateStr
  }
}

function formatConversationTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return format(date, 'HH:mm', { locale: fr })
    }
    return format(date, 'd MMM', { locale: fr })
  } catch {
    return dateStr
  }
}

export default function MessagesPage() {
  const { currentUser, navigateTo, pageParams } = useAppStore()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [otherUser, setOtherUser] = useState<any>(null)
  const [typing, setTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [socket, setSocket] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const userId = currentUser?.id

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/agryva/messages/conversations?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setConversations(json.data || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des conversations')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (!userId) return
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/agryva/messages/conversation/${convId}?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setMessages(json.data || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [userId])

  // Mark messages as read
  const markAsRead = useCallback(async (convId: string) => {
    if (!userId) return
    try {
      await fetch(`/api/agryva/messages/read/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    } catch {
      // silent
    }
  }, [userId])

  // Initialize Socket.io
  useEffect(() => {
    if (!userId) return

    let mounted = true
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client')
        const socketInstance = io('/?XTransformPort=3003', {
          transports: ['websocket', 'polling'],
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        })

        socketInstance.on('connect', () => {
          if (mounted) {
            socketInstance.emit('join', userId)
          }
        })

        socketInstance.on('new_message', (msg: any) => {
          if (!mounted) return
          if (selectedConv && msg.conversationId === selectedConv.id) {
            setMessages((prev) => [...prev, msg])
            // Mark as read
            markAsRead(msg.conversationId)
          }
          // Refresh conversations to update last message
          fetchConversations()
        })

        socketInstance.on('user_typing', (data: { userId: string; conversationId: string }) => {
          if (!mounted) return
          if (selectedConv && data.conversationId === selectedConv.id && data.userId !== userId) {
            setTyping(true)
          }
        })

        socketInstance.on('user_stop_typing', (data: { conversationId: string }) => {
          if (!mounted) return
          if (selectedConv && data.conversationId === selectedConv.id) {
            setTyping(false)
          }
        })

        socketInstance.on('messages_read', (data: { conversationId: string }) => {
          if (!mounted) return
          if (selectedConv && data.conversationId === selectedConv.id) {
            setMessages((prev) =>
              prev.map((m) =>
                m.senderId === userId ? { ...m, isRead: true } : m
              )
            )
          }
        })

        if (mounted) setSocket(socketInstance)
      } catch {
        // Socket not available, continue without
      }
    }

    initSocket()

    return () => {
      mounted = false
      if (socket) socket.disconnect()
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Select conversation
  const handleSelectConv = (conv: any) => {
    setSelectedConv(conv)
    setOtherUser(conv.otherUser)
    setShowMobileChat(true)
    fetchMessages(conv.id)
    markAsRead(conv.id)
  }

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !userId || sending) return
    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    // Stop typing
    if (socket && selectedConv) {
      socket.emit('stop_typing', { conversationId: selectedConv.id, userId })
    }

    try {
      // Save via API
      const res = await fetch('/api/agryva/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          senderId: userId,
          receiverId: otherUser?.id,
          content,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages((prev) => [...prev, json.data])
        fetchConversations()
      } else {
        toast.error(json.error || 'Erreur lors de l\'envoi')
        setNewMessage(content)
      }
    } catch {
      toast.error('Erreur serveur')
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  // Typing handlers
  const handleTyping = () => {
    if (socket && selectedConv) {
      socket.emit('typing', { conversationId: selectedConv.id, userId })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: selectedConv.id, userId })
      }, 2000)
    }
  }

  const handleStopTyping = () => {
    if (socket && selectedConv) {
      socket.emit('stop_typing', { conversationId: selectedConv.id, userId })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv: any) =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-96 rounded-xl" />
          <div className="md:col-span-2">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-7 h-7 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Left Panel - Conversations List */}
        <div className={`${showMobileChat ? 'hidden md:block' : 'block'} border rounded-xl bg-white overflow-hidden flex flex-col`}>
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucune conversation</h3>
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'Aucun résultat trouvé.' : 'Commencez une conversation en contactant un vendeur.'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv: any) => {
                  const isSelected = selectedConv?.id === conv.id
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-emerald-50 border-l-3 border-l-emerald-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={conv.otherUser?.avatar} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                            {(conv.otherUser?.name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {conv.otherUser?.name || 'Utilisateur'}
                            </span>
                            <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                              {conv.lastMessage && formatConversationTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {conv.lastMessage.senderId === userId && (
                                <span className="text-gray-400">Vous : </span>
                              )}
                              {conv.lastMessage.content}
                            </p>
                          )}
                          {/* Ad card */}
                          {conv.ad && (
                            <div className="flex items-center gap-2 mt-1.5 p-1.5 rounded bg-gray-50">
                              {conv.ad.images && conv.ad.images.length > 0 && (
                                <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                  <img
                                    src={conv.ad.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-700 truncate">
                                  {conv.ad.title}
                                </p>
                                {conv.ad.price && (
                                  <p className="text-[10px] text-emerald-600 font-medium">
                                    {priceFormatter.format(conv.ad.price)} FCFA
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel - Chat Area */}
        <div className={`${!showMobileChat ? 'hidden md:flex' : 'flex'} md:col-span-2 border rounded-xl bg-white overflow-hidden flex-col`}>
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-sm text-gray-400">
                  Choisissez une conversation dans la liste pour commencer à discuter.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden mr-1"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={otherUser?.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                      {(otherUser?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{otherUser?.name}</p>
                    <div className="flex items-center gap-1">
                      {otherUser?.isOnline ? (
                        <>
                          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                          <span className="text-xs text-emerald-600">En ligne</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Hors ligne</span>
                      )}
                    </div>
                  </div>
                </div>
                {selectedConv.ad && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigateTo('ad-detail', { adId: selectedConv.ad.id })}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Voir l&apos;annonce
                  </Button>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-3">
                {loadingMessages ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-10 w-48 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">
                      Commencez la conversation
                    </h3>
                    <p className="text-sm text-gray-400">Envoyez le premier message pour discuter.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg: any) => {
                      const isMine = msg.senderId === userId
                      const isSystem = msg.type === 'SYSTEM'
                      return (
                        <div key={msg.id}>
                          {isSystem ? (
                            <div className="flex justify-center my-3">
                              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {msg.content}
                              </span>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                              <div
                                className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl ${
                                  isMine
                                    ? 'bg-emerald-600 text-white rounded-br-md'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                                <div
                                  className={`flex items-center justify-end gap-1.5 mt-1 ${
                                    isMine ? 'text-emerald-100' : 'text-gray-400'
                                  }`}
                                >
                                  <span className="text-[10px]">
                                    {formatMessageTime(msg.createdAt)}
                                  </span>
                                  {isMine && (
                                    msg.isRead
                                      ? <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                                      : <Check className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )
                    })}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {typing && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Typing status */}
              {typing && (
                <div className="px-4 py-1">
                  <span className="text-xs text-gray-400 italic">
                    {otherUser?.name || 'L\'utilisateur'} est en train d&apos;écrire...
                  </span>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t px-3 py-3 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    onFocus={() => handleTyping()}
                    onBlur={() => handleStopTyping()}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message..."
                    rows={1}
                    className="flex-1 resize-none border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[40px] max-h-[120px]"
                    style={{
                      height: 'auto',
                      minHeight: '40px',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 w-10 p-0 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
