import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function sanitizeUser(user: { password?: string; [key: string]: unknown }) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const authorId = searchParams.get('authorId');

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (type) where.type = type;
    if (category) where.categorySlug = category;
    if (region) where.region = region;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
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
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      price,
      priceUnit,
      type,
      categorySlug,
      condition,
      quantity,
      region,
      city,
      negociable,
      delivery,
      tags,
      isUrgent,
    } = body;

    if (!userId || !title || !description || !categorySlug) {
      return NextResponse.json(
        { success: false, error: 'userId, title, description, and categorySlug are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if category exists
    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check ad limit based on user plan
    const plan = await db.paymentPlan.findUnique({ where: { name: user.plan } });
    if (plan && plan.maxAds < 999) {
      const currentAdCount = await db.ad.count({
        where: {
          authorId: userId,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
      });
      if (currentAdCount >= plan.maxAds) {
        return NextResponse.json(
          {
            success: false,
            error: `Limite atteinte : vous avez déjà ${currentAdCount} annonce(s) sur ${plan.maxAds} autorisée(s) avec le plan ${plan.displayName}. Passez à un plan supérieur pour publier plus d'annonces.`,
            code: 'AD_LIMIT_REACHED',
            currentAds: currentAdCount,
            maxAds: plan.maxAds,
          },
          { status: 403 }
        );
      }
    }

    // Determine ad status based on user plan
    const status = user.plan === 'FREE' ? 'PENDING' : 'ACTIVE';

    const ad = await db.ad.create({
      data: {
        title,
        description,
        price: price !== undefined ? parseFloat(price) : null,
        priceUnit: priceUnit || null,
        type: type || 'OFFER',
        categorySlug,
        condition: condition || null,
        quantity: quantity || null,
        region: region || null,
        city: city || null,
        negociable: negociable !== undefined ? negociable : true,
        delivery: delivery || false,
        tags: tags ? JSON.stringify(tags) : '[]',
        isUrgent: isUrgent || false,
        status,
        authorId: userId,
        // Set expiration (30 days from now)
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          ...ad,
          images: JSON.parse(ad.images || '[]'),
          tags: JSON.parse(ad.tags || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ad';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
