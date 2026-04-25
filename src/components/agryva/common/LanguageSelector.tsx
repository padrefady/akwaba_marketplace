'use client'

import { useState } from 'react'
import { Languages, X, Globe } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface LanguageSelectorProps {
  /** Visual variant */
  variant?: 'header' | 'sidebar' | 'default'
  /** Trigger button label override */
  triggerLabel?: string
  /** Trigger button size */
  size?: 'sm' | 'default'
}

export function LanguageSelector({ variant = 'default', triggerLabel, size = 'sm' }: LanguageSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const { t, lang, setLang } = useT()

  const currentLangLabel = lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : lang

  const isHeader = variant === 'header'
  const isSmall = isHeader || size === 'sm'

  return (
    <div className="w-full">
      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:bg-emerald-200 ${isSmall ? 'h-8 text-xs px-2.5' : 'h-9'}`}
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{triggerLabel || currentLangLabel}</span>
        {expanded ? (
          <span className="text-[10px]">▲</span>
        ) : (
          <span className="text-[10px]">▼</span>
        )}
      </button>

      {/* Liste dépliable */}
      {expanded && (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-white shadow-lg overflow-hidden">
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Languages className="h-4 w-4" />
              {t('nav.translate')}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Liste scrollable */}
          <div className="overflow-y-auto max-h-[280px]">
            {/* Langues locales */}
            <div className="px-3 pt-2 pb-1">
              <p className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                <Globe className="h-3 w-3" />
                {t('nav.translateLangs')}
              </p>
              {localLangs.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-emerald-50 active:bg-emerald-100 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
                >
                  <span className="text-lg shrink-0">{l.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-medium truncate">{l.label}</span>
                    <span className="block text-[10px] text-gray-400">{l.region}</span>
                  </div>
                  {lang === l.code && <span className="text-emerald-600 text-xs">✓</span>}
                </button>
              ))}
            </div>

            {/* Séparateur */}
            <div className="mx-3 h-px bg-gray-100" />

            {/* Langues internationales */}
            <div className="px-3 pt-1 pb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t('nav.internationalLangs')}
              </p>
              {internationalLangs.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-emerald-50 active:bg-emerald-100 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
                >
                  <span className="text-lg shrink-0">{l.flag}</span>
                  <span className="flex-1 text-xs font-medium">{l.label}</span>
                  {lang === l.code && <span className="text-emerald-600 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Inline language data to avoid circular imports
const localLangs = [
  { code: 'pidgin', label: 'Pidgin English', flag: '🇨🇲', region: 'National' },
  { code: 'fulfulde', label: 'Fulfulde (Peul)', flag: '🇨🇲', region: 'Nord / Adamaoua' },
  { code: 'ewondo', label: 'Ewondo (Beti)', flag: '🇨🇲', region: 'Centre / Sud' },
  { code: 'bamileke', label: "Bamileke (Fe'fe')", flag: '🇨🇲', region: 'Ouest' },
  { code: 'medumba', label: 'Medumba (Bafang)', flag: '🇨🇲', region: 'Ouest' },
  { code: 'ghomala', label: "Ghomala' (Bafoussam)", flag: '🇨🇲', region: 'Ouest' },
  { code: 'duala', label: 'Duala', flag: '🇨🇲', region: 'Littoral' },
  { code: 'bassa', label: 'Bassa', flag: '🇨🇲', region: 'Littoral' },
  { code: 'bakoko', label: 'Bakoko', flag: '🇨🇲', region: 'Littoral' },
  { code: 'bamoun', label: 'Bamoun', flag: '🇨🇲', region: 'Ouest (Foumban)' },
  { code: 'mafa', label: 'Mafa', flag: '🇨🇲', region: 'Extrême-Nord' },
  { code: 'mofu', label: 'Mofu-Gudur', flag: '🇨🇲', region: 'Extrême-Nord' },
  { code: 'kapsiki', label: 'Kapsiki (Malgwa)', flag: '🇨🇲', region: 'Extrême-Nord' },
  { code: 'tikar', label: 'Tikar', flag: '🇨🇲', region: 'Nord-Ouest' },
  { code: 'kom', label: 'Kom', flag: '🇨🇲', region: 'Nord-Ouest' },
]

const internationalLangs = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
]
