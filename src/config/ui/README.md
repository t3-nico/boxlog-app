# ui/ - テーマ・デザインシステム

BoxLogアプリケーションのUI設定を管理します。**最も重要な設定ディレクトリ**です。

## 🚨 絶対遵守ルール

### ❌ 禁止事項

```tsx
// ❌ 禁止：直接の色指定
<div style={{ color: '#3B82F6' }}>

// ❌ 禁止：Tailwindクラスの直接指定
<div className="bg-white dark:bg-gray-900">
<div className="p-[13px]">
<h1 className="text-2xl font-bold">

// ❌ 禁止：インラインスタイル
<div style={{ backgroundColor: 'white', padding: '16px' }}>
```

### ✅ 必須事項

```tsx
// ✅ 必須：theme.tsの定数を使用
import { BRAND_COLORS, colors, typography, spacing, rounded } from '@/config'

<div style={{ color: BRAND_COLORS.primary }}>
<div className={colors.background.base}>
<h1 className={typography.heading.h1}>
<div className={spacing.component.md}>
```

**理由**: デザインの一貫性を保ち、テーマ変更を一箇所で管理するため

## 📁 ファイル構成

```
src/config/ui/
├── theme.ts          # テーマカラー・タイポグラフィ・間隔（メインファイル）
├── views.ts          # ビュー別設定
├── sidebarConfig.ts  # サイドバー設定
└── tagIcons.ts       # タグアイコン設定
```

## 🎨 theme.ts の使い方

### 1. カラーシステム

#### RGB値（style属性用）

```typescript
import {
  BRAND_COLORS,           // ブランドカラー
  SEMANTIC_COLORS,        // success/warning/error/info
  TAG_PRESET_COLORS,      // タグ用10色
  TASK_STATUS_COLORS,     // タスクステータス色
  TASK_PRIORITY_COLORS,   // 優先度色
  CHRONOTYPE_COLORS       // クロノタイプ色
} from '@/config'

// 使用例
<div style={{ color: BRAND_COLORS.primary }}>        // rgb(59 130 246)
<Badge style={{ color: SEMANTIC_COLORS.success }}>   // rgb(34 197 94)
<Tag style={{ backgroundColor: TAG_PRESET_COLORS[0] }}>
```

#### Tailwindクラス（className用）

```typescript
import { colors } from '@/config'

// テキストカラー
<p className={colors.text.primary}>        // text-gray-900 dark:text-gray-100
<span className={colors.text.secondary}>   // text-gray-600 dark:text-gray-400
<small className={colors.text.muted}>      // text-gray-500 dark:text-gray-400

// 背景色
<div className={colors.background.base}>   // bg-white dark:bg-gray-950
<div className={colors.background.card}>   // bg-white dark:bg-gray-900
<div className={colors.background.hover}>  // hover:bg-gray-100 dark:hover:bg-gray-800

// ボーダー
<div className={colors.border.base}>       // border-gray-200 dark:border-gray-700
```

### 2. タイポグラフィ

```typescript
import { typography } from '@/config'

// 見出し
<h1 className={typography.heading.h1}>     // text-4xl font-bold
<h2 className={typography.heading.h2}>     // text-3xl font-bold
<h3 className={typography.heading.h3}>     // text-2xl font-semibold

// 本文
<p className={typography.body.base}>       // text-base
<p className={typography.body.lg}>         // text-lg
<small className={typography.body.small}>  // text-sm

// ボタン
<button className={typography.button.DEFAULT}> // text-sm font-medium
<button className={typography.button.lg}>      // text-base font-medium

// ページ・セクション
<h1 className={typography.page.title}>         // text-3xl font-bold tracking-tight
<p className={typography.page.description}>    // text-base text-gray-600

<h2 className={typography.section.title}>      // text-2xl font-semibold
<h3 className={typography.section.subtitle}>   // text-lg font-medium
```

### 3. 間隔（Spacing）

```typescript
import { spacing } from '@/config'

// 基本スペーシング（数値）
spacing.xs   // 0.5rem (8px)
spacing.sm   // 1rem (16px)
spacing.md   // 1.5rem (24px)
spacing.lg   // 2rem (32px)
spacing.xl   // 3rem (48px)

// 用途別
spacing.page.padding              // 1rem
spacing.section.margin            // 1.5rem
spacing.component.padding.DEFAULT // 1rem
```

### 4. 角丸（Rounded）

```typescript
import { rounded } from '@/config'

// 基本
rounded.sm       // 0.25rem (4px)
rounded.md       // 0.375rem (6px)
rounded.lg       // 0.5rem (8px)
rounded.full     // 9999px

// コンポーネント別
<button className={rounded.component.button.md}>  // rounded-md
<div className={rounded.component.card.DEFAULT}>  // rounded-lg
<span className={rounded.component.badge.DEFAULT}> // rounded-full
<input className={rounded.component.input}>        // rounded-md
```

## 💡 実践例

### 基本的なカード

```tsx
import { colors, typography, rounded, spacing } from '@/config'

export function TaskCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={`${colors.background.card} ${colors.border.base} ${rounded.component.card.DEFAULT}`}
      style={{ padding: spacing.component.padding.DEFAULT }}
    >
      <h3 className={typography.heading.h3}>{title}</h3>
      <p className={colors.text.secondary}>{description}</p>
    </div>
  )
}
```

### ステータスバッジ

```tsx
import { TASK_STATUS_COLORS, typography, rounded } from '@/config'

type Status = 'todo' | 'inProgress' | 'completed'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`${typography.body.small} ${rounded.component.badge.DEFAULT}`}
      style={{
        backgroundColor: TASK_STATUS_COLORS[status],
        color: 'white',
        padding: '4px 12px',
      }}
    >
      {status}
    </span>
  )
}
```

### インタラクティブボタン

```tsx
import { BRAND_COLORS, colors, typography, rounded } from '@/config'

export function PrimaryButton({ children, onClick }: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`${colors.background.hover} ${typography.button.DEFAULT} ${rounded.component.button.md}`}
      style={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

## 🆕 新しい色を追加する場合

既存の色で対応できない場合のみ、`theme.ts` に追加してください：

```typescript
// theme.ts
export const NEW_FEATURE_COLORS = {
  special: 'rgb(255 100 50)',
} as const
```

その後、使用箇所で：

```tsx
import { NEW_FEATURE_COLORS } from '@/config'

<div style={{ color: NEW_FEATURE_COLORS.special }}>
```

## 🔗 関連ドキュメント

- [CLAUDE.md](../../CLAUDE.md) - スタイリング絶対厳守ルール
- [THEME_ENFORCEMENT.md](../../../docs/THEME_ENFORCEMENT.md) - デザインシステム詳細
- [globals.css](../../app/globals.css) - CSS変数定義

## ❓ よくある質問

### Q1: なぜ直接指定が禁止なのか？

**A**: デザインの一貫性を保ち、ダークモード対応やブランドカラー変更を一箇所で管理するためです。

### Q2: Tailwindクラスを直接書いてはいけないのか？

**A**: `theme.ts` に定義されていないクラスは使用可能ですが、色・間隔・タイポグラフィは必ず `theme.ts` を使用してください。

```tsx
// ✅ OK：レイアウト用のクラス
<div className="flex items-center justify-between">

// ❌ NG：色やスペーシング
<div className="bg-blue-500 p-4">
```

### Q3: `style` 属性と `className` のどちらを使うべきか？

**A**:
- **RGB値（`BRAND_COLORS` 等）**: `style` 属性
- **Tailwindクラス（`colors.text.primary` 等）**: `className` 属性

---

**最終更新**: 2025-10-06
