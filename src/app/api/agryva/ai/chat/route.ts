import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `Tu es agryvaBot, l'assistant agricole virtuel de la plateforme agryva au Cameroun. Tu es un expert en agriculture camerounaise et ouest-africaine.
Tu dois:
- Répondre en français
- Donner des conseils agricoles adaptés au contexte camerounais (climat tropical, saisons des pluies/sèches)
- Connaître les cultures locales: maïs, manioc, arachide, cacao, café, plantain, igname, patate douce, riz, etc.
- Conseiller sur les techniques modernes et traditionnelles
- Aider avec les prix du marché et les saisons de production
- Être concis mais informatif
- Suggérer des produits et services disponibles sur agryva quand pertinent`;

// Daily message limits by plan
const DAILY_MESSAGE_LIMITS: Record<string, number | null> = {
  free: 20,
  premium: 50,
  VIP: null, // unlimited
};

// POST /api/agryva/ai/chat — AI agricultural chatbot (all logged-in users)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, context } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { success: false, error: 'userId et message sont requis' },
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

    // Check daily message limit based on plan
    const userPlan = user.plan || 'free';
    const dailyLimit = DAILY_MESSAGE_LIMITS[userPlan] ?? DAILY_MESSAGE_LIMITS.free;

    // For plans with a limit, return the limit info (client should track usage)
    if (dailyLimit !== null) {
      // Simple approach: return the limit in error if client indicates exceeded via header
      const remainingHeader = request.headers.get('x-remaining-messages');
      if (remainingHeader !== null && parseInt(remainingHeader, 10) <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Limite quotidienne atteinte. Votre plan "${userPlan}" permet ${dailyLimit} messages par jour. Passez à Premium (50/jour) ou VIP (illimité) pour plus de messages.`,
            limit: dailyLimit,
            plan: userPlan,
          },
          { status: 429 }
        );
      }
    }

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (context) {
      messages.push({ role: 'user', content: `Contexte: ${context}` });
      messages.push({ role: 'assistant', content: 'Compris, je tiens compte de ce contexte.' });
    }

    messages.push({ role: 'user', content: message });

    // Call AI via z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const result = await zai.chat.completions.create({ messages });

    const aiResponse = result.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.';

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        dailyLimit: dailyLimit, // Return the limit so client can track
        plan: userPlan,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la communication avec l\'assistant';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
