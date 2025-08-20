# BoxLog スタイルシステム

BoxLogアプリケーションのスタイルシステムドキュメントです。Compass Neutralカラーシステムを基盤とした統一されたデザインシステムを提供します。

## 📁 ディレクトリ構成

```
src/styles/
├── themes/                    # テーマシステム（TypeScript）
│   ├── animations/            # アニメーションシステム
│   │   ├── accessibility.ts  # アクセシビリティアニメーション設定
│   │   ├── index.ts          # アニメーション統合エクスポート
│   │   ├── micro-interactions.ts     # マイクロインタラクション定義
│   │   ├── page-transitions.ts       # ページ遷移アニメーション
│   │   ├── performance-optimizations.ts  # パフォーマンス最適化
│   │   ├── skeleton-loading.ts       # スケルトンローディング
│   │   └── utilities.ts      # アニメーションユーティリティ
│   ├── components/            # コンポーネントスタイル定義
│   │   ├── button.styles.ts  # ボタンコンポーネントスタイル
│   │   ├── calendar.styles.ts # カレンダーコンポーネントスタイル
│   │   ├── card.styles.ts    # カードコンポーネントスタイル
│   │   ├── form.styles.ts    # フォームコンポーネントスタイル
│   │   └── index.ts          # コンポーネントスタイル統合
│   ├── colors.ts              # 基本カラーパレット（Compass Neutral）
│   ├── semantic-colors.ts     # セマンティックカラー + shadcn/ui互換
│   ├── spacing.ts             # スペーシング（8pxグリッド）
│   ├── typography.ts          # タイポグラフィ（Inter）
│   ├── shadows.ts             # シャドウ（ライト・ダークモード）
│   ├── animations.ts          # メインアニメーション設定
│   ├── breakpoints.ts         # レスポンシブ・デバイス設定
│   ├── component-tokens.ts    # コンポーネント専用トークン
│   ├── constants.ts           # システム定数定義
│   ├── css-variables.ts       # CSS変数生成ユーティリティ
│   ├── design-tokens.ts       # デザイントークン統合定義
│   ├── types.ts               # TypeScript型定義
│   └── index.ts               # 統合エクスポート
├── generate-css.ts            # CSS自動生成スクリプト
├── generated-variables.css    # 自動生成されたCSS変数（参照用）
├── globals.css                # Tailwind CSS + CSS変数統合
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

## 🛠️ CSS生成システム

### 自動生成の仕組み

`generate-css.ts` スクリプトが TypeScript の定義から CSS 変数を自動生成します：

```bash
# CSS変数の生成
npm run generate:css

# ビルド時に自動実行
npm run build
```

### 生成される内容

1. **Tailwind v4 @theme 変数**
   - カラー、スペーシング、タイポグラフィ、シャドウ
   - Compass Neutral ベースの統一パレット

2. **アニメーションキーフレーム**
   - マイクロインタラクション（ripple, shake, heartbeat）
   - ページ遷移（fade, slide, scale）
   - スケルトンローディング（wave, fade）

3. **レスポンシブ変数**
   - モバイル、タブレット、デスクトップごとの調整
   - カレンダー専用のレスポンシブ設定

4. **アクセシビリティ対応**
   - `prefers-reduced-motion` サポート
   - `prefers-contrast` 高コントラストモード

### 生成ファイル

- **`globals.css`**: メインのスタイルシート（自動更新）
- **`generated-variables.css`**: 生成された変数のみ（参照用）

## ⚡ アニメーションシステム

### アニメーションカテゴリ

#### 1. マイクロインタラクション (`micro-interactions.ts`)
- `micro-ripple`: リップル効果
- `micro-shake`: 振動効果
- `micro-heartbeat`: ハートビート
- `micro-fade-in-up`: フェードイン上方向
- `micro-rotate-in`: 回転インタラクション

#### 2. ページ遷移 (`page-transitions.ts`)
- `page-fade-in/out`: フェード遷移
- `page-slide-in-right/out-left`: スライド遷移
- `page-scale-in`: スケール遷移
- `modal-scale-in`: モーダル表示
- `dropdown-in`: ドロップダウン表示

#### 3. スケルトンローディング (`skeleton-loading.ts`)
- `skeleton-wave`: ウェーブ効果
- `skeleton-fade`: フェード効果
- `skeleton-wave-fast`: 高速ウェーブ

#### 4. エラー・状態表示
- `shake-x`: 水平振動
- `fade-in-error`: エラーフェードイン
- `pulse-error`: エラーパルス
- `progress-indeterminate`: 不確定プログレス

### 使用例

```tsx
// Tailwind クラスで使用
<div className="animate-micro-ripple">
  クリック時のリップル効果
</div>

// アクセシビリティ対応
<div className="motion-safe:animate-page-fade-in">
  アニメーション設定を尊重
</div>
```

## 🎯 コンポーネントスタイル

### コンポーネント専用トークン (`component-tokens.ts`)

各コンポーネントに特化したデザイントークン：

- **ボタン** (`button.styles.ts`): サイズ、パディング、バリアント
- **カード** (`card.styles.ts`): 影、境界線、パディング
- **フォーム** (`form.styles.ts`): 入力フィールド、ラベル
- **カレンダー** (`calendar.styles.ts`): グリッド、時間軸、イベント

### デザイントークン統合 (`design-tokens.ts`)

全てのトークンを統合管理：

```typescript
// 階層構造
primitives → semantic → component → compositions
```

## 📚 参考資料

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Design System](https://ui.shadcn.com/)
- [Compass Design System](https://compass.example.com/)
- [Inter Font Family](https://rsms.me/inter/)

---

**最終更新**: 2025-08-20  
**バージョン**: v2.0 - アニメーション統合・自動生成システム対応版