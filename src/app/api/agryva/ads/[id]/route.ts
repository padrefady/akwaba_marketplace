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
    const { id } = await params;

    const ad = await db.ad.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            phone: true,
            region: true,
            city: true,
            plan: true,
            isVerified: true,
            createdAt: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Increment views count
    await db.ad.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Calculate average rating
    let avgRating = 0;
    if (ad.reviews.length > 0) {
      avgRating = ad.reviews.reduce((sum, r) => sum + r.rating, 0) / ad.reviews.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...ad,
        viewsCount: ad.viewsCount + 1,
        images: JSON.parse(ad.images || '[]'),
        tags: JSON.parse(ad.tags || '[]'),
        author: sanitizeUser(ad.author as Record<string, unknown>),
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ad';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    if (existing.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit this ad' },
        { status: 403 }
      );
    }

    // Process tags
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.images) {
      updateData.images = JSON.stringify(updateData.images);
    }

    // Remove undefined fields
    const cleanData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    }

    const ad = await db.ad.update({
      where: { id },
      data: cleanData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            region: true,
            city: true,
            plan: true,
            isVerified: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...ad,
        images: JSON.parse(ad.images || '[]'),
        tags: JSON.parse(ad.tags || '[]'),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update ad';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    if (existing.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this ad' },
        { status: 403 }
      );
    }

    await db.ad.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Ad deleted successfully' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete ad';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
