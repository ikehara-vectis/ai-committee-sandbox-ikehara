import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// モックAI判定関数
function mockAIJudgment(answer: string, questionType: string, maxScore: number, correctAnswer?: string) {
  const answerLength = answer.length;
  const hasStructure = answer.includes('・') || answer.includes('1.') || answer.includes('①');
  
  let baseScore = 0;
  let feedback = '';

  // 問題タイプ別の判定ロジック
  switch (questionType) {
    case 'LIGHT_SHORT':
      if (answerLength >= 20 && answerLength <= 50) {
        baseScore = 20;
        feedback = '文字数が適切です。';
      } else if (answerLength < 20) {
        baseScore = 10;
        feedback = 'もう少し詳しく記述してください。';
      } else {
        baseScore = 15;
        feedback = '50文字以内で簡潔にまとめてください。';
      }
      
      if (answer.includes('お疲れ様') || answer.includes('失礼')) {
        baseScore += 5;
        feedback += ' 挨拶が含まれており良いです。';
      }
      break;

    case 'LIGHT_CHOICE':
      const [choice, reason] = answer.split('|');
      if (choice === correctAnswer) {
        baseScore = Math.floor(maxScore * 0.6); // 選択肢正解で6割
        feedback = '正しい選択肢を選びました。';
      } else {
        baseScore = Math.floor(maxScore * 0.2);
        feedback = '選択肢が異なります。';
      }
      
      if (reason && reason.length > 30) {
        baseScore += Math.floor(maxScore * 0.3);
        feedback += ' 理由も詳しく記述されています。';
      } else if (reason && reason.length > 10) {
        baseScore += Math.floor(maxScore * 0.2);
        feedback += ' 理由も記述されています。';
      }
      break;

    case 'LIGHT_CASE':
      if (answerLength >= 100) {
        baseScore = Math.floor(maxScore * 0.5);
      } else {
        baseScore = Math.floor(maxScore * 0.3);
      }
      
      const stakeholderKeywords = ['顧客', 'ミライズ', 'マーケティング', '開発', '経営', 'チーム'];
      const foundStakeholders = stakeholderKeywords.filter(keyword => answer.includes(keyword));
      
      baseScore += foundStakeholders.length * 3;
      feedback = `${foundStakeholders.length}つのステークホルダーについて言及されています。`;
      
      if (hasStructure) {
        baseScore += 5;
        feedback += ' 構造化された記述で読みやすいです。';
      }
      break;

    default:
      baseScore = Math.floor(maxScore * 0.6);
      feedback = '回答ありがとうございます。';
  }

  // 上限チェック
  const finalScore = Math.min(baseScore, maxScore);
  
  return {
    score: finalScore,
    feedback: feedback
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, answer } = await request.json();

    if (!userId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'userId, questionId, and answer are required' },
        { status: 400 }
      );
    }

    // 問題詳細を取得
    const question = await prisma.testQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // AI判定（モック）
    const judgment = mockAIJudgment(answer, question.type, question.maxScore, question.correctAnswer || undefined);

    // 回答を保存
    const result = await prisma.testAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        answer,
        score: judgment.score,
        feedback: judgment.feedback,
        submittedAt: new Date(),
      },
      create: {
        userId,
        questionId,
        answer,
        score: judgment.score,
        feedback: judgment.feedback,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving test answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}