import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/agryva/stats — Public platform statistics (no auth required)
export async function GET() {
  try {
    const [totalAds, totalUsers, regionsData] = await Promise.all([
      // Total active ads
      db.ad.count({ where: { status: 'ACTIVE' } }),

      // Total registered users
      db.user.count(),

      // Distinct regions from users + ads
      db.$queryRaw<Array<{ region: string }>>`
        SELECT DISTINCT region FROM (
          SELECT region FROM "User" WHERE region IS NOT NULL
          UNION
          SELECT region FROM "Ad" WHERE region IS NOT NULL
        ) AS combined_regions
      `,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalAds,
        totalUsers,
        totalRegions: regionsData.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}