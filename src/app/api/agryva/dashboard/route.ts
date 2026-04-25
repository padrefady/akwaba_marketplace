import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/agryva/dashboard/?userId=xxx — Get dashboard statistics
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

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Run all queries in parallel for performance
    const [
      totalAds,
      activeAds,
      adsForViews,
      transactionsAsBuyer,
      transactionsAsSeller,
      reviewsReceived,
      recentAds,
      userConversations,
      unreadNotifications,
      newAdsSinceLastVisit
    ] = await Promise.all([
      // Total ads count
      db.ad.count({ where: { authorId: userId } }),

      // Active ads count
      db.ad.count({ where: { authorId: userId, status: 'ACTIVE' } }),

      // Ads with views for total views
      db.ad.findMany({
        where: { authorId: userId },
        select: { viewsCount: true }
      }),

      // Transactions as buyer
      db.transaction.findMany({
        where: { buyerId: userId, status: 'COMPLETED' }
      }),

      // Transactions as seller
      db.transaction.findMany({
        where: { sellerId: userId, status: 'COMPLETED' }
      }),

      // Reviews received for average rating
      db.review.findMany({
        where: { reviewedId: userId },
        select: { rating: true }
      }),

      // Recent 5 ads by this user
      db.ad.findMany({
        where: { authorId: userId },
        include: {
          category: { select: { name: true, slug: true, icon: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // User conversations for recent messages
      db.conversation.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        include: {
          user1: { select: { id: true, name: true, avatar: true } },
          user2: { select: { id: true, name: true, avatar: true } },
          ad: { select: { id: true, title: true, images: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        take: 5
      }),

      // Unread notifications count
      db.notification.count({
        where: { userId, isRead: false }
      }),

      // New ads since last visit (limit 10)
      db.ad.findMany({
        where: {
          authorId: { not: userId },
          status: 'ACTIVE',
          createdAt: { gt: user.lastSeen }
        },
        include: {
          author: { select: { id: true, name: true, avatar: true, region: true } },
          category: { select: { name: true, slug: true, icon: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Calculate stats
    const totalViews = adsForViews.reduce((sum, ad) => sum + ad.viewsCount, 0);
    const allTransactions = [...transactionsAsBuyer, ...transactionsAsSeller];
    const totalTransactions = allTransactions.length;
    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.sellerAmount, 0);
    const avgRating = reviewsReceived.length > 0
      ? reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length
      : 0;

    // Count total messages for user
    const totalMessages = await db.message.count({
      where: { receiverId: userId }
    });

    // Format recent conversations with last message
    const recentMessages = userConversations.map(conv => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;
      return {
        id: conv.id,
        otherUser,
        ad: conv.ad,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead
        } : null,
        lastMessageAt: conv.lastMessageAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAds,
          activeAds,
          totalViews,
          totalMessages,
          totalTransactions,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10 // Round to 1 decimal
        },
        recentAds,
        recentMessages,
        unreadNotifications,
        newAdsSinceLastVisit
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
