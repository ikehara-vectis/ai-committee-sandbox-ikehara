import Link from 'next/link';

const matrixData = {
  techLevels: [
    { level: 'A', description: 'フォロー有りでタスク実行' },
    { level: 'B', description: '一人でタスク完了' },
    { level: 'C', description: '実行+メンバーフォロー' },
    { level: 'D', description: 'チーム指導・育成' },
    { level: 'E', description: '小規模PRJの完全管理' },
    { level: 'F', description: '複数PRJ管理' },
    { level: 'G', description: 'PRJ+会社業務両方実行' },
  ],
  bizLevels: [
    { level: 'a', description: '報告できない・常に気にかける必要' },
    { level: 'b', description: '事実のみ報告' },
    { level: 'c', description: '判断を含んだ報告・相談が可能' },
    { level: 'd', description: '周囲状況を考慮した判断可能' },
    { level: 'e', description: '会社全体目的を踏まえた判断' },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 育成マトリックス分析システム
          </h1>
          <p className="text-gray-600">
            技術スキル・マネジメント軸（A-G）× ビジネス・マインド軸（a-e）
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              縦軸：技術・マネジメント軸（A-G）
            </h2>
            <div className="space-y-3">
              {matrixData.techLevels.map((item) => (
                <div key={item.level} className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                    {item.level}
                  </span>
                  <span className="text-gray-700">{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              横軸：ビジネス・マインド軸（a-e）
            </h2>
            <div className="space-y-3">
              {matrixData.bizLevels.map((item) => (
                <div key={item.level} className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600">
                    {item.level}
                  </span>
                  <span className="text-gray-700">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/checklist">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-gray-800">チェックリスト</h3>
                <p className="text-sm text-gray-600">レベル別能力チェック</p>
              </div>
            </div>
          </Link>

          <Link href="/test">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="text-lg font-semibold text-gray-800">テスト問題</h3>
                <p className="text-sm text-gray-600">実践的な能力測定</p>
              </div>
            </div>
          </Link>

          <Link href="/progress">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-lg font-semibold text-gray-800">進捗追跡</h3>
                <p className="text-sm text-gray-600">成長の可視化</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">システム概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-blue-600">目的</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 社員の現状把握とレベル認識</li>
                <li>• 体系的な育成プログラム</li>
                <li>• 継続的な成長追跡</li>
                <li>• AI支援による客観的評価</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-green-600">特徴</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 2軸マトリックスによる多面評価</li>
                <li>• ライト/重いテストの使い分け</li>
                <li>• 月次実施による定期追跡</li>
                <li>• 既存コンテンツの有効活用</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
