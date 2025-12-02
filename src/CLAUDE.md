# src/ - コーディング基本ルール

> **⚠️ 重要**: このドキュメントを読む前に、必ず [`/CLAUDE.md`](../CLAUDE.md) を読んでください。
> `/CLAUDE.md` には、AI意思決定プロトコルと判断基準が記載されており、本文書より優先されます。

このディレクトリはBoxLogアプリケーションのソースコードを管理します。

## 🚨 コーディング基本ルール（必須遵守）

### 1. スタイリング（絶対厳守）

**カラーは globals.css のセマンティックトークンを使用（Tailwind v4公式準拠）**

```tsx
// ❌ 禁止：カスタム値、マジックナンバー
<div className="bg-[#ffffff] p-[13px]">

// ❌ 禁止：theme.ts の colors オブジェクト（廃止済み）
import { colors } from '@/config/theme'
<div className={colors.background.base}>

// ✅ 必須：globals.css のセマンティックトークン（Tailwindクラス直接使用）
<div className="bg-card text-card-foreground border-border">
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">

// ✅ 特殊用途：カラーパレット直接指定もOK
<div className="bg-neutral-800 text-neutral-50">
```

**セマンティックトークン一覧（globals.css で定義）：**

- `bg-background` / `text-foreground` - ページ全体の背景/テキスト
- `bg-card` / `text-card-foreground` - カード背景/テキスト
- `bg-muted` / `text-muted-foreground` - 控えめな背景/テキスト
- `bg-primary` / `text-primary-foreground` - プライマリーボタン等
- `border-border` / `border-input` - ボーダー
- `bg-destructive` / `text-destructive-foreground` - 削除ボタン等

**スペーシング・タイポグラフィ・角丸も globals.css のユーティリティクラスを使用：**

```tsx
// ✅ タイポグラフィ（globals.css で定義されたユーティリティクラス）
<h1 className="text-heading-h1">  // 48px, bold
<h2 className="text-heading-h2">  // 32px, bold
<p className="text-body-base">    // 16px, normal

// ✅ スペーシング（Tailwindクラス、8pxグリッド準拠）
<div className="p-4">   // 16px padding
<div className="gap-2"> // 8px gap

// ✅ 角丸（globals.css で定義）
<button className="rounded-md">  // 8px
<div className="rounded-xl">     // 16px
```

**重要：すべてのスタイリングは `/src/styles/globals.css` のセマンティックトークンを参照**

#### 1.1 スペーシング：8pxグリッドシステム（必須遵守）

**基本原則：すべてのスペーシング値は8の倍数を使用**

```tsx
// ✅ 推奨：8pxグリッド準拠
gap - 1 // 4px  - 例外: 密接な要素間（アイコン+テキスト等）
gap - 2 // 8px  - 標準: 小要素間
gap - 4 // 16px - 標準: 中要素間
gap - 6 // 24px - 標準: 大要素間
gap - 8 // 32px - 標準: セクション間

p - 2 // 8px  - 小パディング
p - 4 // 16px - 標準パディング
p - 6 // 24px - 大パディング

// ❌ 禁止：8の倍数でない値（例外を除く）
gap - 1.5 // 6px  - 使用禁止
gap - 2.5 // 10px - 使用禁止
px - 2.5 // 10px - 使用禁止

// ✅ 例外として許可される4px使用ケース
gap - 1 // 4px  - アイコンとテキストの間隔
p - 1 // 4px  - アイコンボタンの最小パディング
```

**角丸（Border Radius）も8pxグリッド準拠：**

```tsx
// globals.css で定義済み
--radius-sm: 4px   - 例外: 小要素用
--radius-md: 8px   - 標準
--radius-lg: 12px  - 例外: 視覚的バランス用
--radius-xl: 16px  - 大
--radius-2xl: 24px - 特大
```

**タイポグラフィは視認性優先（12px, 14pxは例外として許可）：**

```tsx
// globals.css で定義済み
--font-size-xs: 12px   - 例外: 最小サイズ
--font-size-sm: 14px   - 例外: 視認性確保
--font-size-base: 16px - 標準
--font-size-lg: 24px   - 大見出し
```

**実装時のチェックポイント：**

- コンポーネント作成時は既存の8pxグリッド準拠コンポーネントを参考にする
- 新しいスペーシング値が必要な場合、まず8の倍数で表現できないか検討
- 例外を使う場合は、必ずコメントで理由を明記

### 2. TypeScript厳格型付け

```tsx
// ❌ 禁止：any型
const handleClick = (data: any) => {}

// ✅ 必須：厳密な型定義
interface HandleClickData {
  id: string
  timestamp: number
}
const handleClick = (data: HandleClickData) => {}
```

### 3. コンポーネント設計

```tsx
// ✅ 推奨構造（名前付きエクスポート + 関数宣言）
import { typography } from '@/config/ui/theme'

interface Props {
  title: string
  onClose: () => void
}

// ✅ 推奨：関数宣言 + 名前付きエクスポート
export function MyComponent({ title, onClose }: Props) {
  return (
    <div className="bg-card">
      <h2 className={typography.heading.h2}>{title}</h2>
    </div>
  )
}

// ❌ 禁止：React.FC（非推奨）
// export const MyComponent: FC<Props> = ({ title, onClose }) => { ... }
```

### 4. 国際化（i18n）必須対応

**新規ページ作成時は必ずi18nを実装すること（ハードコード禁止）**

#### 4.1 Server Component（推奨）

```tsx
// src/app/[locale]/(app)/new-page/page.tsx
import { createTranslation, getDictionary } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

interface PageProps {
  params: Promise<{ locale?: Locale }>
}

const NewPage = async ({ params }: PageProps) => {
  const { locale = 'ja' } = await params
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  return (
    <div>
      <h1>{t('newPage.title')}</h1>
      <p>{t('newPage.description')}</p>
    </div>
  )
}

export default NewPage
```

#### 4.2 Client Component

```tsx
// src/features/new-feature/NewFeature.tsx
'use client'

import { useI18n } from '@/lib/i18n/hooks'

export const NewFeature = () => {
  const { t } = useI18n()

  return (
    <div>
      <h2>{t('newFeature.title')}</h2>
      <button>{t('newFeature.buttons.submit')}</button>
    </div>
  )
}
```

#### 4.3 翻訳辞書の追加

```json
// src/lib/i18n/dictionaries/ja.json
{
  "newPage": {
    "title": "新規ページ",
    "description": "説明文"
  }
}

// src/lib/i18n/dictionaries/en.json
{
  "newPage": {
    "title": "New Page",
    "description": "Description"
  }
}
```

#### 4.4 型安全性による翻訳漏れ防止

**TypeScript Branded Types で ハードコード文字列を型レベルで禁止**

```tsx
import type { TranslatedString } from '@/types/i18n-branded'

// ✅ OK: t()の戻り値（TranslatedString型）
const title = t('page.title') // 型: TranslatedString

// ❌ エラー: 生の文字列は型エラー
const title: TranslatedString = 'こんにちは'
// Type 'string' is not assignable to type 'TranslatedString'

// ✅ OK: コンポーネントでTranslatedStringを要求
interface Props {
  title: TranslatedString // ← ハードコード禁止
}
```

**メリット:**

- コード書いた瞬間にVS Codeで赤線表示
- `npm run typecheck`でコンパイルエラー
- 翻訳漏れを開発時に即座に検出

#### 4.5 実装チェックリスト

- [ ] すべてのUI文字列を翻訳キーに置き換え
- [ ] ja.json と en.json 両方に翻訳を追加
- [ ] Server Component: `getDictionary()` + `createTranslation()` を使用
- [ ] Client Component: `useI18n()` hookを使用
- [ ] ハードコードされた日本語・英語が残っていないか確認
- [ ] `TranslatedString`型を活用して型安全性を確保

### 5. バリデーション実装

```tsx
// ✅ Zodスキーマ使用
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  status: z.enum(['todo', 'in_progress', 'done']),
})

const result = taskSchema.safeParse(taskData)
if (!result.success) {
  console.error(result.error)
}
```

### 6. インポート順序（ESLint自動整形）

```tsx
// 1. React/Next.js
import { FC } from 'react'
import Link from 'next/link'

// 2. 外部ライブラリ
import { z } from 'zod'

// 3. 内部モジュール（@/）
import { colors } from '@/config/theme'
import { useTaskStore } from '@/stores/taskStore'

// 4. 相対パス
import { TaskCard } from './TaskCard'
```

### 7. 状態管理：Zustand vs Context API（使い分けベストプラクティス）

**原則**: 新規状態管理は**Zustand**を優先する。Context APIの使用は外部ライブラリまたは正当な理由がある場合のみ

**詳細判断ガイド**: [docs/architecture/STATE_MANAGEMENT_DECISION_GUIDE.md](../docs/architecture/STATE_MANAGEMENT_DECISION_GUIDE.md)

#### 7.1 ✅ Zustandを使用すべきケース（優先）

```tsx
// ❌ 悪い例：Context APIで頻繁に変更される状態
const AuthContext = createContext()
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // → user/session/loadingのどれか1つが変わっても全コンポーネントが再レンダリング！
}

// ✅ 良い例：Zustandで選択的サブスクリプション
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useAuthStore = create()(
  devtools(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      // アクション定義
    }),
    { name: 'auth-store' } // Redux DevToolsで可視化
  )
)

// コンポーネントで使用（userだけ監視）
function UserProfile() {
  const user = useAuthStore((state) => state.user) // userが変わった時だけ再レンダリング
  return <div>{user.name}</div>
}
```

**Zustandを使うべき状態**:

- ✅ **認証状態** (`useAuthStore`) - ユーザー、セッション、ロー����ング状態
- ✅ **UIインタラクション** (`useModalStore`, `useSidebarStore`) - モーダル、サイドバーの開閉
- ✅ **データフェッチ結果** (`useTaskStore`, `useEventStore`) - タスク、イベント一覧
- ✅ **フィルタ・検索** (`useSearchStore`) - 検索クエリ、フィルタ条件
- ✅ **一時的な状態** (`useFormStore`) - 複数ステップフォームの進行状態

**理由**: これらは**頻繁に変更**され、**多くのコンポーネント**で使用されるため

#### 7.2 ✅ Context APIを使用すべきケース

```tsx
// ✅ 良い例：Context APIで設定値（ほぼ変更されない）
import { createContext, useContext } from 'react'

const ThemeContext = createContext<'light' | 'dark'>('light')

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // themeは滅多に変更されないので、Context APIでOK
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
```

**Context APIを使うべき状態**:

- ✅ **外部ライブラリのContext** (`next-themes`, `react-hook-form`, `react-dnd`) - 変更不可
- ✅ **特定機能内の軽量状態** (`CalendarNavigationContext`) - 更新頻度が低く、特定機能内でのみ使用
- ✅ **シンプルなモーダル状態** (`GlobalSearchProvider`) - boolean状態のみ、永続化不要

**注意**: 新規でContext APIを作成する場合は、必ず正当な理由をコメントに明記すること

**理由**: これらは**めったに変更されない**、または**外部ライブラリ由来**のため、Context APIが適切

#### 7.3 判断フローチャート

```
状態管理の選択フローチャート：

1. この状態は5秒に1回以上変更される？
   YES → Zustand
   NO  → 次へ

2. この状態を10個以上のコンポーネントで使用する？
   YES → Zustand
   NO  → 次へ

3. この状態はアプリ起動時に一度だけ設定される？
   YES → Context API
   NO  → Zustand

4. Redux DevToolsでデバッグしたい？
   YES → Zustand
   NO  → どちらでもOK（Zustand推奨）
```

#### 7.4 実装例：このプロジェクトでの使い分け

**Zustand使用例**:

| ストア                     | 説明           | 理由                           |
| -------------------------- | -------------- | ------------------------------ |
| `useAuthStore`             | 認証状態       | 頻繁な更新、アプリ全体で使用   |
| `useSidebarStore`          | サイドバー開閉 | 多数のコンポーネントから参照   |
| `useCalendarSettingsStore` | カレンダー設定 | 永続化が必要                   |
| `useEventStore`            | イベント管理   | 複雑な状態、デバッグツール必要 |
| `useTaskStore`             | タスク管理     | 複雑な状態、デバッグツール必要 |

**Context API使用例（正当な理由あり）**:

| Context                          | 説明                     | 理由                             |
| -------------------------------- | ------------------------ | -------------------------------- |
| `ThemeProvider` (next-themes)    | テーマ管理               | 外部ライブラリ                   |
| `FormProvider` (react-hook-form) | フォーム状態             | 外部ライブラリ                   |
| `DndProvider` (react-dnd)        | DnD状態                  | 外部ライブラリ                   |
| `CalendarNavigationContext`      | カレンダーナビゲーション | 特定機能内、低頻度更新           |
| `GlobalSearchProvider`           | グローバル検索モーダル   | シンプルな状態、モーダル管理含む |
| `ToastProvider`                  | トースト通知             | UIライブラリパターン             |

**削除済み（Zustandに移行完了）**:

| 旧Context         | 移行先         | 移行日     |
| ----------------- | -------------- | ---------- |
| ~~`AuthContext`~~ | `useAuthStore` | 2025-10-24 |

#### 7.5 Zustand実装パターン（推奨テンプレート）

```tsx
// features/auth/stores/useAuthStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  // State
  user: User | null
  session: Session | null
  loading: boolean

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      initialize: async () => {
        // 初期化ロジック
        set({ loading: false })
      },

      signIn: async (email, password) => {
        // ログインロジック
        set({ user: {...}, session: {...} })
      },

      signOut: async () => {
        set({ user: null, session: null })
      },
    }),
    { name: 'auth-store' } // Redux DevToolsでの名前
  )
)

// セレクター（再利用可能）
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => !!state.user
```

**使用例**:

```tsx
// ❌ 禁止：全体を取得（不要な再レンダリングが発生）
const { user, session, loading } = useAuthStore()

// ✅ 推奨：auto-generated selectors
const user = useAuthStore.use.user()
const signOut = useAuthStore.use.signOut()

// ✅ OK：手動selector
const user = useAuthStore((state) => state.user)
const signOut = useAuthStore((state) => state.signOut)

// ✅ OK：カスタムセレクター
const isAuthenticated = useAuthStore(selectIsAuthenticated)
```

#### 7.6 Zustand Selector必須パターン（再レンダリング最適化）

**原則**: Zustand storeは必ず `createSelectors` でラップし、selector経由でアクセスする

```tsx
// ✅ Store定義時にcreateSelectorsを使用
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createSelectors } from '@/lib/zustand/createSelectors'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
}

const useSidebarStoreBase = create<SidebarState>()(
  devtools(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: 'sidebar-store' }
  )
)

// ✅ createSelectorsでラップしてexport
export const useSidebarStore = createSelectors(useSidebarStoreBase)
```

**コンポーネントでの使用**:

```tsx
// ✅ 推奨: .use.プロパティ名() で取得（最も簡潔）
const isOpen = useSidebarStore.use.isOpen()
const toggle = useSidebarStore.use.toggle()

// ✅ OK: 手動selectorでも可
const isOpen = useSidebarStore((state) => state.isOpen)

// ❌ 禁止: 全プロパティ取得（不要な再レンダリングが発生）
const { isOpen, toggle } = useSidebarStore()
```

**なぜ重要か（比喩）**:
- ❌ 全プロパティ取得 = 「教室の全員起立」→ 1人の名前を呼ぶだけで全員が反応
- ✅ selector使用 = 「担当制」→ 必要な人だけが反応、他の人は座ったまま

**新規Store作成時のチェックリスト**:
- [ ] `createSelectors` でラップしている
- [ ] JSDocに `.use.` パターンの使用例を記載
- [ ] コンポーネントでselector経由でアクセス

#### 7.7 参考リンク

- **詳細判断ガイド**: [docs/architecture/STATE_MANAGEMENT_DECISION_GUIDE.md](../docs/architecture/STATE_MANAGEMENT_DECISION_GUIDE.md)
- **Zustand公式**: https://zustand-demo.pmnd.rs/
- **Context API公式**: https://react.dev/reference/react/useContext
- **Zustand移行ガイド**: https://docs.pmnd.rs/zustand/guides/migrating-to-zustand

### 8. ファイル配置（コロケーション原則）

**基本方針**: 関連するファイルは必ず近くに配置し、機能単位で完結させる（Next.js公式推奨）

#### 7.1 コンポーネント構造

```
src/components/
  ├── Button/
  │   ├── Button.tsx           # ✅ メインコンポーネント
  │   ├── Button.test.tsx      # ✅ テスト（コンポーネントの隣）
  │   ├── Button.stories.tsx   # ✅ Storybookストーリー
  │   ├── types.ts             # ✅ コンポーネント固有の型
  │   ├── index.ts             # ✅ re-export（import簡略化用）
  │   └── README.md            # ✅ 使用例・API仕様

// ❌ 禁止：テストやドキュメントの分離
src/
  ├── components/Button/Button.tsx
  ├── __tests__/Button.test.tsx  // NG: 離れた場所
  └── docs/button.md             // NG: 離れた場所
```

#### 7.2 ページとローカルコンポーネント

```
src/app/
  ├── dashboard/
  │   ├── page.tsx              # ✅ ページコンポーネント
  │   ├── layout.tsx            # ✅ レイアウト
  │   ├── loading.tsx           # ✅ ローディング状態
  │   ├── error.tsx             # ✅ エラーハンドリング
  │   ├── _components/          # ✅ ページ専用コンポーネント（_ でルーティング除外）
  │   │   ├── DashboardChart.tsx
  │   │   ├── DashboardChart.test.tsx
  │   │   └── DashboardStats.tsx
  │   ├── hooks/                # ✅ ページ専用hooks
  │   │   └── useDashboardData.ts
  │   └── types.ts              # ✅ ページローカルな型

// ❌ 禁止：共通componentsへの混入
src/components/DashboardChart.tsx  // NG: 1ページでしか使わないのに共通化
```

#### 7.3 型定義とスキーマ

```
src/features/
  ├── tasks/
  │   ├── TaskList.tsx
  │   ├── types.ts              # ✅ feature固有の型定義
  │   ├── schemas.ts            # ✅ Zodバリデーションスキーマ
  │   └── constants.ts          # ✅ 定数（TASK_STATUSES等）

// ❌ 禁止：グローバル型ファイルへの混入
src/types/task.ts              // NG: 複数featureで使わない限り不要
```

#### 7.4 カスタムhooks

```
src/features/
  ├── calendar/
  │   ├── Calendar.tsx
  │   ├── hooks/
  │   │   ├── useCalendarState.ts      # ✅ featureローカルなhook
  │   │   └── useCalendarState.test.ts # ✅ hookのテスト
  │   └── types.ts

// または単一hookの場合
src/features/
  ├── search/
  │   ├── SearchBox.tsx
  │   ├── useSearchQuery.ts            # ✅ 単一hookは直下でもOK
  │   └── useSearchQuery.test.ts
```

#### 7.5 ユーティリティ関数

```
src/features/
  ├── tasks/
  │   ├── TaskBoard.tsx
  │   ├── utils.ts              # ✅ feature固有のヘルパー関数
  │   ├── utils.test.ts         # ✅ ユーティリティのテスト
  │   └── types.ts

// ❌ 禁止：グローバルutilsへの安易な追加
src/utils/taskHelpers.ts       // NG: 複数featureで使わない限り不要
```

#### 7.6 API routes（tRPC）

```
src/server/
  ├── routers/
  │   ├── task/
  │   │   ├── task.router.ts    # ✅ tRPCルーター
  │   │   ├── task.schema.ts    # ✅ 入力バリデーション（Zod）
  │   │   ├── task.service.ts   # ✅ ビジネスロジック
  │   │   ├── task.test.ts      # ✅ ルーターのテスト
  │   │   └── README.md         # ✅ API仕様書
```

#### 7.7 ドキュメント配置

```
// 機能単位のREADME
src/features/auth/README.md           # ✅ 認証機能の説明
docs/integrations/SENTRY.md           # ✅ Sentry統合ガイド
prisma/README.md                      # ✅ スキーマ設計ドキュメント

// ❌ 禁止：ドキュメントの一箇所集中
docs/
  ├── all-features.md           // NG: すべての機能を1ファイルに記載
  └── api-reference.md          // NG: すべてのAPIを1ファイルに記載
```

#### 7.8 コロケーション判断基準

| 項目               | ローカル配置                  | グローバル配置       |
| ------------------ | ----------------------------- | -------------------- |
| **コンポーネント** | 1つのfeature/ページでのみ使用 | 3箇所以上で再利用    |
| **型定義**         | 1つのfeatureでのみ使用        | 複数featureで共有    |
| **hooks**          | 1つのfeatureでのみ使用        | 複数featureで再利用  |
| **utils**          | feature固有のロジック         | 汎用的なヘルパー関数 |
| **定数**           | feature固有の値               | アプリ全体の設定値   |

**原則**: 迷ったらローカル配置 → 3箇所以上で使われたらグローバル化検討

---

## 📱 レスポンシブデザイン実装ガイド

### 🎯 基本方針

BoxLogはデスクトップ優先のアプリケーションですが、タブレット・モバイルでも快適に使用できる必要があります。

### 📐 ブレークポイント（必須使用）

```tsx
// src/config/theme/layout.ts から必ずインポート
import { breakpoints } from '@/config/theme/layout'

// 統一ブレークポイント
// sm: 640px   - スマートフォン横向き
// md: 768px   - タブレット縦向き
// lg: 1024px  - タブレット横向き・小型PC
// xl: 1280px  - デスクトップ
// 2xl: 1536px - 大型デスクトップ
```

### 🏗️ BoxLog 3カラムレイアウトの実装

```tsx
// src/config/theme/layout.ts のパターンを必ず使用
import { layoutPatterns, columns } from '@/config/theme/layout'

// ❌ 禁止：独自実装
<div className="w-64 bg-gray-100">

// ✅ 正しい実装：テーマのレイアウトシステム使用
<div className={columns.sidebar.default}>
```

### 📋 実装アプローチ（機能に応じて選択）

#### A. デスクトップ重視の画面（管理画面、ダッシュボード等）

```tsx
// デスクトップを基準に設計し、小画面で段階的に調整
<div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* デスクトップ：4カラム → タブレット：2カラム → モバイル：1カラム */}
</div>
```

#### B. コンテンツ中心の画面（記事、プロフィール等）

```tsx
// モバイルでも読みやすさを重視
<article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-xl sm:text-2xl lg:text-3xl">
  <p className="text-sm sm:text-base leading-relaxed">
</article>
```

#### C. インタラクティブな画面（カレンダー、ボード等）

```tsx
// デバイスに応じて異なるUIを提供
{
  /* デスクトップ：フル機能 */
}
;<div className="hidden lg:block">
  <FullCalendarView />
</div>

{
  /* タブレット：簡易版 */
}
;<div className="hidden md:block lg:hidden">
  <CompactCalendarView />
</div>

{
  /* モバイル：リスト形式 */
}
;<div className="block md:hidden">
  <MobileListView />
</div>
```

### 🔍 実装前チェックリスト

```typescript
// 各画面/コンポーネント実装時に確認
const responsiveChecklist = {
  layout: {
    desktop: '1280px以上で最適表示か？',
    tablet: '768px〜1024pxで使いやすいか？',
    mobile: '375px〜640pxで必要機能にアクセス可能か？',
  },
  interaction: {
    touch: 'タッチターゲットは44px以上か？',
    hover: 'ホバー依存の機能はないか？',
    scroll: '横スクロールは意図的か？',
  },
  performance: {
    images: '適切なサイズ/フォーマットか？',
    lazyLoad: '遅延読み込みは設定済みか？',
    critical: '重要なコンテンツは優先表示か？',
  },
}
```

---

## 📚 頻出パターン集（コピペ可能）

AI が毎回公式ドキュメントを参照すると非効率なため、頻出パターンをここに集約します。

### Server Component のデータフェッチング

```typescript
// ✅ 推奨: async Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // ISR: 60秒キャッシュ
  })
  const json = await data.json()

  return <div>{json.title}</div>
}

// ✅ 推奨: Supabase でのデータフェッチ
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tasks').select('*')

  if (error) throw error
  return <TaskList tasks={data} />
}
```

### Client Component のインタラクション

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-base">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  )
}
```

### i18n 実装パターン

```typescript
// Server Component
import { getI18n } from '@/features/i18n/lib/server'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getI18n(locale)

  return <h1>{t('page.title')}</h1>
}

// Client Component
'use client'

import { useI18n } from '@/features/i18n/lib/hooks'

export function ClientComponent() {
  const { t } = useI18n()
  return <p>{t('common.save')}</p>
}
```

### フォーム実装（React Hook Form + Zod）

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input {...register('email')} type="email" className="border-input" />
      {errors.email && <span className="text-destructive">{errors.email.message}</span>}

      <input {...register('password')} type="password" className="border-input" />
      {errors.password && <span className="text-destructive">{errors.password.message}</span>}

      <Button type="submit">Login</Button>
    </form>
  )
}
```

### レスポンシブデザインパターン

```tsx
// ✅ モバイルファースト
export function ResponsiveCard() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-6 lg:grid-cols-3 lg:gap-8 lg:p-8">
      <Card />
      <Card />
      <Card />
    </div>
  )
}

// ✅ 条件付きレンダリング（useMediaQuery）
;('use client')

import { useMediaQuery } from '@/hooks/use-media-query'

export function AdaptiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile ? <MobileView /> : <DesktopView />
}
```

---

**📖 参照元**: [CLAUDE.md](../CLAUDE.md)
**最終更新**: 2025-11-24 | **v2.3 - FC→関数宣言に統一、セマンティックトークン明確化**
