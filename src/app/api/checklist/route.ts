import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId, isChecked, notes } = await request.json();

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'userId and itemId are required' },
        { status: 400 }
      );
    }

    const result = await prisma.checklistResult.upsert({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      update: {
        isChecked,
        notes,
        checkedAt: new Date(),
      },
      create: {
        userId,
        itemId,
        isChecked,
        notes,
        checkedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving checklist result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}