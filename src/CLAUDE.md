# src/ - コーディング基本ルール

このディレクトリはBoxLogアプリケーションのソースコードを管理します。

## 🚨 コーディング基本ルール（必須遵守）

### 1. スタイリング（絶対厳守）
```tsx
// ❌ 禁止：直接指定
<div className="bg-white dark:bg-gray-900">
<div className="p-[13px]">

// ✅ 必須：themeシステム使用
import { colors, spacing } from '@/config/theme'
<div className={colors.background.base}>
<div className={spacing.component.md}>
```

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
// ✅ 推奨構造
import { FC } from 'react'
import { colors, typography } from '@/config/theme'

interface Props {
  title: string
  onClose: () => void
}

export const MyComponent: FC<Props> = ({ title, onClose }) => {
  return (
    <div className={colors.background.base}>
      <h2 className={typography.heading.h2}>{title}</h2>
    </div>
  )
}
```

### 4. バリデーション実装
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

### 5. インポート順序（ESLint自動整形）
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

**📖 参照元**: [CLAUDE.md](../CLAUDE.md)
**最終更新**: 2025-09-30