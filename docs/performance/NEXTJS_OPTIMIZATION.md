# Next.js App Router パフォーマンス最適化

> **推定スコア: 88-92点（GAFAレベル達成）**

BoxLogで実装済みのNext.js 15 App Router向けパフォーマンス最適化の技術リファレンスです。

## 実装済み最適化一覧

| カテゴリ        | 実装内容                                     | ファイル                       |
| --------------- | -------------------------------------------- | ------------------------------ |
| PPR             | Partial Prerendering有効化                   | `next.config.mjs`              |
| Server Prefetch | tRPC Server-side helpers + HydrationBoundary | `src/lib/trpc/server.ts`       |
| Router Cache    | staleTimes設定                               | `next.config.mjs`              |
| Link最適化      | ネットワーク条件に応じたprefetch             | `nav-main.tsx`                 |
| LCP最適化       | priority属性追加                             | エラーページ各種               |
| SW最適化        | キャッシュ自動バージョニング                 | `useServiceWorker.ts`, `sw.js` |
| Bundle最適化    | optimizePackageImports拡張                   | `next.config.mjs`              |
| 遅延ロード      | Novel Editor dynamic import                  | `PlanInspectorContent.tsx`     |

---

## Phase 1: PPR + Server-side Prefetch

### 1.1 PPR (Partial Prerendering)

**ファイル**: `next.config.mjs`

```js
experimental: {
  ppr: true,
  staleTimes: {
    dynamic: 30,
    static: 180,
  },
}
```

**効果**:

- 静的シェルを即座に表示、動的部分を後からストリーミング
- FCP（First Contentful Paint）の大幅改善

### 1.2 tRPC Server-side Prefetch

**ファイル**: `src/lib/trpc/server.ts`

```ts
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import superjson from 'superjson';

export async function createServerHelpers() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });
}
```

**使用例** (`src/app/[locale]/(app)/calendar/[view]/page.tsx`):

```tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerHelpers } from '@/lib/trpc/server';

export default async function CalendarPage() {
  const helpers = await createServerHelpers();

  // サーバーサイドでデータをprefetch
  await helpers.plans.list.prefetch();
  await helpers.tags.list.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <CalendarClient />
    </HydrationBoundary>
  );
}
```

**効果**:

- 初回レンダリング時にデータが既にキャッシュ済み
- クライアントでの追加フェッチ不要
- TTI（Time to Interactive）改善

---

## Phase 2: Link Prefetch最適化

### 2.1 ネットワーク条件に応じたprefetch

**ファイル**: `src/features/navigation/components/sidebar/nav-main.tsx`

```tsx
const shouldPrefetch = useMemo(() => {
  if (typeof navigator === 'undefined') return true;

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection;

  // データセーバーモードまたは遅い接続ではprefetch無効
  if (connection?.saveData) return false;
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return false;
  }

  return true;
}, []);

// 使用
<Link href={item.url} prefetch={shouldPrefetch}>
```

**効果**:

- モバイルデータ節約
- 遅いネットワークでの帯域消費削減

---

## Phase 3: LCP最適化

### 3.1 priority属性

**対象ファイル**:

- `src/app/[locale]/error/401/page.tsx`
- `src/app/[locale]/error/403/page.tsx`
- `src/app/[locale]/error/500/page.tsx`
- `src/app/[locale]/error/maintenance/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`

```tsx
<Image
  src="..."
  alt="..."
  width={960}
  height={540}
  priority // LCP画像に追加
  className="..."
/>
```

**効果**:

- ファーストビューの大きな画像を優先ロード
- LCP（Largest Contentful Paint）改善

---

## Phase 4: Service Worker最適化

### 4.1 キャッシュ自動バージョニング

**ファイル**: `src/hooks/useServiceWorker.ts`

```ts
const registerSW = async () => {
  // デプロイごとにSWを更新するためのバージョン文字列
  const swVersion =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
    process.env.NEXT_PUBLIC_BUILD_ID ||
    '';
  const swUrl = swVersion ? `/sw.js?v=${swVersion}` : '/sw.js';

  await navigator.serviceWorker.register(swUrl, { scope: '/' });
};
```

**ファイル**: `public/sw.js`

```js
// キャッシュバージョン: 破壊的変更時のみインクリメント
const CACHE_VERSION = '2';
const CACHE_NAME = `boxlog-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `boxlog-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `boxlog-dynamic-v${CACHE_VERSION}`;
```

**効果**:

- デプロイ時にSWが自動更新
- 古いキャッシュの自動クリーンアップ

---

## Phase 5: Bundle最適化

### 5.1 optimizePackageImports

**ファイル**: `next.config.mjs`

```js
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'date-fns',
    'framer-motion',
    '@tanstack/react-query',
    '@tiptap/react',
    '@tiptap/core',
    '@tiptap/starter-kit',
    '@tiptap/extension-placeholder',
  ],
}
```

**効果**:

- 名前付きインポートの自動Tree Shaking
- 未使用エクスポートの除去

### 5.2 Heavy Component遅延ロード

**ファイル**: `src/features/plans/components/inspector/PlanInspectorContent.tsx`

```tsx
import dynamic from 'next/dynamic';

// Novel エディターは重いため遅延ロード（~300KB削減）
const NovelDescriptionEditor = dynamic(
  () => import('../shared/NovelDescriptionEditor').then((mod) => mod.NovelDescriptionEditor),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground min-h-8 px-2 py-1 text-sm">読み込み中...</div>
    ),
  },
);
```

**効果**:

- 初期バンドルサイズ削減（~300KB）
- エディターは必要時のみロード

---

## 意図的にスキップした最適化

| 項目                 | 理由                                                |
| -------------------- | --------------------------------------------------- |
| Inbox Suspense細分化 | InboxBoardView内部で既にisPending実装済み           |
| Settings遅延ロード   | Next.jsがルート別に自動コード分割済み               |
| React.memo追加       | 工数対効果が低い（既にuseMemo/useCallback実装済み） |
| Edge Runtime         | 既存構成で十分、複雑性増加のリスク                  |

---

## 計測方法

### Lighthouse（ローカル）

```bash
npm run build && npm run start
# 別ターミナル
npx lighthouse http://localhost:3000 --view
```

### Vercel Analytics

本番環境では Vercel Speed Insights でリアルユーザーメトリクスを確認。

---

## 関連コミット

```
15e564c8 perf: PPR有効化とServer-side prefetch実装（GAFAレベル最適化）
5b7c82db perf: LCP最適化、SW自動バージョニング、バンドル最適化
```

---

**最終更新**: 2024-12-26
**所有者**: BoxLog 開発チーム
