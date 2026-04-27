'use client'

import { useState } from 'react'
import { Languages, X, Globe } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface HeaderTranslateProps {
  /** Compact mode for mobile header */
  compact?: boolean
}

export function HeaderTranslate({ compact = false }: HeaderTranslateProps) {
  const [expanded, setExpanded] = useState(false)
  const { lang, setLang } = useT()

  const currentLangLabel = lang === 'fr' ? 'FR' : lang === 'en' ? 'EN' : lang.toUpperCase()

  // Compact mode: circle button with fixed overlay panel (for mobile header)
  // Uses fixed positioning to avoid clipping by header's backdrop-blur stacking context
  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          title={currentLangLabel}
        >
          <Languages className="h-4 w-4" />
        </button>

        {expanded && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setExpanded(false)}
            />
            {/* Panel - fixed positioned to escape header stacking context */}
            <div className="relative z-10 w-full max-w-sm max-h-[80vh] rounded-2xl border border-emerald-200 bg-white shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Languages className="h-5 w-5" />
                  Langues
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 overscroll-contain">
                <div className="px-4 pt-3 pb-2">
                  <p className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
                    <Globe className="h-3 w-3" />
                    Langues locales du Cameroun
                  </p>
                  {localLangs.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="text-lg shrink-0">{l.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-medium truncate">{l.label}</span>
                        <span className="block text-[10px] text-gray-400">{l.region}</span>
                      </div>
                      {lang === l.code && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="mx-4 h-px bg-gray-100" />
                <div className="px-4 pt-2 pb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Internationales</p>
                  {internationalLangs.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="text-lg shrink-0">{l.flag}</span>
                      <span className="flex-1 text-xs font-medium">{l.label}</span>
                      {lang === l.code && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop mode
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:bg-emerald-200"
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{currentLangLabel}</span>
        {expanded ? <span className="text-[10px]">▲</span> : <span className="text-[10px]">▼</span>}
      </button>

      {expanded && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setExpanded(false)}
          />
          <div className="absolute right-0 top-12 z-[70] w-64 rounded-xl border border-emerald-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Languages className="h-4 w-4" />
                Langues
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[280px]">
              <div className="px-3 pt-2 pb-1">
                <p className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  <Globe className="h-3 w-3" />
                  Langues locales du Cameroun
                </p>
                {localLangs.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-emerald-50 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
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
              <div className="mx-3 h-px bg-gray-100" />
              <div className="px-3 pt-1 pb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Internationales</p>
                {internationalLangs.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-emerald-50 ${lang === l.code ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-700'}`}
                  >
                    <span className="text-lg shrink-0">{l.flag}</span>
                    <span className="flex-1 text-xs font-medium">{l.label}</span>
                    {lang === l.code && <span className="text-emerald-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

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
