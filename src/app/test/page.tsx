import { prisma } from '@/lib/prisma';
import TestQuestion from './test-question';
import Link from 'next/link';

async function getTestQuestions() {
  return await prisma.testQuestion.findMany({
    where: { isActive: true },
    orderBy: [{ level: 'asc' }, { type: 'asc' }],
  });
}

async function getSampleUser() {
  return await prisma.user.findFirst({
    where: { email: 'sample@example.com' },
  });
}

export default async function TestPage() {
  const [questions, sampleUser] = await Promise.all([
    getTestQuestions(),
    getSampleUser(),
  ]);

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.level]) {
      acc[question.level] = [];
    }
    acc[question.level].push(question);
    return acc;
  }, {} as Record<string, typeof questions>);

  const levelInfo = {
    'a-b': { title: 'a→b レベル（基礎報告力）', color: 'bg-red-50 border-red-200' },
    'b-c': { title: 'b→c レベル（判断含む相談）', color: 'bg-orange-50 border-orange-200' },
    'c-d': { title: 'c→d レベル（周囲配慮判断）', color: 'bg-yellow-50 border-yellow-200' },
  };

  const typeInfo = {
    LIGHT_SHORT: { name: '短文記述', icon: '✏️', description: '50字以内での簡潔な回答' },
    LIGHT_CHOICE: { name: '場面選択', icon: '🎯', description: '選択肢から最適解を選んで理由を記述' },
    LIGHT_CASE: { name: 'ケーススタディ', icon: '📋', description: '実務場面での要点抽出・分析' },
    HEAVY_SCENARIO: { name: '重いテスト', icon: '📝', description: '詳細な記述式ケーススタディ' },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📝 レベル別テスト問題
              </h1>
              <p className="text-gray-600">
                実践的な場面想定による能力測定とAI判定
              </p>
            </div>
            <Link href="/">
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                ← メインに戻る
              </button>
            </Link>
          </div>
        </header>

        {sampleUser && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-2">テスト受験者</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">名前: {sampleUser.name}</span>
              <span className="text-gray-700">現在レベル: {sampleUser.techLevel}-{sampleUser.bizLevel}</span>
            </div>
          </div>
        )}

        {/* テストタイプの説明 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">テストタイプの説明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(typeInfo).map(([type, info]) => (
              <div key={type} className="p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">{info.icon}</div>
                <h3 className="font-semibold text-gray-800">{info.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* テスト問題 */}
        <div className="space-y-8">
          {Object.entries(groupedQuestions).map(([level, levelQuestions]) => (
            <div
              key={level}
              className={`p-6 rounded-lg border-2 ${levelInfo[level as keyof typeof levelInfo]?.color || 'bg-gray-50 border-gray-200'}`}
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                {levelInfo[level as keyof typeof levelInfo]?.title || level}
              </h2>
              <div className="grid gap-6">
                {levelQuestions.map((question) => (
                  <div key={question.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {typeInfo[question.type as keyof typeof typeInfo]?.icon || '📝'}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {question.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {typeInfo[question.type as keyof typeof typeInfo]?.name} • 
                            配点: {question.maxScore}点 • 
                            制限時間: {question.timeLimit}分
                          </p>
                        </div>
                      </div>
                    </div>
                    <TestQuestion question={question} userId={sampleUser?.id || ''} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">テストの受け方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-blue-600">準備</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 集中できる環境を整える</li>
                <li>• 制限時間を確認する</li>
                <li>• 実務経験を思い出す</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-green-600">回答時</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 問題文を最後まで読む</li>
                <li>• 具体的で実践的に答える</li>
                <li>• 理由も含めて記述する</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-purple-600">評価</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI による自動判定</li>
                <li>• 即座にフィードバック取得</li>
                <li>• 改善ポイントの確認</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}