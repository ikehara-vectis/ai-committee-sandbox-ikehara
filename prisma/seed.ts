import { PrismaClient, TestType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // チェックリスト項目の作成
  await createChecklistItems();
  
  // テスト問題の作成
  await createTestQuestions();
  
  // サンプルユーザーの作成
  await createSampleUsers();
}

async function createChecklistItems() {
  const checklistItems = [
    // a→b レベル（基礎報告力）
    {
      level: 'a-b',
      title: '挨拶：相手に聞こえるハキハキとした声で挨拶できているか',
      description: '基本的なビジネスマナーとしての挨拶',
      reference: '『能力によらない姿勢』',
      order: 1,
    },
    {
      level: 'a-b',
      title: '受け手は誰か？視点を考えて報告できているか',
      description: '報告相手を意識したコミュニケーション',
      reference: '『10分スキル：報告』p.416',
      order: 2,
    },
    {
      level: 'a-b',
      title: '状況・判断・理由がセットで伝えられているか',
      description: '報告の基本的な構造を理解している',
      reference: '『10分スキル：報告』p.418',
      order: 3,
    },
    {
      level: 'a-b',
      title: '言いづらいことも正直に伝えられているか',
      description: 'ネガティブな情報も隠さず報告できる',
      reference: '『10分スキル：報告』p.424',
      order: 4,
    },

    // b→c レベル（判断含む相談）
    {
      level: 'b-c',
      title: '提案や選択肢が含まれた相談ができているか',
      description: '単なる報告ではなく判断を求める相談',
      reference: '『10分スキル：報告』p.420',
      order: 1,
    },
    {
      level: 'b-c',
      title: '相談前に、自分なりの考えを整理できているか',
      description: '丸投げではなく自分の意見を持って相談',
      reference: '『10分スキル：相談力』p.580',
      order: 2,
    },
    {
      level: 'b-c',
      title: '「報告」と「相談」を区別できているか',
      description: 'コミュニケーションの目的を理解している',
      reference: '『働く原則3カ条』p.240',
      order: 3,
    },
    {
      level: 'b-c',
      title: '丸投げではなく、自分の考えを持った相談ができているか',
      description: '責任を持った相談スキル',
      reference: '『10分スキル：相談力』p.601',
      order: 4,
    },

    // c→d レベル（周囲配慮判断）
    {
      level: 'c-d',
      title: '相手の立場・背景・時間を考慮して話せているか',
      description: 'ステークホルダーへの配慮',
      reference: '『10分スキル：相談力』p.584',
      order: 1,
    },
    {
      level: 'c-d',
      title: '誰に・いつ・どの手段で相談するかを意識できているか',
      description: '最適な相談方法の選択',
      reference: '『10分スキル：相談力』p.605',
      order: 2,
    },
    {
      level: 'c-d',
      title: '意思決定 → 実行 → チェック → 報告のサイクルを意識できているか',
      description: 'PDCAサイクルの理解',
      reference: '『働く原則3カ条』p.252',
      order: 3,
    },

    // A→B レベル（基礎技術）
    {
      level: 'A-B',
      title: '基本的な開発環境の構築・操作ができているか',
      description: '開発に必要なツールの使用',
      reference: '技術基準',
      order: 1,
    },
    {
      level: 'A-B',
      title: '指示された機能を一人で実装できているか',
      description: '独立したタスク遂行能力',
      reference: '技術基準',
      order: 2,
    },
    {
      level: 'A-B',
      title: 'コーディング規約に沿った実装ができているか',
      description: '品質基準の遵守',
      reference: '技術基準',
      order: 3,
    },
  ];

  for (const item of checklistItems) {
    const existing = await prisma.checklistItem.findFirst({
      where: { title: item.title }
    });
    if (!existing) {
      await prisma.checklistItem.create({ data: item });
    }
  }
}

async function createTestQuestions() {
  const testQuestions = [
    {
      level: 'a-b',
      type: TestType.LIGHT_SHORT,
      title: 'EC サイトバグ報告',
      content: `あなたはECサイトの商品検索機能を担当しています。
動作テスト中に「商品名で検索すると画面が真っ白になる」現象を発見しました。
上司への第一報として、最初に何と言いますか？（50字以内）`,
      maxScore: 30,
      timeLimit: 10,
    },
    {
      level: 'b-c',
      type: TestType.LIGHT_CHOICE,
      title: '決済機能バグ対応相談',
      content: `あなたはWebアプリの決済機能開発を担当しています。
テスト中に「クレジットカード決済が5%の確率で失敗する」問題を発見。
明日が本番リリース予定で、顧客には「明日から利用可能」と案内済みです。
上司は現在、重要な会議中（1時間後に終了予定）です。

どの行動が最も適切ですか？`,
      options: JSON.stringify([
        'A) すぐに上司の会議を中断して報告',
        'B) 決済エラーの原因調査と回避策3案を検討してから相談',
        'C) 他の開発メンバーに意見を聞いてから報告',
        'D) リリースを延期すべきかを自分で判断してから報告'
      ]),
      correctAnswer: 'B',
      maxScore: 25,
      timeLimit: 15,
    },
    {
      level: 'c-d',
      type: TestType.LIGHT_CASE,
      title: 'リリース遅延の影響分析',
      content: `あなたはミライズ社向けWebアプリ開発のサブリーダーです。
本日15時、リリース予定だった新機能に重大なバグが発見されました。
修正には最低2日必要。ミライズ社は明日の株主総会でこの機能をデモ予定で、
マーケティング部は既に顧客への案内メールを送信済み。
開発チームは他のプロジェクトとの兼務でリソース逼迫中。

この状況で考慮すべき利害関係者4つと、それぞれへの具体的影響を述べよ。`,
      maxScore: 40,
      timeLimit: 20,
    },
  ];

  for (const question of testQuestions) {
    const existing = await prisma.testQuestion.findFirst({
      where: { title: question.title }
    });
    if (!existing) {
      await prisma.testQuestion.create({ data: question });
    }
  }
}

async function createSampleUsers() {
  await prisma.user.upsert({
    where: { email: 'sample@example.com' },
    update: {},
    create: {
      name: 'サンプル太郎',
      email: 'sample@example.com',
      position: '新人エンジニア',
      techLevel: 'A',
      bizLevel: 'a',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });