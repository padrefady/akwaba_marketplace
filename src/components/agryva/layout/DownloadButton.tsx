'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, CheckCircle, Loader2 } from 'lucide-react'

export function DownloadButton() {
  const [showInfo, setShowInfo] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/download')
      if (!res.ok) throw new Error('Erreur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'agryva-project.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch {
      alert('Erreur de téléchargement. Réessayez.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        onClick={() => setShowInfo(!showInfo)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-2xl cursor-pointer"
        title="Télécharger le projet"
      >
        {done ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Download className="w-6 h-6" />
        )}
      </motion.button>

      {/* Info popup */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-22 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-72"
          >
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-gray-900 text-base mb-2">
              📦 Télécharger Agryva
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Code source complet du projet prêt pour Vercel. Contient tout le code, configs et assets.
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Préparation...
                </>
              ) : done ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Téléchargé !
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Télécharger le ZIP
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              ~2.4 MB • Projet Next.js complet
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
