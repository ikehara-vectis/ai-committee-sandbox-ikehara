import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await prisma.checklistResult.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    return NextResponse.json(result || { isChecked: false, notes: '' });
  } catch (error) {
    console.error('Error fetching checklist result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}