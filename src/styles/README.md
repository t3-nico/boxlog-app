# BoxLog スタイルシステム

BoxLogアプリケーションのスタイルシステムドキュメントです。Compass Neutralカラーシステムを基盤とした統一されたデザインシステムを提供します。

## 📁 ディレクトリ構成

```
src/styles/
├── themes/                    # テーマシステム（TypeScript）
│   ├── colors.ts              # 基本カラーパレット（Compass Neutral）
│   ├── semantic-colors.ts     # セマンティックカラー + shadcn/ui互換
│   ├── spacing.ts             # スペーシング（8pxグリッド）
│   ├── typography.ts          # タイポグラフィ（Inter）
│   ├── shadows.ts             # シャドウ（ライト・ダークモード）
│   ├── animations.ts          # アニメーション・トランジション
│   ├── breakpoints.ts         # レスポンシブ・デバイス設定
│   ├── types.ts               # TypeScript型定義
│   └── index.ts               # 統合エクスポート
├── globals.css                # Tailwind CSS + CSS変数統合
├── tailwind-preset.ts         # Tailwind CSS プリセット（未使用）
└── README.md                  # このファイル
```

## 🎨 カラーシステム

### Compass Neutral カラーパレット

BoxLogでは統一されたCompass Neutralカラーシステムを採用しています：

```typescript
// 基本パレット
neutral-0:    #ffffff  (白)
neutral-50:   #fafafa  (薄いグレー)
neutral-100:  #f5f5f5  (ライトグレー)
neutral-200:  #e5e5e5  (ボーダー)
neutral-400:  #a3a3a3  (ミュート)
neutral-500:  #737373  (セカンダリテキスト)
neutral-600:  #525252  (テキスト)
neutral-700:  #404040  (ダークボーダー)
neutral-800:  #262626  (ダークセカンダリ)
neutral-900:  #171717  (プライマリテキスト)
neutral-950:  #0a0a0a  (ダーク背景)
```

### テーママッピング

| 用途 | ライトモード | ダークモード |
|------|-------------|-------------|
| 背景 | `neutral-0` (white) | `neutral-950` |
| カード | `neutral-0` | `neutral-900` |
| セカンダリ背景 | `neutral-50` | `neutral-800` |
| プライマリテキスト | `neutral-900` | `neutral-50` |
| セカンダリテキスト | `neutral-500` | `neutral-400` |
| ボーダー | `neutral-200` | `neutral-700` |

## 🔧 技術構成

### Tailwind CSS v4 対応

```css
/* globals.css */
@import 'tailwindcss';

@theme {
  /* Compass Neutral カラー定義 */
  --color-background: #ffffff;
  --color-foreground: #171717;
  /* ... */
}
```

### shadcn/ui 互換性

shadcn/uiコンポーネントとの完全互換性を提供：

- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `destructive` / `destructive-foreground`

## 📱 レスポンシブ対応

### ブレークポイント

```typescript
breakpoints = {
  xs: '475px',    // 小型スマートフォン
  sm: '640px',    // スマートフォン
  md: '768px',    // タブレット
  lg: '1024px',   // デスクトップ
  xl: '1280px',   // 大型デスクトップ
  '2xl': '1536px' // 超大型デスクトップ
}
```

### カレンダー専用レスポンシブ

```typescript
// カレンダー固有の設定
calendar: {
  mobile: { hourHeight: '3rem', timeColumnWidth: '3rem' },
  tablet: { hourHeight: '3.75rem', timeColumnWidth: '4rem' },
  desktop: { hourHeight: '4.5rem', timeColumnWidth: '4rem' }
}
```

## ✨ 主要機能

### 1. 統一カラーシステム

- **Compass Neutral**: 一貫性のあるグレースケール
- **ライト・ダークモード**: 自動切り替え対応
- **アクセシビリティ**: WCAG準拠のコントラスト比

### 2. 8pxグリッドシステム

```typescript
spacing = {
  1: '0.125rem',  // 2px
  2: '0.25rem',   // 4px
  3: '0.375rem',  // 6px
  4: '0.5rem',    // 8px
  6: '0.75rem',   // 12px
  8: '1rem',      // 16px
  // ...
}
```

### 3. Typography（Inter フォント）

```typescript
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas']
}
```

### 4. カレンダー専用スタイル

- **CurrentTimeLine**: 現在時刻の赤いライン
- **TimeColumn**: 時間軸の背景とラベル
- **EventBlock**: イベントのスタイリング
- **Grid Lines**: グリッド線の色と透明度

## 🚀 使用方法

### 基本的な使い方

```tsx
import { theme } from '@/styles/themes'

// テーマカラーを使用
const primaryColor = theme.config.colors.light.primary

// ユーティリティ関数を使用
const spacing = theme.utils.getSpacing(4) // '0.5rem'
```

### CSS変数の使用

```css
/* Tailwind クラスで使用 */
.my-component {
  @apply bg-background text-foreground;
  @apply border border-border;
}

/* CSS変数で直接使用 */
.custom-style {
  background-color: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
}
```

### カレンダーコンポーネントでの使用

```tsx
// 定数を使用
import { GRID_BACKGROUND, GRID_BORDER } from '@/features/calendar/.../grid.constants'

<div className={`${GRID_BACKGROUND} ${GRID_BORDER}`}>
  {/* カレンダーコンテンツ */}
</div>
```

## 🔄 ダークモード

### 自動切り替え

```css
/* システム設定に従う */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-background: #0a0a0a;
    /* ... */
  }
}

/* 手動設定 */
[data-theme="dark"] {
  --color-background: #0a0a0a;
  /* ... */
}
```

### React での制御

```tsx
// テーマプロバイダーで管理
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

## 📝 開発ガイドライン

### カラーの選択

1. **基本**: Compass Neutralパレットを使用
2. **セマンティック**: `success`, `warning`, `error`, `info`
3. **ブランド**: プライマリブルー（`#3b82f6`）

### 新しいコンポーネントの作成

```tsx
// ❌ ハードコーディング
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// ✅ テーマシステム使用
<div className="bg-background text-foreground">
```

### CSS変数の追加

1. `themes/` 内の適切なファイルに定義を追加
2. `globals.css` の `@theme` ディレクティブに追加
3. 型定義 (`types.ts`) を更新

## 🔗 関連ファイル

- **メイン設定**: `tailwind.config.ts`
- **アプリエントリーポイント**: `src/app/layout.tsx`
- **カレンダー定数**: `src/features/calendar/.../grid.constants.ts`
- **コンポーネント**: `src/components/`

## 📚 参考資料

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Design System](https://ui.shadcn.com/)
- [Compass Design System](https://compass.example.com/)
- [Inter Font Family](https://rsms.me/inter/)

---

**最終更新**: 2025-08-19  
**バージョン**: v1.0 - Compass Neutral統合版