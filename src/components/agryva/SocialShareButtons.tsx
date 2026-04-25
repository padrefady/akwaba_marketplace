'use client'

import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SocialShareButtonsProps {
  title: string
  url?: string
  className?: string
}

export function SocialShareButtons({ title, url, className = '' }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = `Découvrez : ${title} sur agryva - La plateforme agricole du Cameroun`

  const shareLinks = [
    {
      name: 'WhatsApp',
      color: 'bg-green-500 hover:bg-green-600',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Twitter',
      color: 'bg-gray-800 hover:bg-gray-900',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Lien copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Share2 className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-500">Partager :</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${link.color} transition-colors`}
          title={link.name}
        >
          <span className="text-sm">{link.icon}</span>
        </a>
      ))}
      <button
        onClick={copyLink}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
        title="Copier le lien"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
