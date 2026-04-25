import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function GET() {
  try {
    const ads = await db.ad.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
      },
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
      orderBy: [
        { isUrgent: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 8,
    });

    const safeAds = ads.map((ad) => ({
      ...ad,
      images: JSON.parse(ad.images || '[]'),
      tags: JSON.parse(ad.tags || '[]'),
      author: sanitizeUser(ad.author as Record<string, unknown>),
    }));

    return NextResponse.json({ success: true, data: safeAds });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch featured ads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
