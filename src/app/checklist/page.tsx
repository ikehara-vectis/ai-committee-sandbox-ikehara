import { prisma } from '@/lib/prisma';
import ChecklistForm from './checklist-form';
import Link from 'next/link';

async function getChecklistItems() {
  return await prisma.checklistItem.findMany({
    where: { isActive: true },
    orderBy: [{ level: 'asc' }, { order: 'asc' }],
  });
}

async function getSampleUser() {
  return await prisma.user.findFirst({
    where: { email: 'sample@example.com' },
  });
}

export default async function ChecklistPage() {
  const [checklistItems, sampleUser] = await Promise.all([
    getChecklistItems(),
    getSampleUser(),
  ]);

  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.level]) {
      acc[item.level] = [];
    }
    acc[item.level].push(item);
    return acc;
  }, {} as Record<string, typeof checklistItems>);

  const levelInfo = {
    'a-b': { title: 'a→b レベル（基礎報告力）', color: 'bg-red-50 border-red-200' },
    'b-c': { title: 'b→c レベル（判断含む相談）', color: 'bg-orange-50 border-orange-200' },
    'c-d': { title: 'c→d レベル（周囲配慮判断）', color: 'bg-yellow-50 border-yellow-200' },
    'A-B': { title: 'A→B レベル（基礎技術）', color: 'bg-blue-50 border-blue-200' },
    'B-C': { title: 'B→C レベル（チーム協働）', color: 'bg-indigo-50 border-indigo-200' },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ✅ レベル別チェックリスト
              </h1>
              <p className="text-gray-600">
                自己診断による現状把握と能力向上のためのチェックリスト
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
            <h2 className="text-lg font-semibold mb-2">診断対象ユーザー</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">名前: {sampleUser.name}</span>
              <span className="text-gray-700">現在レベル: {sampleUser.techLevel}-{sampleUser.bizLevel}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([level, items]) => (
            <div
              key={level}
              className={`p-6 rounded-lg border-2 ${levelInfo[level as keyof typeof levelInfo]?.color || 'bg-gray-50 border-gray-200'}`}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {levelInfo[level as keyof typeof levelInfo]?.title || level}
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-3">
                      <ChecklistForm item={item} userId={sampleUser?.id || ''} />
                    </div>
                    <div className="mt-2">
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.reference && (
                        <p className="text-xs text-blue-600 mt-2">参考: {item.reference}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">チェックリストの使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-blue-600">目的</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 現在の能力レベルを客観的に把握</li>
                <li>• 次のレベルに向けた課題の明確化</li>
                <li>• 定期的な成長確認</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-green-600">使い方</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 各項目を正直に自己評価</li>
                <li>• 月1回程度の定期実施を推奨</li>
                <li>• チェック後は具体的改善行動を計画</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}