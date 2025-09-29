# config/theme/ - テーマシステム（絶対厳守）

BoxLogデザインシステム・テーマ強制ルール。

## 🚨 絶対遵守事項

**すべてのスタイリングは `/src/config/theme` を使用してください。**

### 禁止事項（例外なし）
- ❌ Tailwindクラスの直接指定
- ❌ 色の直接指定（#FFFFFF、rgb()等）
- ❌ `dark:` プレフィックスの使用
- ❌ カスタム値（p-[13px]、w-[350px]等）

---

## 📚 テーマモジュール構成

```
config/theme/
├── index.ts           # 統一エクスポート
├── colors.ts          # カラーシステム
├── typography.ts      # タイポグラフィ
├── spacing.ts         # スペーシング（8pxグリッド）
├── borders.ts         # ボーダー
├── rounded.ts         # 角丸
├── shadows.ts         # シャドウ
├── animations.ts      # アニメーション
└── layout.ts          # レイアウトパターン
```

---

## 🎨 カラーシステム

### 基本的な使用
```tsx
import { colors } from '@/config/theme'

// 背景色
<div className={colors.background.base}>       // メイン背景
<div className={colors.background.card}>       // カード背景
<div className={colors.background.elevated}>   // 浮き上がる背景

// テキスト色
<h1 className={colors.text.primary}>          // プライマリテキスト
<p className={colors.text.secondary}>         // セカンダリテキスト
<span className={colors.text.muted}>          // 補助テキスト

// アクション色
<button className={colors.primary.DEFAULT}>   // プライマリボタン
<button className={colors.secondary.DEFAULT}> // セカンダリボタン
<button className={colors.danger.DEFAULT}>    // 危険アクション
```

### ステート管理
```tsx
// ホバー・フォーカス
<button className={`${colors.primary.DEFAULT} ${colors.primary.hover}`}>
<input className={`${colors.input.base} ${colors.input.focus}`}>

// 無効状態
<button className={colors.button.disabled} disabled>
```

---

## 📝 タイポグラフィ

```tsx
import { typography } from '@/config/theme'

// 見出し
<h1 className={typography.heading.h1}>
<h2 className={typography.heading.h2}>
<h3 className={typography.heading.h3}>

// 本文
<p className={typography.body.base}>
<p className={typography.body.sm}>
<p className={typography.body.lg}>

// コード
<code className={typography.code}>
```

---

## 📏 スペーシング（8pxグリッド）

### 基本ルール
BoxLogは**8pxグリッドシステム**を採用。

```tsx
import { spacing } from '@/config/theme'

// コンポーネント内余白
<div className={spacing.component.sm}>   // 8px
<div className={spacing.component.md}>   // 16px
<div className={spacing.component.lg}>   // 24px
<div className={spacing.component.xl}>   // 32px

// ボタン内余白
<button className={spacing.button.sm}>
<button className={spacing.button.md}>
<button className={spacing.button.lg}>

// セクション間余白
<section className={spacing.section.md}>
<section className={spacing.section.lg}>
```

### 8pxグリッド例
```tsx
// ✅ 正しい（8の倍数）
spacing.component.sm   // 8px
spacing.component.md   // 16px
spacing.component.lg   // 24px

// ❌ 禁止（8の倍数以外）
p-[13px]  // 13pxは非推奨
w-[350px] // 350pxは非推奨
```

---

## 🔲 ボーダー・角丸・シャドウ

```tsx
import { borders, rounded, shadows } from '@/config/theme'

// ボーダー
<div className={borders.base}>
<div className={borders.strong}>

// 角丸
<div className={rounded.component.card.md}>
<button className={rounded.component.button.md}>

// シャドウ
<div className={shadows.sm}>  // 軽いシャドウ
<div className={shadows.md}>  // 標準シャドウ
<div className={shadows.lg}>  // 強いシャドウ
```

---

## 🎭 ダークモード対応

### 自動対応
テーマシステムを使用することで、ダークモードが**自動で適用**されます。

```tsx
// ✅ 自動ダークモード対応
import { colors } from '@/config/theme'
<div className={colors.background.base}>
// → ライトモード: bg-white
// → ダークモード: bg-gray-900（自動切り替え）

// ❌ 手動ダークモード（禁止）
<div className="bg-white dark:bg-gray-900">
```

---

## 🏗️ レイアウトパターン

```tsx
import { layoutPatterns, columns } from '@/config/theme/layout'

// 3カラムレイアウト
<div className={layoutPatterns.threeColumn}>
  <aside className={columns.sidebar.default}>サイドバー</aside>
  <main className={columns.main.default}>メインコンテンツ</main>
  <aside className={columns.sidebar.default}>右サイドバー</aside>
</div>

// カードグリッド
<div className={layoutPatterns.cardGrid}>
  <div>カード1</div>
  <div>カード2</div>
  <div>カード3</div>
</div>
```

---

## 📋 実装例：完全なコンポーネント

```tsx
import { FC } from 'react'
import { colors, typography, spacing, rounded, shadows } from '@/config/theme'

interface TaskCardProps {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

export const TaskCard: FC<TaskCardProps> = ({ title, description, priority }) => {
  const priorityColor =
    priority === 'high' ? colors.danger.DEFAULT :
    priority === 'medium' ? colors.warning.DEFAULT :
    colors.success.DEFAULT

  return (
    <div className={`
      ${colors.background.card}
      ${spacing.component.md}
      ${rounded.component.card.md}
      ${shadows.md}
    `}>
      <div className="flex items-center gap-2">
        <span className={`${priorityColor} w-3 h-3 rounded-full`} />
        <h3 className={typography.heading.h3}>{title}</h3>
      </div>
      <p className={`${typography.body.base} ${colors.text.secondary}`}>
        {description}
      </p>
    </div>
  )
}
```

---

## 🔧 テーマカスタマイズ

### 新しいカラー追加
```typescript
// config/theme/colors.ts
export const colors = {
  // 既存のカラー...

  // カスタムカラー追加
  brand: {
    DEFAULT: 'bg-brand-500 text-white',
    hover: 'hover:bg-brand-600',
    light: 'bg-brand-100 text-brand-900',
  },
}
```

---

## 🔗 関連ドキュメント

- **デザインシステム詳細**: [`../../../docs/THEME_ENFORCEMENT.md`](../../../docs/THEME_ENFORCEMENT.md)
- **デザインシステム全体**: [`../../../docs/DESIGN_SYSTEM_README.md`](../../../docs/DESIGN_SYSTEM_README.md)
- **コンポーネント実装**: [`../../components/CLAUDE.md`](../../components/CLAUDE.md)
- **レスポンシブデザイン**: [`../../CLAUDE.md`](../../CLAUDE.md)

---

**📖 最終更新**: 2025-09-30