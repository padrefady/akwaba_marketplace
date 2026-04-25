import { NextRequest, NextResponse } from 'next/server'

// ==================== IN-MEMORY TRANSLATION CACHE ====================
const translationCache = new Map<string, string>()
const CACHE_MAX_SIZE = 5000

function getCacheKey(lang: string, text: string): string {
  return `${lang}:${text}`
}

function getCachedTranslation(lang: string, text: string): string | undefined {
  const key = getCacheKey(lang, text)
  return translationCache.get(key)
}

function setCachedTranslation(lang: string, text: string, translation: string): void {
  // Evict oldest entries if cache is full
  if (translationCache.size >= CACHE_MAX_SIZE) {
    const firstKey = translationCache.keys().next().value
    if (firstKey !== undefined) {
      translationCache.delete(firstKey)
    }
  }
  const key = getCacheKey(lang, text)
  translationCache.set(key, translation)
}

// ==================== RETRY WITH EXPONENTIAL BACKOFF ====================
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 2000,
  label: string = 'operation'
): Promise<T> {
  let lastError: Error | unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const is429 =
        err instanceof Error &&
        (err.message.includes('429') ||
          err.message.includes('rate limit') ||
          err.message.includes('too many'))
      if (attempt < maxAttempts && is429) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        console.warn(
          `[BatchTranslate] ${label} attempt ${attempt}/${maxAttempts} failed (rate limited), retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        console.warn(
          `[BatchTranslate] ${label} attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`[BatchTranslate] ${label} failed after ${maxAttempts} attempts`)
      }
    }
  }
  throw lastError
}

// ==================== LANGUES LOCALES DU CAMEROUN ====================
const LOCAL_LANGUAGES: Record<string, { name: string; region: string }> = {
  pidgin: { name: 'Pidgin English camerounais', region: 'langue véhiculaire nationale du Cameroun' },
  fulfulde: { name: 'Fulfulde (Peul)', region: 'parlée au Nord et Adamaoua' },
  ewondo: { name: 'Ewondo (Beti)', region: 'parlée au Centre et Sud du Cameroun' },
  bamileke: { name: "Bamileke (dialecte Fe'fe')", region: 'parlée dans les Grassfields, Ouest' },
  medumba: { name: 'Medumba (Bafang)', region: 'parlée autour de Bafang, Ouest' },
  ghomala: { name: "Ghomala' (Bafoussam)", region: "parlée autour de Bafoussam, Ouest" },
  duala: { name: 'Duala', region: 'parlée dans le Littoral, côtière' },
  bassa: { name: 'Bassa', region: 'parlée dans le Littoral' },
  bakoko: { name: 'Bakoko', region: 'parlée dans le Littoral et Sanaga-Maritime' },
  bamoun: { name: 'Bamoun', region: 'parlée dans le Noun, Ouest (Foumban)' },
  mafa: { name: 'Mafa', region: 'parlée dans les monts Mandara, Extrême-Nord' },
  mofu: { name: 'Mofu-Gudur', region: "parlée dans l'Extrême-Nord" },
  kapsiki: { name: 'Kapsiki (Malgwa)', region: 'parlée dans les monts Kapsiki, Extrême-Nord' },
  tikar: { name: 'Tikar', region: 'parlée dans le Ndé et Bui, Nord-Ouest' },
  kom: { name: 'Kom', region: 'parlée dans le Boyo, Nord-Ouest' },
}

// ==================== LANGUES INTERNATIONALES ====================
const INTERNATIONAL_LANGUAGES: Record<string, { name: string; myMemoryCode: string }> = {
  en: { name: 'anglais', myMemoryCode: 'en' },
  fr: { name: 'français', myMemoryCode: 'fr' },
  es: { name: 'espagnol', myMemoryCode: 'es' },
  ar: { name: 'arabe', myMemoryCode: 'ar' },
  zh: { name: 'chinois', myMemoryCode: 'zh-CN' },
  de: { name: 'allemand', myMemoryCode: 'de' },
  pt: { name: 'portugais', myMemoryCode: 'pt' },
}

const ALL_LANGUAGES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(INTERNATIONAL_LANGUAGES).map(([code, info]) => [code, info.name])),
  ...Object.fromEntries(Object.entries(LOCAL_LANGUAGES).map(([code, info]) => [code, info.name])),
}

// ==================== SYSTEM PROMPT POUR IA ====================
const BATCH_SYSTEM_PROMPT = `Tu es un traducteur expert spécialisé dans les langues du Cameroun et le marché agricole pour la plateforme agryva.

Tu connais parfaitement les langues locales camerounaises : Pidgin, Fulfulde, Ewondo, Bamileke (Fe'fe', Ghomala', Medumba), Duala, Bassa, Bakoko, Bamoun, Mafa, Mofu, Kapsiki, Tikar, Kom, etc.

Règles strictes:
- Tous les textes fournis sont en français, traduis-les vers la langue cible demandée
- Pour les langues locales camerounaises, utilise les expressions et tournures authentiques
- Garde les termes techniques agricoles précis (ex: "cacao", "manioc", "igname", "plantain" ne sont pas traduits)
- Conserve le ton professionnel et commercial adapté à une marketplace agricole
- Ne mentionne PAS que tu es une IA

Format de ta réponse — retourne UNIQUEMENT un JSON valide sans markdown ni backticks:
{
  "translationKey1": "traduction du texte 1",
  "translationKey2": "traduction du texte 2"
}

Utilise exactement les clés fournies dans le JSON de sortie.`

// ==================== ROBUST JSON EXTRACTION ====================
function extractJSONFromAIResponse(rawContent: string): Record<string, string> | null {
  // Step 1: Try cleaning markdown wrappers and parsing directly
  const cleaned = rawContent
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch {
    // Continue to next strategy
  }

  // Step 2: Try to find JSON object(s) within the content using balanced brace matching
  const jsonPatterns = [
    // Match outermost { ... } block
    /\{[\s\S]*\}/g,
  ]

  for (const pattern of jsonPatterns) {
    const matches = cleaned.match(pattern)
    if (matches) {
      // Try the longest match first (most likely to be the complete JSON)
      const sorted = matches.sort((a, b) => b.length - a.length)
      for (const match of sorted) {
        try {
          const parsed = JSON.parse(match)
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed as Record<string, string>
          }
        } catch {
          // Try fixing common JSON issues
          try {
            // Fix trailing commas
            const fixed = match.replace(/,\s*([}\]])/g, '$1')
            const parsed = JSON.parse(fixed)
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
              return parsed as Record<string, string>
            }
          } catch {
            // Continue
          }
        }
      }
    }
  }

  // Step 3: Regex extraction of all "key": "value" pairs
  try {
    const pairs: Record<string, string> = {}
    // Match "key": "value" patterns, handling escaped quotes inside values
    const kvRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g
    let match: RegExpExecArray | null
    while ((match = kvRegex.exec(rawContent)) !== null) {
      const key = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      const value = match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      pairs[key] = value
    }
    if (Object.keys(pairs).length > 0) {
      return pairs
    }
  } catch {
    // Continue
  }

  return null
}

// ==================== MYMEMORY FREE TRANSLATION API ====================
async function translateWithMyMemory(
  text: string,
  targetLang: string
): Promise<string> {
  const targetCode = INTERNATIONAL_LANGUAGES[targetLang]?.myMemoryCode
  if (!targetCode) throw new Error('Langue non supportée par MyMemory')

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=fr|${targetCode}&de=agryva.marketplace@gmail.com`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    const json = await res.json()

    if (json.responseStatus === 200 && json.responseData?.translatedText) {
      let translated = json.responseData.translatedText
      // MyMemory sometimes returns UPPERCASE when match not found
      if (translated === translated.toUpperCase() && translated.length > 20) {
        translated = translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase()
      }
      return translated
    }
    throw new Error(json.responseDetails || 'MyMemory: traduction échouée')
  } finally {
    clearTimeout(timeout)
  }
}

// ==================== AI BATCH TRANSLATION (z-ai-web-dev-sdk) ====================
async function translateBatchWithAI(
  targetLanguage: string,
  pairs: Array<{ key: string; text: string }>
): Promise<Record<string, string>> {
  // Dynamic import to avoid build issues if SDK is not available
  let ZAI: any
  try {
    ZAI = (await import('z-ai-web-dev-sdk')).default
  } catch {
    throw new Error('Service de traduction IA non disponible')
  }

  const zai = await ZAI.create()

  const targetLangName = ALL_LANGUAGES[targetLanguage]
  const isLocal = !!LOCAL_LANGUAGES[targetLanguage]

  let langContext = ''
  if (isLocal) {
    const localInfo = LOCAL_LANGUAGES[targetLanguage]
    langContext = `\n\nContexte : Langue cible ${localInfo.name}, ${localInfo.region}. Utilise les expressions authentiques et la grammaire correcte de cette langue. Adapte le vocabulaire agricole camerounais (prix en FCFA, produits locaux comme manioc, plantain, macabo, ndolé, etc.).`
  }

  // Build a clear text list for the AI
  const textList = pairs
    .map((p, i) => `${i + 1}. [${p.key}] ${p.text}`)
    .join('\n')

  const userPrompt = `Traduis les textes suivants du français vers le ${targetLangName}.${langContext}

Textes à traduire :
${textList}

Retourne un JSON où chaque clé est le key fourni entre crochets et la valeur est la traduction correspondante.`

  const result = await withRetry(async () => {
    return await zai.chat.completions.create({
      messages: [
        { role: 'system', content: BATCH_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })
  }, 3, 2000, 'AI chat completion')

  const rawContent = result.choices?.[0]?.message?.content || ''
  if (!rawContent) throw new Error("L'IA n'a pas retourné de traduction")

  console.log('[BatchTranslate] AI raw response (first 500 chars):', rawContent.substring(0, 500))

  // Step 1: Extract JSON from AI response using robust extraction
  const parsed = extractJSONFromAIResponse(rawContent)

  if (!parsed) {
    throw new Error('Impossible de parser la réponse de l\'IA')
  }

  console.log('[BatchTranslate] Parsed keys from AI:', Object.keys(parsed).join(', '))

  // Step 2: Map parsed keys to our expected format
  const translations: Record<string, string> = {}

  // Strategy A: Try exact key match first
  for (const pair of pairs) {
    if (parsed[pair.key] && typeof parsed[pair.key] === 'string') {
      translations[pair.key] = parsed[pair.key]
    }
  }

  console.log(`[BatchTranslate] Exact key match: ${Object.keys(translations).length}/${pairs.length}`)

  // Strategy B: If not all keys matched, try position-based matching
  // The AI may return French text as keys instead of the translation keys
  if (Object.keys(translations).length < pairs.length) {
    const parsedValues = Object.values(parsed)
    const parsedKeys = Object.keys(parsed)

    for (let i = 0; i < pairs.length; i++) {
      if (translations[pairs[i].key]) continue // Already matched

      // Try to find this pair's text as a key in the parsed result
      // (AI might have used the French text as key)
      const originalText = pairs[i].text
      if (parsed[originalText] && typeof parsed[originalText] === 'string') {
        translations[pairs[i].key] = parsed[originalText]
        console.log(`[BatchTranslate] Matched key "${pairs[i].key}" by original text lookup`)
        continue
      }

      // Try substring match — AI might have truncated the key
      for (const [parsedKey, parsedValue] of Object.entries(parsed)) {
        if (
          parsedKey.includes(originalText.substring(0, 20)) ||
          originalText.includes(parsedKey.substring(0, 20))
        ) {
          if (typeof parsedValue === 'string' && parsedValue.length > 0) {
            translations[pairs[i].key] = parsedValue
            console.log(`[BatchTranslate] Matched key "${pairs[i].key}" by substring`)
            break
          }
        }
      }
    }

    console.log(`[BatchTranslate] After text/substring match: ${Object.keys(translations).length}/${pairs.length}`)
  }

  // Strategy C: Position-based fallback — match values by order
  // If the AI returned the right number of values, assign them in order
  if (Object.keys(translations).length < pairs.length) {
    const parsedValues = Object.values(parsed).filter((v) => typeof v === 'string')
    const unmatchedPairs = pairs.filter((p) => !translations[p.key])

    if (parsedValues.length >= unmatchedPairs.length) {
      // Try to align: check if any parsed value is clearly not a translation
      // (e.g., it's a copy of the original French text — though this is hard to detect)
      for (let i = 0; i < unmatchedPairs.length; i++) {
        const candidateValue = parsedValues[i] as string
        // Skip values that are exactly the original text (not a real translation)
        if (candidateValue === unmatchedPairs[i].text) {
          console.log(`[BatchTranslate] Skipping position match for "${unmatchedPairs[i].key}" — value is identical to original`)
          continue
        }
        translations[unmatchedPairs[i].key] = candidateValue
      }

      console.log(`[BatchTranslate] After position-based match: ${Object.keys(translations).length}/${pairs.length}`)
    }
  }

  if (Object.keys(translations).length === 0) {
    throw new Error('Impossible de parser la réponse de l\'IA — aucun matching trouvé')
  }

  return translations
}

// ==================== MAIN HANDLER ====================

// POST /api/agryva/ai/translate-batch — Translate multiple texts in one call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetLanguage, pairs } = body as {
      targetLanguage: string
      pairs: Array<{ key: string; text: string }>
    }

    if (!targetLanguage || !pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'targetLanguage et pairs (tableau non vide) sont requis' },
        { status: 400 }
      )
    }

    // Validate target language
    if (!ALL_LANGUAGES[targetLanguage]) {
      return NextResponse.json(
        {
          success: false,
          error: `Langue cible non supportée. Langues: ${Object.keys(ALL_LANGUAGES).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate pairs structure
    for (const pair of pairs) {
      if (!pair.key || typeof pair.key !== 'string' || !pair.text || typeof pair.text !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Chaque paire doit avoir un key (string) et text (string)' },
          { status: 400 }
        )
      }
    }

    // Limit batch size
    if (pairs.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 textes par lot' },
        { status: 400 }
      )
    }

    // ==================== CHECK CACHE FIRST ====================
    const cachedTranslations: Record<string, string> = {}
    const uncachedPairs: Array<{ key: string; text: string }> = []

    for (const pair of pairs) {
      const cached = getCachedTranslation(targetLanguage, pair.text)
      if (cached) {
        cachedTranslations[pair.key] = cached
      } else {
        uncachedPairs.push(pair)
      }
    }

    // If all translations are cached, return immediately
    if (uncachedPairs.length === 0) {
      return NextResponse.json({
        success: true,
        translations: cachedTranslations,
        method: 'cache',
      })
    }

    console.log(`[BatchTranslate] Cache hit: ${cachedTranslations.length}/${pairs.length}, need to translate: ${uncachedPairs.length}`)

    // ==================== TRANSLATE UNCACHED PAIRS ====================
    const isLocal = !!LOCAL_LANGUAGES[targetLanguage]
    const isInternational = !!INTERNATIONAL_LANGUAGES[targetLanguage]

    // ==================== STRATEGY ====================
    // 1. For international languages: try AI first, fallback to MyMemory individually
    // 2. For local languages: use AI only

    let freshTranslations: Record<string, string> = {}

    if (isInternational) {
      // Try AI first for better quality
      let aiError: string | null = null
      try {
        const translations = await withRetry(
          () => translateBatchWithAI(targetLanguage, uncachedPairs),
          3,
          2000,
          `AI translation (${targetLanguage})`
        )
        freshTranslations = translations
      } catch (err: unknown) {
        aiError = err instanceof Error ? err.message : 'Erreur IA'
        console.warn(`[BatchTranslate] AI failed for ${targetLanguage}, falling back to MyMemory:`, aiError)
      }

      // If AI didn't produce enough translations, fill gaps with MyMemory
      const missingPairs = uncachedPairs.filter((p) => !freshTranslations[p.key])
      if (missingPairs.length > 0) {
        let myMemoryErrors = 0

        for (const pair of missingPairs) {
          try {
            const translated = await withRetry(
              () => translateWithMyMemory(pair.text, targetLanguage),
              3,
              2000,
              `MyMemory (${pair.key})`
            )
            freshTranslations[pair.key] = translated
            // Cache the MyMemory result
            setCachedTranslation(targetLanguage, pair.text, translated)
          } catch {
            myMemoryErrors++
            // If MyMemory fails for a text, keep the original French text
            freshTranslations[pair.key] = pair.text
          }
        }

        if (aiError && Object.keys(freshTranslations).length > 0) {
          console.log(`[BatchTranslate] MyMemory filled ${missingPairs.length - myMemoryErrors} gaps after AI failure`)
        }
      }

      // Cache successful AI translations
      for (const [key, value] of Object.entries(freshTranslations)) {
        const pair = uncachedPairs.find((p) => p.key === key)
        if (pair && value !== pair.text) {
          setCachedTranslation(targetLanguage, pair.text, value)
        }
      }
    }

    // ==================== LOCAL LANGUAGES — AI ONLY ====================
    if (isLocal) {
      try {
        const translations = await withRetry(
          () => translateBatchWithAI(targetLanguage, uncachedPairs),
          3,
          2000,
          `AI translation (${targetLanguage})`
        )
        freshTranslations = translations
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
        return NextResponse.json(
          {
            success: false,
            error: `Traduction en ${ALL_LANGUAGES[targetLanguage]} échouée: ${errorMsg}. Les langues locales nécessitent le service IA.`,
          },
          { status: 500 }
        )
      }

      // Cache successful local language translations
      for (const [key, value] of Object.entries(freshTranslations)) {
        const pair = uncachedPairs.find((p) => p.key === key)
        if (pair && value !== pair.text) {
          setCachedTranslation(targetLanguage, pair.text, value)
        }
      }
    }

    // Merge cached and fresh translations
    const allTranslations = { ...cachedTranslations, ...freshTranslations }

    if (Object.keys(allTranslations).length > 0) {
      return NextResponse.json({
        success: true,
        translations: allTranslations,
        method: Object.keys(cachedTranslations).length > 0 ? 'mixed' : 'ai',
        cachedCount: Object.keys(cachedTranslations).length,
        translatedCount: Object.keys(freshTranslations).length,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Traduction échouée' },
      { status: 500 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la traduction'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
