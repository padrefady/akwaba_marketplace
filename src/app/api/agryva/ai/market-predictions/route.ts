import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const DEFAULT_PRODUCTS = [
  'Maïs',
  'Manioc',
  'Arachide',
  'Plantain',
  'Poulet de chair',
  'Poisson tilapia',
  'Café',
  'Cacao',
] as const;

const VALID_TRENDS = ['up', 'down', 'stable'] as const;

const SYSTEM_PROMPT = `Tu es un analyste de marché agricole spécialisé dans le marché camerounais. Tu as une connaissance approfondie des prix actuels, des saisons de récolte, et des tendances économiques affectant l'agriculture au Cameroun et en Afrique centrale.

Tu dois :
- Retourner UNIQUEMENT un objet JSON valide, sans texte supplémentaire
- Fournir des prix réalistes en FCFA (Franc CFA) pour le marché camerounais
- Les tendances doivent être "up", "down", ou "stable"
- Les raisons doivent être en français, brèves et pertinentes
- Les régions doivent être des régions réelles du Cameroun (Centre, Littoral, Ouest, Nord-Ouest, Sud-Ouest, Sud, Est, Nord, Extrême-Nord, Adamaoua)
- Les saisons doivent correspondre aux cycles agricoles camerounais

Format de réponse attendu :
{
  "predictions": [
    {
      "product": "string - nom du produit",
      "currentPrice": number - prix actuel moyen en FCFA par unité standard (kg, pièce, etc.),
      "predictedPrice": number - prix prédit en FCFA,
      "trend": "up" | "down" | "stable",
      "trendPercent": number - pourcentage de variation attendu,
      "reason": "string - raison brève en français",
      "bestRegion": "string - meilleure région pour ce produit",
      "season": "string - saison de production (ex: Récolte (juin-août))"
    }
  ],
  "generalAdvice": "string - conseil général sur le marché en français, 2-3 phrases"
}`;

interface MarketPrediction {
  product: string;
  currentPrice: number;
  predictedPrice: number;
  trend: string;
  trendPercent: number;
  reason: string;
  bestRegion: string;
  season: string;
}

interface MarketPredictionsResult {
  predictions: MarketPrediction[];
  generalAdvice: string;
}

/**
 * Strips markdown code block wrappers from a string.
 * Handles both ```json ... ``` and ``` ... ``` cases.
 */
function stripMarkdownCodeBlock(text: string): string {
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

// POST /api/agryva/ai/market-predictions — Generate market predictions for agricultural products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, products } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId est requis' },
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

    // Determine which products to analyze
    const productsToAnalyze: readonly string[] =
      Array.isArray(products) && products.length > 0
        ? products
        : DEFAULT_PRODUCTS;

    // Build the user prompt with the list of products
    const userPrompt = `Analyse les prévisions de marché pour les produits agricoles suivants au Cameroun : ${productsToAnalyze.join(', ')}. 

Fournis des données réalistes basées sur les conditions actuelles du marché camerounais. Les prix doivent être en FCFA. Si le produit n'est pas un produit agricole standard, fais de ton mieux avec des estimations raisonnables.`;

    // Call LLM via z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const result = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const rawContent = result.choices?.[0]?.message?.content || '';

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: 'La génération des prédictions a échoué. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Parse the LLM response, handling markdown code blocks
    const parsed = parseJsonResponse<MarketPredictionsResult>(rawContent);

    // Validate and sanitize predictions
    const validatedPredictions = (parsed.predictions || []).map((pred) => ({
      product: pred.product || 'Inconnu',
      currentPrice: typeof pred.currentPrice === 'number' ? pred.currentPrice : 0,
      predictedPrice: typeof pred.predictedPrice === 'number' ? pred.predictedPrice : 0,
      trend: VALID_TRENDS.includes(pred.trend as (typeof VALID_TRENDS)[number]) ? pred.trend : 'stable',
      trendPercent: typeof pred.trendPercent === 'number' ? pred.trendPercent : 0,
      reason: pred.reason || '',
      bestRegion: pred.bestRegion || 'Centre',
      season: pred.season || '',
    }));

    return NextResponse.json({
      success: true,
      data: {
        predictions: validatedPredictions,
        generalAdvice: parsed.generalAdvice || '',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération des prédictions';

    // Provide more helpful error for JSON parse failures
    if (message.includes('JSON') || message.includes('parse')) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de lire la réponse de l'IA. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
