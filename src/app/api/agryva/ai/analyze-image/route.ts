import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const VALID_CATEGORIES = [
  'cereales',
  'legumineuses',
  'tubercules',
  'fruits-legumes',
  'betail-volaille',
  'poissons',
  'produits-forestiers',
  'engrais-intrants',
  'equipements',
  'services-agricoles',
  'terres',
  'aliments-transformes',
] as const;

const VALID_QUALITIES = ['fresh', 'processed', 'new', 'used'] as const;

const SYSTEM_PROMPT = `Tu es un expert en identification de produits agricoles camerounais et ouest-africains. Analyse l'image fournie et retourne un objet JSON avec les informations suivantes.

Règles strictes :
- Réponds UNIQUEMENT en JSON valide, sans texte supplémentaire
- Toutes les descriptions et titres doivent être en français
- La catégorie doit correspondre exactement à un de ces slugs : ${VALID_CATEGORIES.join(', ')}
- La qualité doit être l'une de : ${VALID_QUALITIES.join(', ')}
- La description doit faire entre 30 et 50 mots en français
- Les tags doivent être 3 à 5 mots-clés pertinents en français

Format de réponse attendu :
{
  "productType": "string - type de produit (ex: plantain, maïs, poulet, etc.)",
  "category": "string - slug de catégorie parmi la liste ci-dessus",
  "quality": "string - fresh, processed, new, ou used",
  "description": "string - description courte en français de l'image (30-50 mots)",
  "suggestedTitle": "string - titre d'annonce accrocheur en français",
  "tags": ["string"] - 3 à 5 tags pertinents en français
}`;

interface ImageAnalysisResult {
  productType: string;
  category: string;
  quality: string;
  description: string;
  suggestedTitle: string;
  tags: string[];
}

/**
 * Strips markdown code block wrappers from a string.
 * Handles both ```json ... ``` and ``` ... ``` cases.
 */
function stripMarkdownCodeBlock(text: string): string {
  // Remove opening code fence with optional language tag
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  return stripped.trim();
}

/**
 * Parses a potentially markdown-wrapped JSON string into a typed object.
 */
function parseJsonResponse<T>(raw: string): T {
  const cleaned = stripMarkdownCodeBlock(raw);
  return JSON.parse(cleaned) as T;
}

// POST /api/agryva/ai/analyze-image — Analyze a product image using VLM
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, imageDataUri } = body;

    if (!userId || !imageDataUri) {
      return NextResponse.json(
        { success: false, error: 'userId et imageDataUri sont requis' },
        { status: 400 }
      );
    }

    // Validate data URI format
    if (
      typeof imageDataUri !== 'string' ||
      !imageDataUri.startsWith('data:image/')
    ) {
      return NextResponse.json(
        { success: false, error: 'imageDataUri doit être une data URI valide (data:image/...)' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Call VLM via z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const vlmResult = await zai.vlm.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: imageDataUri } },
          ],
        },
      ],
    });

    const rawContent = vlmResult.choices?.[0]?.message?.content || '';

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: "L'analyse de l'image a échoué. Veuillez réessayer." },
        { status: 500 }
      );
    }

    // Parse the VLM response, handling markdown code blocks
    const analysis = parseJsonResponse<ImageAnalysisResult>(rawContent);

    // Validate category
    if (!VALID_CATEGORIES.includes(analysis.category as (typeof VALID_CATEGORIES)[number])) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...analysis,
            category: 'cereales', // fallback
          },
          warning: `Catégorie "${analysis.category}" non reconnue, valeur par défaut appliquée.`,
        },
        { status: 200 }
      );
    }

    // Validate quality
    if (!VALID_QUALITIES.includes(analysis.quality as (typeof VALID_QUALITIES)[number])) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...analysis,
            quality: 'fresh', // fallback
          },
          warning: `Qualité "${analysis.quality}" non reconnue, valeur par défaut appliquée.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'analyse de l'image";

    // Provide more helpful error for JSON parse failures
    if (message.includes('JSON') || message.includes('parse')) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de lire la réponse de l'IA. Veuillez réessayer avec une autre image.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
