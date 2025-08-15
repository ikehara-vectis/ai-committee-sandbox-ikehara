import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    questionId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { questionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await prisma.testAnswer.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching test answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}