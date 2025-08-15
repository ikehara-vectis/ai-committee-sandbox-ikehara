import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getSampleUser() {
  return await prisma.user.findFirst({
    where: { email: 'sample@example.com' },
  });
}

async function getProgressData(userId: string) {
  // チェックリスト進捗
  const checklistProgress = await prisma.checklistResult.findMany({
    where: { userId },
    include: {
      item: true,
    },
  });

  // テスト結果
  const testResults = await prisma.testAnswer.findMany({
    where: { userId },
    include: {
      question: true,
    },
  });

  // 進捗記録
  const progressRecords = await prisma.progressRecord.findMany({
    where: { userId },
    orderBy: { recordDate: 'desc' },
  });

  return {
    checklistProgress,
    testResults,
    progressRecords,
  };
}

async function generateProgressRecord(
  userId: string, 
  checklistProgress: Array<{ isChecked: boolean; item: { level: string } }>, 
  testResults: Array<{ score: number | null; question: { maxScore: number } }>
) {
  // チェックリスト達成率を計算
  const totalChecklistItems = await prisma.checklistItem.count({ where: { isActive: true } });
  const completedItems = checklistProgress.filter(p => p.isChecked).length;
  const checklistScore = Math.floor((completedItems / totalChecklistItems) * 100);

  // テストスコアを計算
  const totalTestScore = testResults.reduce((sum, result) => sum + (result.score || 0), 0);
  const maxTestScore = testResults.reduce((sum, result) => sum + result.question.maxScore, 0);
  const testScore = maxTestScore > 0 ? Math.floor((totalTestScore / maxTestScore) * 100) : 0;

  const totalScore = Math.floor((checklistScore + testScore) / 2);

  // 現在のレベルを推定
  let techLevel = 'A';
  let bizLevel = 'a';

  if (totalScore >= 80) {
    techLevel = 'E';
    bizLevel = 'd';
  } else if (totalScore >= 60) {
    techLevel = 'C';
    bizLevel = 'c';
  } else if (totalScore >= 40) {
    techLevel = 'B';
    bizLevel = 'b';
  }

  // 前回記録と比較して改善点を生成
  const lastRecord = await prisma.progressRecord.findFirst({
    where: { userId },
    orderBy: { recordDate: 'desc' },
  });

  let improvement = '';
  if (lastRecord) {
    const scoreDiff = totalScore - lastRecord.totalScore;
    if (scoreDiff > 0) {
      improvement = `前回より${scoreDiff}点向上しました。`;
    } else if (scoreDiff < 0) {
      improvement = `前回より${Math.abs(scoreDiff)}点低下しました。継続的な学習が必要です。`;
    } else {
      improvement = '前回と同じスコアです。新しい課題に挑戦してみましょう。';
    }
  } else {
    improvement = '初回評価が完了しました。定期的な測定で成長を追跡しましょう。';
  }

  // 新しい進捗記録を作成
  await prisma.progressRecord.create({
    data: {
      userId,
      techLevel,
      bizLevel,
      totalScore,
      improvement,
      recordDate: new Date(),
    },
  });

  return { techLevel, bizLevel, totalScore, improvement };
}

export default async function ProgressPage() {
  const sampleUser = await getSampleUser();
  
  if (!sampleUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ユーザーが見つかりません</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            メインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const progressData = await getProgressData(sampleUser.id);
  
  // 進捗記録を生成（最新データで更新）
  const currentProgress = await generateProgressRecord(
    sampleUser.id,
    progressData.checklistProgress,
    progressData.testResults
  );

  // 更新後のデータを再取得
  const updatedProgressData = await getProgressData(sampleUser.id);

  // レベル別の進捗計算
  const levelProgress = ['a-b', 'b-c', 'c-d', 'A-B', 'B-C'].map(level => {
    const levelItems = progressData.checklistProgress.filter(p => p.item.level === level);
    const completed = levelItems.filter(p => p.isChecked).length;
    const total = levelItems.length;
    return {
      level,
      completed,
      total,
      percentage: total > 0 ? Math.floor((completed / total) * 100) : 0,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 進捗追跡レポート
              </h1>
              <p className="text-gray-600">
                {sampleUser.name}さんの成長記録と現状分析
              </p>
            </div>
            <Link href="/">
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                ← メインに戻る
              </button>
            </Link>
          </div>
        </header>

        {/* 現在のレベル */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">現在のレベル評価</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currentProgress.techLevel}-{currentProgress.bizLevel}
              </div>
              <p className="text-sm text-gray-600">技術・ビジネススキル</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentProgress.totalScore}点
              </div>
              <p className="text-sm text-gray-600">総合スコア</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{currentProgress.improvement}</p>
            </div>
          </div>
        </div>

        {/* レベル別進捗 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">レベル別チェックリスト進捗</h2>
          <div className="space-y-4">
            {levelProgress.map((progress) => (
              <div key={progress.level} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {progress.level}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">
                      {progress.completed}/{progress.total} 完了
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* テスト結果サマリー */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">テスト結果サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {updatedProgressData.testResults.map((result) => (
              <div key={result.id} className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {result.question.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {result.question.level} • {result.question.type}
                  </span>
                  <span className={`font-bold ${
                    (result.score || 0) / result.question.maxScore >= 0.8 
                      ? 'text-green-600'
                      : (result.score || 0) / result.question.maxScore >= 0.6
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {result.score || 0}/{result.question.maxScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 過去の進捗記録 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">進捗履歴</h2>
          <div className="space-y-4">
            {updatedProgressData.progressRecords.map((record) => (
              <div key={record.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">
                      {record.techLevel}-{record.bizLevel} レベル
                    </span>
                    <span className="ml-4 text-gray-600">
                      {record.totalScore}点
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(record.recordDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {record.improvement && (
                  <p className="text-sm text-gray-600 mt-1">{record.improvement}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}