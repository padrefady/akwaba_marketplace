import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyerId, sellerId, adId, amount, paymentMethod } = body;

    if (!buyerId || !sellerId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'buyerId, sellerId, amount, and paymentMethod are required' },
        { status: 400 }
      );
    }

    const validMethods = ['CARD', 'ORANGE_MONEY', 'MTN_MONEY', 'PAYPAL'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method. Must be CARD, ORANGE_MONEY, MTN_MONEY, or PAYPAL' },
        { status: 400 }
      );
    }

    // Verify buyer and seller exist
    const [buyer, seller] = await Promise.all([
      db.user.findUnique({ where: { id: buyerId } }),
      db.user.findUnique({ where: { id: sellerId } }),
    ]);

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'Buyer not found' },
        { status: 404 }
      );
    }

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Verify ad if provided
    if (adId) {
      const ad = await db.ad.findUnique({ where: { id: adId } });
      if (!ad) {
        return NextResponse.json(
          { success: false, error: 'Ad not found' },
          { status: 404 }
        );
      }
    }

    // Calculate fees (2% platform fee)
    const platformFee = Math.round(amount * 0.02);
    const sellerAmount = amount - platformFee;

    // Generate payment reference
    const paymentRef = `AKW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const transaction = await db.transaction.create({
      data: {
        buyerId,
        sellerId,
        adId: adId || null,
        amount,
        platformFee,
        sellerAmount,
        paymentMethod,
        paymentRef,
        status: 'PENDING',
        description: `Payment via ${paymentMethod.replace('_', ' ')}`,
      },
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

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to initiate payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
