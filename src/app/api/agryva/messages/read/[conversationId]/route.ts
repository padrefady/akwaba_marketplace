import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { userId } = body;

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
        { success: false, error: 'You are not part of this conversation' },
        { status: 403 }
      );
    }

    // Mark all unread messages in conversation where receiver is the user as read
    const result = await db.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { markedRead: result.count },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark messages as read';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
