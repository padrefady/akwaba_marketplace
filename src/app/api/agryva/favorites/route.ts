import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a fresh PrismaClient to ensure Favorite model is available
const freshDb = new PrismaClient();

// GET /api/agryva/favorites?userId=xxx — Get all favorites for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const favorites = await freshDb.favorite.findMany({
      where: { userId },
      include: {
        ad: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true, region: true, plan: true }
            },
            category: {
              select: { name: true, slug: true, icon: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const favoritesWithFlag = favorites.map(fav => ({
      ...fav,
      isFavorited: true
    }));

    return NextResponse.json({ success: true, data: favoritesWithFlag });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/agryva/favorites/ — Toggle favorite (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adId } = body;

    if (!userId || !adId) {
      return NextResponse.json(
        { success: false, error: 'userId and adId are required' },
        { status: 400 }
      );
    }

    const [user, ad] = await Promise.all([
      freshDb.user.findUnique({ where: { id: userId } }),
      freshDb.ad.findUnique({ where: { id: adId } }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    const existing = await freshDb.favorite.findUnique({
      where: {
        userId_adId: { userId, adId }
      }
    });

    if (existing) {
      await freshDb.favorite.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({
        success: true,
        data: { isFavorited: false, message: 'Favori retiré' }
      });
    } else {
      await freshDb.favorite.create({
        data: { userId, adId }
      });
      return NextResponse.json({
        success: true,
        data: { isFavorited: true, message: 'Ajouté aux favoris' }
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to toggle favorite';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
