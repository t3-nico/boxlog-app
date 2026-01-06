# 重要概念の解説

BoxLogの開発で理解しておくべき重要な概念を解説する。

## 目次

1. [型安全性](#型安全性)
2. [Server Components vs Client Components](#server-components-vs-client-components)
3. [楽観的更新](#楽観的更新)
4. [RLS (Row Level Security)](#rls-row-level-security)
5. [セマンティックトークン](#セマンティックトークン)

---

## 型安全性

### 一言で言うと

「コードを実行する前に、バグを発見できる仕組み」

### なぜ必要か

```typescript
// ❌ 型がないと実行時にエラー
function greet(user) {
  return `Hello, ${user.name}!`; // userがundefinedだとクラッシュ
}

// ✅ 型があるとコンパイル時にエラー
function greet(user: { name: string }) {
  return `Hello, ${user.name}!`; // 型が合わないとエディタが警告
}
```

### BoxLogでの活用

- **TypeScript strict mode**: 厳格な型チェック
- **Zod**: ランタイムバリデーション + 型推論
- **tRPC**: クライアント↔サーバー間の型安全

### GAFAの方針

Googleは「TypeScriptを積極的に採用」（Angular, gRPC）
Metaは「Flow → TypeScript移行」を実施

---

## Server Components vs Client Components

### 一言で言うと

- **Server Components**: サーバーで実行、JavaScriptをブラウザに送らない
- **Client Components**: ブラウザで実行、インタラクティブ

### 使い分け

| 機能                | Server              | Client      |
| ------------------- | ------------------- | ----------- |
| データ取得          | ✅ 直接DBアクセス可 | ❌ API経由  |
| useState, useEffect | ❌ 使えない         | ✅ 使える   |
| onClick等イベント   | ❌ 使えない         | ✅ 使える   |
| バンドルサイズ      | ✅ 含まれない       | ❌ 含まれる |

### 判断フロー

```
インタラクティブ？
  ├─ Yes → 'use client'
  └─ No → Server Component (デフォルト)
```

### BoxLogでの実践

```tsx
// src/app/[locale]/(app)/calendar/page.tsx
// Server Component（データ取得）
export default async function CalendarPage() {
  // サーバーでデータ取得
  return <CalendarClient initialData={data} />;
}

// src/features/calendar/components/CalendarClient.tsx
('use client'); // Client Component（インタラクション）
export function CalendarClient({ initialData }) {
  const [view, setView] = useState('week');
  // ...
}
```

---

## 楽観的更新

### 一言で言うと

「サーバーの応答を待たずに、UIを先に更新する」

### なぜ必要か

- ユーザー体験の向上（待ち時間がない）
- アプリが「速く」感じる

### 仕組み

```
1. ユーザーが操作
2. UIを即座に更新（楽観的）
3. サーバーにリクエスト送信
4. 成功 → そのまま
   失敗 → UIを元に戻す（ロールバック）
```

### BoxLogでの実装

```typescript
const deletePlan = api.plans.delete.useMutation({
  onMutate: async ({ id }) => {
    // 1. キャッシュを取得
    const previousPlans = utils.plans.list.getData();

    // 2. 楽観的に更新
    utils.plans.list.setData(previousPlans.filter((p) => p.id !== id));

    return { previousPlans }; // ロールバック用
  },
  onError: (err, variables, context) => {
    // 3. エラー時はロールバック
    utils.plans.list.setData(context.previousPlans);
  },
});
```

---

## RLS (Row Level Security)

### 一言で言うと

「データベースレベルで、誰がどのデータにアクセスできるか制御する」

### なぜ必要か

```sql
-- RLSがないと...
SELECT * FROM plans;  -- 全ユーザーのデータが見える！

-- RLSがあると...
SELECT * FROM plans;  -- 自分のデータだけ見える
```

### Supabaseでの設定

```sql
-- ポリシー: ユーザーは自分のプランのみ操作可能
CREATE POLICY "Users can manage own plans"
ON plans
FOR ALL
USING (auth.uid() = user_id);
```

### メリット

- アプリケーションコードにバグがあっても、データは守られる
- 「ゼロトラスト」セキュリティ
- Googleのセキュリティ原則に準拠

---

## セマンティックトークン

### 一言で言うと

「色を直接指定せず、意味のある名前で指定する」

### なぜ必要か

```tsx
// ❌ 直接色指定
<div className="bg-white text-black">  // ダークモードで見えない！

// ✅ セマンティックトークン
<div className="bg-background text-foreground">  // 自動でダークモード対応
```

### BoxLogのトークン（globals.css）

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --primary: #2563eb;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #1a1a1a;
  --primary: #3b82f6;
}
```

### 使い方

```tsx
<div className="bg-background">      // 背景
<div className="bg-card">            // カード背景
<div className="text-foreground">    // テキスト
<div className="text-muted-foreground">  // 薄いテキスト
<div className="border-border">      // 境界線
```

---

## 学習の進め方

より詳しく学びたい場合は：

1. `/learn [トピック]` コマンドで個別解説
2. `/explain [ファイルパス]` でコードの解説
3. 公式ドキュメントを参照

### 推奨リソース

| トピック       | 公式ドキュメント             |
| -------------- | ---------------------------- |
| Next.js        | https://nextjs.org/docs      |
| tRPC           | https://trpc.io/docs         |
| Zustand        | https://zustand-demo.pmnd.rs |
| Supabase       | https://supabase.com/docs    |
| TanStack Query | https://tanstack.com/query   |
