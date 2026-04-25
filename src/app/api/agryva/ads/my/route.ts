import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

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

    const ads = await db.ad.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            region: true,
            city: true,
            plan: true,
            isVerified: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeAds = ads.map((ad) => ({
      ...ad,
      images: JSON.parse(ad.images || '[]'),
      tags: JSON.parse(ad.tags || '[]'),
      author: sanitizeUser(ad.author as Record<string, unknown>),
    }));

    return NextResponse.json({ success: true, data: safeAds });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user ads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
