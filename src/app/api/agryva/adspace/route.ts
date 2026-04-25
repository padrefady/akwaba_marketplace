import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const targetPlan = searchParams.get('plan') || 'FREE';

    const where: Record<string, unknown> = {
      isActive: true,
      targetPlan,
    };

    if (position) where.position = position;

    // Filter by date validity
    where.OR = [
      { startsAt: null },
      { startsAt: { lte: new Date() } },
    ];
    where.AND = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    const advertisements = await db.advertisement.findMany({
      where,
      orderBy: { priority: 'desc' },
    });

    // Update impressions count in background
    advertisements.forEach(async (ad) => {
      await db.advertisement.update({
        where: { id: ad.id },
        data: { impressionsCount: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true, data: advertisements });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch advertisements';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
