import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.paymentPlan.findMany({
      orderBy: { price: 'asc' },
    });

    const enriched = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payment plans';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
