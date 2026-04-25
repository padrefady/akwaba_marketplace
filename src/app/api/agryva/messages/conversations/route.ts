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

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Enrich conversations
    const enriched = conversations.map((conv) => {
      const isUser1 = conv.user1Id === userId;
      const otherUser = isUser1 ? conv.user2 : conv.user1;

      // Count unread messages
      const unreadCount = 0; // We'd need to filter for unread in a real query
      // For SQLite we check last message read status
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        otherUser: sanitizeUser(otherUser as Record<string, unknown>),
        ad: conv.ad ? {
          ...conv.ad,
          images: JSON.parse(conv.ad.images || '[]'),
        } : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
              isRead: lastMessage.isRead,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
