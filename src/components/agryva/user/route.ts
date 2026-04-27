import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId requis" }, { status: 400 });
    }

    // Fetch user public profile
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        region: true,
        city: true,
        role: true,
        plan: true,
        isVerified: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: { select: { ads: true, reviewsReceived: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Calculate average rating
    const reviewsAgg = await db.review.aggregate({
      where: { reviewedId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Fetch user's active ads
    const ads = await db.ad.findMany({
      where: { authorId: userId, status: "ACTIVE" },
      include: {
        category: { select: { name: true, slug: true, icon: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch recent reviews
    const reviews = await db.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        ad: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        avgRating: reviewsAgg._avg.rating ? Math.round(reviewsAgg._avg.rating * 10) / 10 : 0,
        totalReviews: reviewsAgg._count.rating || 0,
        ads,
        reviews,
      },
    });
  } catch (error) {
    console.error("User profile API error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
