import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/agryva/favorites/check?userId=xxx&adId=yyy — Check if ad is favorited by user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const adId = searchParams.get('adId');

    if (!userId || !adId) {
      return NextResponse.json(
        { success: false, error: 'userId and adId are required' },
        { status: 400 }
      );
    }

    const favorite = await db.favorite.findUnique({
      where: {
        userId_adId: { userId, adId }
      }
    });

    return NextResponse.json({
      success: true,
      data: { isFavorited: !!favorite }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check favorite';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
