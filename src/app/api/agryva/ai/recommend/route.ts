import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/agryva/ai/recommend — Get personalized ad recommendations (VIP only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Verify user exists and is VIP
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.plan !== 'VIP') {
      return NextResponse.json(
        { success: false, error: 'Fonctionnalité réservée aux membres VIP' },
        { status: 403 }
      );
    }

    // Get user's favorite categories from their ads and favorites
    const [userAds, userFavorites] = await Promise.all([
      db.ad.findMany({
        where: { authorId: userId },
        select: { categorySlug: true }
      }),
      db.favorite.findMany({
        where: { userId },
        include: { ad: { select: { categorySlug: true } } }
      })
    ]);

    // Combine categories
    const categories = [...new Set([
      ...userAds.map(a => a.categorySlug),
      ...userFavorites.map(f => f.ad.categorySlug)
    ])];

    // Build the OR conditions for the query
    const orConditions: Array<Record<string, string>> = [];

    if (categories.length > 0) {
      orConditions.push(...categories.map(c => ({ categorySlug: c })));
    }

    if (user.region) {
      orConditions.push({ region: user.region });
    }

    // Find ads in those categories from other users, or in same region
    const recommended = await db.ad.findMany({
      where: {
        status: 'ACTIVE',
        authorId: { not: userId },
        ...(orConditions.length > 0 ? { OR: orConditions } : {})
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { name: true, icon: true } }
      },
      take: 8,
      orderBy: { viewsCount: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendations: recommended,
        basedOn: {
          categories,
          region: user.region || null,
          totalMatches: recommended.length
        }
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération des recommandations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
