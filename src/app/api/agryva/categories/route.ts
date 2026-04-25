import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/agryva/categories
// GET /api/agryva/categories?action=stats (returns platform stats)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // If action=stats, return platform statistics
    if (action === 'stats') {
      const [totalAds, totalUsers, regionsData] = await Promise.all([
        db.ad.count({ where: { status: 'ACTIVE' } }),
        db.user.count(),
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
    }

    // Default: return categories
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { ads: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    const categoriesWithCount = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      slug: cat.slug,
      order: cat.order,
      adCount: cat._count.ads,
    }));

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}