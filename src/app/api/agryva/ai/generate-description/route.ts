import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `Tu es un expert en rédaction de annonces agricoles pour la plateforme agryva au Cameroun. Tu dois générer des descriptions professionnelles et attrayantes pour des produits agricoles.

Règles strictes:
- Rédige UNIQUEMENT en français
- La description doit faire entre 100 et 200 mots
- Inclus toujours des détails sur la qualité du produit, sa disponibilité, et les options de livraison
- Si une localisation ou région est fournie, mentionne-la naturellement dans le texte
- Utilise des mots-clés agricoles pertinents (terroir, récolte, frais, culture locale, etc.)
- Termine TOUJOURS par un appel à l'action avec un espace pour les coordonnées (ex: "Contactez-nous au [numéro] ou via agryva pour commander")
- Adopte un ton professionnel mais chaleureux
- Ne mentionne PAS que tu es une IA

Format de ta réponse — retourne UNIQUEMENT un JSON valide sans markdown ni backticks:
{
  "description": "...",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Les "suggestedTags" doivent être 3 à 5 mots-clés pertinents en minuscules, en français, séparés par des virgules.`;

// POST /api/agryva/ai/generate-description — Generate AI ad description
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      category,
      price,
      priceUnit,
      condition,
      location,
      region,
      keywords,
    } = body;

    if (!userId || !title || !category) {
      return NextResponse.json(
        { success: false, error: 'userId, title et category sont requis' },
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

    // Build the user prompt with all available details
    const details: string[] = [];
    details.push(`Titre de l'annonce: ${title}`);
    details.push(`Catégorie: ${category}`);

    if (price !== null && price !== undefined) {
      const unit = priceUnit ? ` ${priceUnit}` : '';
      details.push(`Prix: ${price}${unit}`);
    }
    if (condition) {
      details.push(`État: ${condition}`);
    }
    if (location) {
      details.push(`Localisation: ${location}`);
    }
    if (region) {
      details.push(`Région: ${region}`);
    }
    if (keywords) {
      details.push(`Mots-clés suggérés: ${keywords}`);
    }

    const userPrompt = `Génère une description pour l'annonce agricole suivante:\n\n${details.join('\n')}`;

    // Call AI via z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const result = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const rawContent = result.choices?.[0]?.message?.content || '';

    // Parse the JSON response from the AI
    let description: string;
    let suggestedTags: string[];

    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      description = parsed.description || '';
      suggestedTags = parsed.suggestedTags || [];
    } catch {
      // Fallback: use the raw content as description
      description = rawContent;
      suggestedTags = keywords
        ? keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean).slice(0, 5)
        : [category.toLowerCase()];
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Impossible de générer une description. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        description,
        suggestedTags,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération de la description';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
