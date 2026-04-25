import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, reviewerId, reviewedId, rating, comment } = body;

    if (!adId || !reviewerId || !reviewedId || !rating) {
      return NextResponse.json(
        { success: false, error: 'adId, reviewerId, reviewedId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (reviewerId === reviewedId) {
      return NextResponse.json(
        { success: false, error: 'You cannot review yourself' },
        { status: 400 }
      );
    }

    // Check ad exists
    const ad = await db.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check for existing review
    const existingReview = await db.review.findFirst({
      where: {
        adId,
        reviewerId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this ad' },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        adId,
        reviewerId,
        reviewedId,
        rating,
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
        reviewed: {
          select: { id: true, name: true, avatar: true },
        },
        ad: {
          select: { id: true, title: true },
        },
      },
    });

    // Create notification for reviewed user
    await db.notification.create({
      data: {
        userId: reviewedId,
        type: 'NEW_REVIEW',
        title: 'New review',
        content: `You received a ${rating}-star review from ${review.reviewer.name}`,
        link: `/ads/${adId}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...review,
          reviewer: sanitizeUser(review.reviewer as Record<string, unknown>),
          reviewed: sanitizeUser(review.reviewed as Record<string, unknown>),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'adId is required' },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
      where: { adId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    return NextResponse.json({
      success: true,
      data: reviews.map((r) => ({
        ...r,
        reviewer: sanitizeUser(r.reviewer as Record<string, unknown>),
      })),
      avgRating,
      totalReviews: reviews.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
