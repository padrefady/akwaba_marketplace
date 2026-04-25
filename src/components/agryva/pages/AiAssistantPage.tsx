'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Bot,
  Send,
  Crown,
  Lock,
  Sprout,
  Loader2,
  User,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CloudRain,
  Lightbulb,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== INTERFACES ====================
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_ACTIONS = [
  { label: 'Conseils maïs', icon: Sprout, prompt: 'Donne-moi des conseils pour cultiver le maïs au Cameroun' },
  { label: 'Prix du marché', icon: TrendingUp, prompt: 'Quels sont les prix actuels des produits agricoles au Cameroun ?' },
  { label: 'Saison des pluies', icon: CloudRain, prompt: 'Quand commence la saison des pluies au Cameroun et comment se préparer ?' },
  { label: 'Techniques modernes', icon: Lightbulb, prompt: 'Quelles sont les techniques agricoles modernes recommandées ?' },
]

// ==================== TYPING INDICATOR ====================
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ==================== CHAT MESSAGE ====================
function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-orange-500' : 'bg-emerald-600'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-emerald-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  )
}

// ==================== VIP OVERLAY ====================
function VipOverlay() {
  const { navigateTo } = useAppStore()

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Assistant agryvaBot
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Connectez-vous pour accéder à l&apos;assistant agricole IA.
              Obtenez des conseils personnalisés, des recommandations de culture
              et des informations sur le marché agricole camerounais.
            </p>
            <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-amber-800 text-sm mb-2">Avantages VIP :</h3>
              <ul className="space-y-1.5 text-sm text-amber-700">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Conseils agricoles personnalisés par IA
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Recommandations de culture adaptées
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Analyse des prix du marché en temps réel
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Prévisions météorologiques agricoles
                </li>
              </ul>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
              onClick={() => navigateTo('login')}
            >
              <Bot className="h-4 w-4 mr-2" />
              Se connecter pour utiliser l&apos;assistant IA
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ==================== MAIN AI ASSISTANT PAGE ====================
export default function AiAssistantPage() {
  const { currentUser, navigateTo } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // AI chatbot accessible à tous les utilisateurs connectés
  const isVip = currentUser?.plan === 'VIP'
  const canAccess = !!currentUser

  // Load chat history (simulate with welcome message)
  useEffect(() => {
    if (canAccess && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Bonjour ! Je suis agryvaBot, votre assistant agricole. Comment puis-je vous aider aujourd\'hui ? 🌾',
          timestamp: new Date().toISOString(),
        },
      ])
      setIsLoading(false)
    }
  }, [canAccess, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSending])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !currentUser || isSending) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputMessage('')
      setIsSending(true)

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      try {
        const res = await fetch('/api/agryva/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            message: text.trim(),
          }),
        })

        const json = await res.json()

        if (json.success) {
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: json.data?.response || json.data?.message || 'Je n\'ai pas pu générer une réponse. Veuillez réessayer.',
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, aiMessage])
        } else {
          toast.error(json.error || 'Erreur lors de la communication avec l\'assistant')
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-error-${Date.now()}`,
              role: 'assistant',
              content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } catch {
        toast.error('Erreur de connexion')
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-error-${Date.now()}`,
            role: 'assistant',
            content: 'Je suis temporairement indisponible. Veuillez réessayer dans un instant.',
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsSending(false)
      }
    },
    [currentUser, isSending]
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputMessage(e.target.value)
    // Auto-resize
    const target = e.target
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
  }

  function handleQuickAction(prompt: string) {
    sendMessage(prompt)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">Assistant agryvaBot</h1>
                  <Badge className={`${isVip ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} hover:opacity-90 border-0 text-xs`}>
                    {isVip ? <><Crown className="h-3 w-3 mr-0.5" />VIP</> : 'IA'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Votre assistant agricole virtuel
                </p>
              </div>
            </div>

            {!currentUser && (
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                onClick={() => navigateTo('login')}
              >
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Content */}
      {!currentUser ? (
        <VipOverlay />
      ) : (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto px-4 py-4">
              {/* Messages */}
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>{isSending && <TypingIndicator />}</AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick actions + Input area */}
          <div className="border-t border-gray-200 bg-white shrink-0">
            <div className="max-w-4xl mx-auto px-4 py-3">
              {/* Quick action chips */}
              {messages.length <= 1 && !isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mb-3"
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                      <action.icon className="h-3.5 w-3.5" />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Input area */}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question agricole..."
                    rows={1}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent max-h-[120px] placeholder:text-gray-400"
                    disabled={isSending}
                  />
                </div>
                <Button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isSending}
                  className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shrink-0 p-0 flex items-center justify-center"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
