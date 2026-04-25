import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this conversation' },
        { status: 403 }
      );
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: messages.map((m) => ({
        ...m,
        sender: sanitizeUser(m.sender as Record<string, unknown>),
        receiver: sanitizeUser(m.receiver as Record<string, unknown>),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
