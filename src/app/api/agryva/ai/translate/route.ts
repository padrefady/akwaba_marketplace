import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
};

// ==================== LANGUES INTERNATIONALES ====================
const INTERNATIONAL_LANGUAGES: Record<string, { name: string; myMemoryCode: string }> = {
  en: { name: 'anglais', myMemoryCode: 'en' },
  fr: { name: 'français', myMemoryCode: 'fr' },
  es: { name: 'espagnol', myMemoryCode: 'es' },
  ar: { name: 'arabe', myMemoryCode: 'ar' },
  zh: { name: 'chinois', myMemoryCode: 'zh-CN' },
  de: { name: 'allemand', myMemoryCode: 'de' },
  pt: { name: 'portugais', myMemoryCode: 'pt' },
};

const ALL_LANGUAGES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(INTERNATIONAL_LANGUAGES).map(([code, info]) => [code, info.name])),
  ...Object.fromEntries(Object.entries(LOCAL_LANGUAGES).map(([code, info]) => [code, info.name])),
};

// ==================== SYSTEM PROMPT POUR IA ====================
const SYSTEM_PROMPT = `Tu es un traducteur expert spécialisé dans les langues du Cameroun et le marché agricole pour la plateforme agryva.

Tu connais parfaitement les langues locales camerounaises : Pidgin, Fulfulde, Ewondo, Bamileke (Fe'fe', Ghomala', Medumba), Duala, Bassa, Bakoko, Bamoun, Mafa, Mofu, Kapsiki, Tikar, Kom, etc.

Règles strictes:
- Détecte automatiquement la langue source du texte
- Traduis naturellement et fidèlement vers la langue cible demandée
- Pour les langues locales camerounaises, utilise les expressions et tournures authentiques
- Garde les termes techniques agricoles précis (ex: "cacao", "manioc", "igname", "plantain" ne sont pas traduits)
- Conserve le ton professionnel et commercial de l'annonce
- Si le texte contient des numéros de téléphone ou des adresses, ne les traduis pas
- Ne mentionne PAS que tu es une IA

Format de ta réponse — retourne UNIQUEMENT un JSON valide sans markdown ni backticks:
{
  "translatedText": "traduction complète du texte",
  "sourceLanguage": "code de la langue source"
}

Si un titre et une description sont fournis séparément, retourne:
{
  "translatedTitle": "titre traduit",
  "translatedDescription": "description traduite",
  "translatedText": "description traduite",
  "sourceLanguage": "code de la langue source"
}`;

// ==================== MYMEMORY FREE TRANSLATION API ====================
async function translateWithMyMemory(
  text: string,
  targetLang: string
): Promise<{ translatedText: string; sourceLanguage: string }> {
  const targetCode = INTERNATIONAL_LANGUAGES[targetLang]?.myMemoryCode;
  if (!targetCode) throw new Error('Langue non supportée par MyMemory');

  // MyMemory auto-detects source language when source is empty
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=fr|${targetCode}&de=agryva.marketplace@gmail.com`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json();

    if (json.responseStatus === 200 && json.responseData?.translatedText) {
      let translated = json.responseData.translatedText;
      // MyMemory sometimes returns UPPERCASE when match not found
      if (translated === translated.toUpperCase() && translated.length > 20) {
        translated = translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase();
      }
      return {
        translatedText: translated,
        sourceLanguage: 'fr',
      };
    }
    throw new Error(json.responseDetails || 'MyMemory: traduction échouée');
  } finally {
    clearTimeout(timeout);
  }
}

// ==================== AI TRANSLATION (z-ai-web-dev-sdk) ====================
async function translateWithAI(
  userPrompt: string
): Promise<{ translatedTitle: string; translatedDescription: string; translatedText: string; sourceLanguage: string }> {
  // Dynamic import to avoid build issues if SDK is not available
  let ZAI: any;
  try {
    ZAI = (await import('z-ai-web-dev-sdk')).default;
  } catch {
    throw new Error('Service de traduction IA non disponible. Utilisez une langue internationale (Anglais, Français, etc.)');
  }

  const zai = await ZAI.create();
  const result = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const rawContent = result.choices?.[0]?.message?.content || '';
  if (!rawContent) throw new Error('L\'IA n\'a pas retourné de traduction');

  // Parse JSON response
  try {
    const cleaned = rawContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      translatedTitle: parsed.translatedTitle || '',
      translatedDescription: parsed.translatedDescription || parsed.translatedText || '',
      translatedText: parsed.translatedText || '',
      sourceLanguage: parsed.sourceLanguage || 'fr',
    };
  } catch {
    // Fallback: use raw content as translation
    return {
      translatedTitle: '',
      translatedDescription: rawContent,
      translatedText: rawContent,
      sourceLanguage: 'fr',
    };
  }
}

// POST /api/agryva/ai/translate — Translate ad content (accessible to all, even visitors)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, text, title, description, targetLanguage, languageName } = body;

    if ((!text && !title && !description) || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: 'text (ou title+description) et targetLanguage sont requis' },
        { status: 400 }
      );
    }

    // Validate target language
    if (!ALL_LANGUAGES[targetLanguage]) {
      return NextResponse.json(
        {
          success: false,
          error: `Langue cible non supportée. Langues: ${Object.keys(ALL_LANGUAGES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate text length
    const fullText = text || `${title || ''} ${description || ''}`.trim();
    if (fullText.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Le texte à traduire ne doit pas dépasser 5000 caractères' },
        { status: 400 }
      );
    }

    // Verify user exists IF userId is provided (optional — visitors can translate too)
    if (userId) {
      try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Utilisateur non trouvé' },
            { status: 404 }
          );
        }
      } catch {
        // DB might be unavailable, allow translation without user check
      }
    }

    const targetLangName = languageName || ALL_LANGUAGES[targetLanguage];
    const isLocal = !!LOCAL_LANGUAGES[targetLanguage];
    const isInternational = !!INTERNATIONAL_LANGUAGES[targetLanguage];

    // ==================== STRATEGY ====================
    // 1. For international languages: try AI first, fallback to MyMemory
    // 2. For local languages: use AI only (MyMemory doesn't support them)

    if (isInternational) {
      // Try AI first for better quality
      let aiError: string | null = null;
      try {
        let userPrompt: string;
        if (title && description) {
          userPrompt = `Traduis le titre et la description suivants en ${targetLangName}:\n\nTITRE: ${title}\n\nDESCRIPTION: ${description}`;
        } else {
          userPrompt = `Traduis le texte suivant en ${targetLangName}:\n\n${text}`;
        }

        const aiResult = await translateWithAI(userPrompt);
        if (aiResult.translatedText || aiResult.translatedDescription) {
          return NextResponse.json({
            success: true,
            data: {
              translatedText: aiResult.translatedText,
              translatedTitle: aiResult.translatedTitle || title || '',
              translatedDescription: aiResult.translatedDescription || aiResult.translatedText,
              sourceLanguage: aiResult.sourceLanguage,
              targetLanguage,
              isLocalLanguage: false,
              method: 'ai',
            },
          });
        }
      } catch (err: unknown) {
        aiError = err instanceof Error ? err.message : 'Erreur IA';
        console.warn(`[Translate] AI failed for ${targetLanguage}, falling back to MyMemory:`, aiError);
      }

      // Fallback: MyMemory free API for international languages
      try {
        const textToTranslate = title && description
          ? `${title}\n\n${description}`
          : (text || '');

        if (!textToTranslate) {
          throw new Error('Aucun texte à traduire');
        }

        const myMemoryResult = await translateWithMyMemory(textToTranslate, targetLanguage);

        // If we had title+description, try to translate them separately for better quality
        let translatedTitle = '';
        let translatedDescription = '';

        if (title && description) {
          try {
            const titleResult = await translateWithMyMemory(title, targetLanguage);
            translatedTitle = titleResult.translatedText;
          } catch {
            translatedTitle = title;
          }
          try {
            const descResult = await translateWithMyMemory(description, targetLanguage);
            translatedDescription = descResult.translatedText;
          } catch {
            translatedDescription = myMemoryResult.translatedText;
          }
        } else {
          translatedDescription = myMemoryResult.translatedText;
        }

        return NextResponse.json({
          success: true,
          data: {
            translatedText: myMemoryResult.translatedText,
            translatedTitle,
            translatedDescription,
            sourceLanguage: myMemoryResult.sourceLanguage,
            targetLanguage,
            isLocalLanguage: false,
            method: 'mymemory',
          },
        });
      } catch (myMemoryError: unknown) {
        const errorMsg = myMemoryError instanceof Error ? myMemoryError.message : 'Erreur MyMemory';
        return NextResponse.json(
          {
            success: false,
            error: `Traduction échouée. IA: ${aiError}. API: ${errorMsg}. Veuillez réessayer.`,
          },
          { status: 500 }
        );
      }
    }

    // ==================== LOCAL LANGUAGES — AI ONLY ====================
    if (isLocal) {
      const localInfo = LOCAL_LANGUAGES[targetLanguage];
      const langContext = `Langue cible : ${localInfo.name}, ${localInfo.region}.
Utilise les expressions authentiques et la grammaire correcte de cette langue.
Adapte le vocabulaire agricole camerounais (prix en FCFA, produits locaux comme manioc, plantain, macabo, ndolé, etc.).`;

      let userPrompt: string;
      if (title && description) {
        userPrompt = `${langContext}\n\nTraduis le titre et la description suivants en ${targetLangName}:\n\nTITRE: ${title}\n\nDESCRIPTION: ${description}`;
      } else {
        userPrompt = `${langContext}\n\nTraduis le texte suivant en ${targetLangName}:\n\n${text}`;
      }

      try {
        const aiResult = await translateWithAI(userPrompt);
        if (aiResult.translatedText || aiResult.translatedDescription) {
          return NextResponse.json({
            success: true,
            data: {
              translatedText: aiResult.translatedText,
              translatedTitle: aiResult.translatedTitle || title || '',
              translatedDescription: aiResult.translatedDescription || aiResult.translatedText,
              sourceLanguage: aiResult.sourceLanguage,
              targetLanguage,
              isLocalLanguage: true,
              method: 'ai',
            },
          });
        }
        throw new Error('L\'IA n\'a pas produit de traduction');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        return NextResponse.json(
          {
            success: false,
            error: `Traduction en ${targetLangName} échouée: ${errorMsg}. Les langues locales nécessitent le service IA. Veuillez réessayer.`,
          },
          { status: 500 }
        );
      }
    }

    // Should not reach here
    return NextResponse.json(
      { success: false, error: 'Langue non reconnue' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la traduction';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
