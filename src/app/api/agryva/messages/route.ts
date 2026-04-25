import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, receiverId, content } = body;

    if (!conversationId || !senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'conversationId, senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    // Verify conversation exists and sender is part of it
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      return NextResponse.json(
        { success: false, error: 'You are not part of this conversation' },
        { status: 403 }
      );
    }

    // Create message
    const message = await db.message.create({
      data: {
        content,
        conversationId,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation's lastMessageAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New message',
        content: `${message.sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        link: `/messages/${conversationId}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...message,
          sender: sanitizeUser(message.sender as Record<string, unknown>),
          receiver: sanitizeUser(message.receiver as Record<string, unknown>),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
