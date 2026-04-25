import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (type) where.type = type;
    if (category) where.categorySlug = category;
    if (region) where.region = region;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }

    // If there's both a search term AND other filters, combine them properly
    if (q && (type || category || region || minPrice || maxPrice)) {
      const searchCondition = {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
        ],
      };

      // Build the AND conditions
      const andConditions: Record<string, unknown>[] = [searchCondition];

      if (type) andConditions.push({ type });
      if (category) andConditions.push({ categorySlug: category });
      if (region) andConditions.push({ region });

      if (minPrice || maxPrice) {
        const priceFilter: Record<string, unknown> = {};
        if (minPrice) priceFilter.gte = parseFloat(minPrice);
        if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
        andConditions.push({ price: priceFilter });
      }

      andConditions.push({ status: 'ACTIVE' });

      where.OR = undefined;
      where.AND = andConditions;
    }

    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      db.ad.findMany({
        where,
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
        orderBy: [
          { isUrgent: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.ad.count({ where }),
    ]);

    const safeAds = ads.map((ad) => ({
      ...ad,
      images: JSON.parse(ad.images || '[]'),
      tags: JSON.parse(ad.tags || '[]'),
      author: sanitizeUser(ad.author as Record<string, unknown>),
    }));

    return NextResponse.json({
      success: true,
      data: safeAds,
      count: total,
      page,
      totalPages: Math.ceil(total / limit),
      query: q,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
