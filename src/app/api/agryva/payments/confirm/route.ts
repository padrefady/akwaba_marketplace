import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'transactionId is required' },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Transaction is already ${transaction.status}` },
        { status: 400 }
      );
    }

    const updated = await db.transaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED' },
      include: {
        buyer: {
          select: { id: true, name: true },
        },
        seller: {
          select: { id: true, name: true },
        },
        ad: {
          select: { id: true, title: true },
        },
      },
    });

    // Mark ad as sold if ad exists
    if (transaction.adId) {
      await db.ad.update({
        where: { id: transaction.adId },
        data: { status: 'SOLD' },
      });
    }

    // Create notifications
    await Promise.all([
      db.notification.create({
        data: {
          userId: transaction.sellerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment received',
          content: `You received ${transaction.sellerAmount} FCFA for ${transaction.adId ? 'a transaction' : 'a sale'}`,
          link: `/dashboard/transactions`,
        },
      }),
      db.notification.create({
        data: {
          userId: transaction.buyerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment confirmed',
          content: `Your payment of ${transaction.amount} FCFA has been confirmed`,
          link: `/dashboard/transactions`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to confirm payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
