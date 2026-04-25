import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { success: false, error: 'userId and plan are required' },
        { status: 400 }
      );
    }

    const validPlans = ['FREE', 'PREMIUM', 'VIP'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Must be FREE, PREMIUM, or VIP' },
        { status: 400 }
      );
    }

    // Get the payment plan details
    const paymentPlan = await db.paymentPlan.findUnique({ where: { name: plan } });
    if (!paymentPlan) {
      return NextResponse.json(
        { success: false, error: 'Payment plan not found' },
        { status: 404 }
      );
    }

    // Calculate expiration (1 month from now)
    const planExpiresAt = plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const user = await db.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt,
      },
      select: {
        id: true,
        name: true,
        plan: true,
        planExpiresAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upgrade plan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
