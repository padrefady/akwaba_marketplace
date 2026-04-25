import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otherUserId, adId } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { success: false, error: 'userId and otherUserId are required' },
        { status: 400 }
      );
    }

    if (userId === otherUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot create conversation with yourself' },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these two users for this ad
    const existingWhere: Record<string, unknown> = {
      OR: [
        { user1Id: userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: userId },
      ],
    };

    if (adId) {
      existingWhere.adId = adId;
    }

    const existing = await db.conversation.findFirst({
      where: existingWhere,
      include: {
        user1: {
          select: { id: true, name: true, avatar: true, isOnline: true, lastSeen: true },
        },
        user2: {
          select: { id: true, name: true, avatar: true, isOnline: true, lastSeen: true },
        },
        ad: {
          select: { id: true, title: true, images: true, price: true, priceUnit: true },
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          ...existing,
          ad: existing.ad ? {
            ...existing.ad,
            images: JSON.parse(existing.ad.images || '[]'),
          } : null,
        },
      });
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        user1Id: userId,
        user2Id: otherUserId,
        adId: adId || null,
      },
      include: {
        user1: {
          select: { id: true, name: true, avatar: true, isOnline: true, lastSeen: true },
        },
        user2: {
          select: { id: true, name: true, avatar: true, isOnline: true, lastSeen: true },
        },
        ad: {
          select: { id: true, title: true, images: true, price: true, priceUnit: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...conversation,
          ad: conversation.ad ? {
            ...conversation.ad,
            images: JSON.parse(conversation.ad.images || '[]'),
          } : null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create conversation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
