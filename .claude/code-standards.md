# BoxLog AI Code Standards - 公式準拠版

AI（Claude、GitHub Copilot等）がコード生成時に従うべき品質基準。

**重要**: Next.js/React/TypeScript公式ドキュメントのベストプラクティスに準拠しています。

## 🎯 基本方針

```
公式ドキュメント = BoxLogの標準
→ 学習コスト0、追加で覚えることなし
```

---

## 📚 公式ベストプラクティス

### 1. Next.js公式（最重要）

#### Server Component優先
```tsx
// ✅ デフォルトはServer Component
export default async function Page() {
  const data = await fetchData()  // サーバーサイドで実行
  return <div>{data}</div>
}

// ❌ 不要なClient Component化
'use client'  // ← 不要な場合は使わない
export default function Page() {
  return <div>Static content</div>
}
```

#### 'use client'は必要最小限
```tsx
// ✅ インタラクティブな部分のみ
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 親コンポーネント（Server Component）
export default function Page() {
  return (
    <div>
      <h1>Static Title</h1>
      <Counter />  {/* ここだけClient Component */}
    </div>
  )
}
```

#### next/imageで画像最適化
```tsx
// ✅ 必須：next/image使用
import Image from 'next/image'

export function Avatar() {
  return (
    <Image
      src="/avatar.png"
      alt="User Avatar"
      width={40}
      height={40}
    />
  )
}

// ❌ 禁止：<img>タグ
export function Avatar() {
  return <img src="/avatar.png" alt="Avatar" />
}
```

#### Loading UIとError Boundary
```tsx
// app/dashboard/loading.tsx - 自動Loading UI
export default function Loading() {
  return <div>Loading...</div>
}

// app/dashboard/error.tsx - 自動Error Boundary
'use client'
export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

### 2. React公式

#### Hooksはトップレベルのみ
```tsx
// ✅ 正しい
function Component() {
  const [state, setState] = useState(initial)

  useEffect(() => {
    // 処理
  }, [deps])

  return <div>{state}</div>
}

// ❌ 禁止：条件分岐内でHooks
function Component() {
  if (condition) {
    const [state] = useState()  // NG
  }

  for (let i = 0; i < 10; i++) {
    useEffect(() => {})  // NG
  }
}
```

#### イベントハンドラーに括弧不要
```tsx
// ✅ 正しい
<button onClick={handleClick}>Click</button>

// ❌ 間違い
<button onClick={handleClick()}>Click</button>
```

#### 状態は親に持ち上げる
```tsx
// ✅ 複数コンポーネントで共有する状態は親へ
function Parent() {
  const [value, setValue] = useState('')

  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  )
}
```

#### パフォーマンス最適化
```tsx
import { memo, useMemo, useCallback } from 'react'

// ✅ 高価な計算のメモ化
export const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(
    () => heavyCalculation(data),
    [data]
  )

  const handleClick = useCallback(() => {
    // 処理
  }, [])

  return <div>{processedData}</div>
})
```

---

### 3. TypeScript公式

#### any型禁止
```tsx
// ✅ 明確な型定義
interface UserData {
  id: string
  name: string
  email: string
}

function updateUser(data: UserData): Promise<void> {
  // 処理
}

// ❌ any型禁止
function updateUser(data: any): any {
  // 処理
}
```

#### 型推論の活用
```tsx
// ✅ 型推論活用
const numbers = [1, 2, 3]  // number[]と推論される
const user = { id: '1', name: 'John' }  // 型推論

// 明示的な型定義が必要な場合のみ
const users: User[] = []
```

#### interface優先（拡張可能性）
```tsx
// ✅ 拡張可能
interface User {
  id: string
  name: string
}

interface AdminUser extends User {
  role: 'admin'
}

// ✅ typeも使用可（Union等）
type Status = 'pending' | 'completed' | 'cancelled'
```

---

### 4. Next.js公式 - ファイルコロケーション原則

#### 基本方針
**関連ファイルは必ず近接配置し、機能単位で完結させる**（Next.js公式推奨）

参考: [Next.js - Project Organization and File Colocation](https://nextjs.org/docs/app/building-your-application/routing/colocation)

#### 4.1 コンポーネントとテスト
```tsx
// ✅ 推奨：関連ファイルを同じディレクトリに配置
src/components/
  ├── Button/
  │   ├── Button.tsx           // メインコンポーネント
  │   ├── Button.test.tsx      // テスト（コンポーネントの隣）
  │   ├── Button.stories.tsx   // Storybookストーリー
  │   ├── types.ts             // コンポーネント固有の型
  │   ├── index.ts             // re-export
  │   └── README.md            // 使用例・API仕様

// ❌ 禁止：テストやドキュメントの分離
src/
  ├── components/Button/Button.tsx
  ├── __tests__/Button.test.tsx     // NG: 離れた場所
  └── docs/components/button.md     // NG: 離れた場所
```

#### 4.2 App Router - ページローカルコンポーネント
```tsx
// ✅ Next.js推奨：_components でページ専用コンポーネントを配置
src/app/
  ├── dashboard/
  │   ├── page.tsx              // ページ
  │   ├── layout.tsx            // レイアウト
  │   ├── loading.tsx           // ローディング
  │   ├── error.tsx             // エラーハンドリング
  │   ├── _components/          // ページ専用（_ でルーティング除外）
  │   │   ├── DashboardChart.tsx
  │   │   ├── DashboardChart.test.tsx
  │   │   └── DashboardStats.tsx
  │   ├── hooks/                // ページ専用hooks
  │   │   └── useDashboardData.ts
  │   └── types.ts              // ページローカルな型

// ❌ 禁止：1ページでしか使わないコンポーネントの共通化
src/components/DashboardChart.tsx  // NG: dashboardページでしか使わない
```

**理由**: App Routerでは`_`プレフィックスでルーティング対象外にできる（Next.js公式機能）

#### 4.3 型定義・スキーマ・定数
```tsx
// ✅ feature単位で完結
src/features/
  ├── tasks/
  │   ├── TaskList.tsx
  │   ├── types.ts              // feature固有の型
  │   ├── schemas.ts            // Zodスキーマ
  │   ├── constants.ts          // 定数（TASK_STATUSES等）
  │   └── utils.ts              // feature固有ヘルパー

// ❌ 禁止：グローバルファイルへの安易な追加
src/types/task.ts               // NG: 複数featureで使わない限り不要
src/constants/taskStatus.ts     // NG
```

**判断基準**: 3箇所以上で使われるまでローカル配置

#### 4.4 カスタムhooks
```tsx
// ✅ パターン1：複数hooks → hooks/ディレクトリ
src/features/
  ├── calendar/
  │   ├── Calendar.tsx
  │   ├── hooks/
  │   │   ├── useCalendarState.ts
  │   │   ├── useCalendarState.test.ts
  │   │   └── useCalendarEvents.ts
  │   └── types.ts

// ✅ パターン2：単一hook → 直下配置
src/features/
  ├── search/
  │   ├── SearchBox.tsx
  │   ├── useSearchQuery.ts            // 単一hookは直下OK
  │   └── useSearchQuery.test.ts
```

#### 4.5 ユーティリティ関数
```tsx
// ✅ feature固有のヘルパー関数はローカル配置
src/features/
  ├── tasks/
  │   ├── TaskBoard.tsx
  │   ├── utils.ts              // feature固有ロジック
  │   ├── utils.test.ts         // ユーティリティのテスト
  │   └── types.ts

// ✅ 汎用的なヘルパーのみグローバル
src/utils/
  ├── date.ts                   // 日付フォーマット（全体で使用）
  └── string.ts                 // 文字列操作（全体で使用）
```

#### 4.6 API routes（tRPC）
```tsx
// ✅ tRPC router単位で完結
src/server/
  ├── routers/
  │   ├── task/
  │   │   ├── task.router.ts    // tRPCルーター
  │   │   ├── task.schema.ts    // 入力バリデーション（Zod）
  │   │   ├── task.service.ts   // ビジネスロジック
  │   │   ├── task.test.ts      // ルーターのテスト
  │   │   └── README.md         // API仕様書
  │   └── user/
  │       ├── user.router.ts
  │       └── ...
```

#### 4.7 ドキュメント配置
```tsx
// ✅ 機能単位のREADME
src/features/auth/README.md           // 認証機能の説明
docs/integrations/SENTRY.md           // Sentry統合ガイド
prisma/README.md                      // スキーマ設計ドキュメント
src/components/ui/Button/README.md   // コンポーネント使用例

// ❌ 禁止：ドキュメントの一箇所集中
docs/
  ├── all-features.md           // NG: すべての機能を1ファイルに記載
  └── api-reference.md          // NG: すべてのAPIを1ファイルに記載
```

#### 4.8 Prisma（モデル関連）
```tsx
// ✅ シードデータもモデル別に配置
prisma/
  ├── schema.prisma
  ├── migrations/
  ├── seed/
  │   ├── seed.ts               // メインシードファイル
  │   ├── users.seed.ts         // モデル別シードデータ
  │   ├── tasks.seed.ts
  │   └── projects.seed.ts
  └── README.md                 // スキーマ設計ドキュメント
```

#### 4.9 コンポーネント固有スタイル（使用する場合）
```tsx
// ✅ コンポーネントと同じディレクトリ
src/components/
  ├── Calendar/
  │   ├── Calendar.tsx
  │   ├── Calendar.module.css   // CSS Modules（使う場合）
  │   └── styles.ts             // CSS-in-JS定義（使う場合）

// ⚠️ 注意：BoxLogでは基本的に /src/config/theme 使用推奨
```

#### 4.10 コロケーション判断基準

| 項目 | ローカル配置 | グローバル配置 |
|------|------------|--------------|
| **コンポーネント** | 1つのfeature/ページでのみ使用 | 3箇所以上で再利用 |
| **型定義** | 1つのfeatureでのみ使用 | 複数featureで共有 |
| **hooks** | 1つのfeatureでのみ使用 | 複数featureで再利用 |
| **utils** | feature固有のロジック | 汎用的なヘルパー関数 |
| **定数** | feature固有の値 | アプリ全体の設定値 |
| **テスト** | **常にコンポーネント/関数の隣** | N/A |
| **ドキュメント** | **常に機能/コンポーネントの隣** | N/A |

**黄金ルール**: 迷ったらローカル配置 → 3箇所以上で使われたらグローバル化検討

---

## 🎨 BoxLog固有ルール（最小限）

### テーマシステム使用（唯一の独自ルール）
```tsx
// ✅ 必須：themeシステム使用
import { colors, spacing, typography } from '@/config/theme'

const Component = () => (
  <div className={colors.background.base}>
    <h1 className={typography.heading.h1}>Title</h1>
    <div className={spacing.component.md}>Content</div>
  </div>
)

// ❌ 禁止：直接指定
const Component = () => (
  <div className="bg-white dark:bg-gray-900">
    <h1 className="text-2xl font-bold">Title</h1>
    <div className="p-4">Content</div>
  </div>
)
```

---

## 📦 標準コンポーネント構造

```tsx
import { FC } from 'react'
import { colors, typography } from '@/config/theme'

interface Props {
  title: string
  description?: string
  onAction: () => void
}

export const MyComponent: FC<Props> = ({
  title,
  description,
  onAction
}) => {
  return (
    <div className={colors.background.base}>
      <h2 className={typography.heading.h2}>{title}</h2>
      {description && (
        <p className={typography.body.base}>{description}</p>
      )}
      <button type="button" onClick={onAction}>
        Action
      </button>
    </div>
  )
}
```

---

## 🚀 API呼び出しパターン

```tsx
// Server Component（推奨）
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()

  return <div>{json.title}</div>
}

// Client Component（必要な場合のみ）
'use client'
import { useState, useEffect } from 'react'

export function ClientData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading...</div>
  return <div>{data.title}</div>
}
```

---

## 🧪 エラーハンドリング

```tsx
// ✅ 適切なエラーハンドリング
async function fetchData(id: string) {
  try {
    const response = await fetch(`/api/data/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}
```

---

## 📊 品質メトリクス目標

- 関数複雑度: 10以下
- ファイル行数: 300行以下
- 関数行数: 50行以下
- Server Component比率: 80%以上

---

## 🎯 チェックリスト

コード生成時に自動確認：

- [ ] Next.js: Server Component優先、'use client'は最小限
- [ ] Next.js: next/imageで画像最適化
- [ ] Next.js: 関連ファイルは近接配置（コロケーション原則）
- [ ] React: Hooksはトップレベルのみ
- [ ] React: イベントハンドラーに括弧不要
- [ ] TypeScript: any型禁止、明確な型定義
- [ ] BoxLog: テーマシステム使用（直接指定禁止）
- [ ] エラーハンドリング実装済み
- [ ] テスト・型・ドキュメントがコンポーネント/機能の隣に配置されている

---

## 💡 公式ドキュメント参照先

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/

---

**最終更新**: 2025-10-01
**バージョン**: v2.1 - コロケーション原則追加
**ESLint設定**: Next.js公式推奨（`next/core-web-vitals`）