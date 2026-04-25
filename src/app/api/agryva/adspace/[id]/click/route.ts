import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await db.advertisement.findUnique({ where: { id } });
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    const updated = await db.advertisement.update({
      where: { id },
      data: { clicksCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to track click';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
