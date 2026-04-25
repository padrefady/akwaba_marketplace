import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [adsCount, usersCount, regionsCount] = await Promise.all([
      db.ad.count({ where: { status: 'ACTIVE' } }),
      db.user.count(),
      db.ad.groupBy({ by: ['region'], where: { status: 'ACTIVE', region: { not: null } } }).then((groups) => groups.length),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        adsCount,
        usersCount,
        regionsCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch public stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
