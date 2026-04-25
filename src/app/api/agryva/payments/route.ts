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

    const transactions = await db.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        ad: {
          select: { id: true, title: true, images: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeTransactions = transactions.map((t) => ({
      ...t,
      buyer: sanitizeUser(t.buyer as Record<string, unknown>),
      seller: sanitizeUser(t.seller as Record<string, unknown>),
      ad: t.ad ? {
        ...t.ad,
        images: JSON.parse(t.ad.images || '[]'),
      } : null,
    }));

    return NextResponse.json({ success: true, data: safeTransactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
