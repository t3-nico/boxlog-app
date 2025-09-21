# ESLint Theme Enforcement System

BoxLogにおけるデザインシステムの一貫性を保つため、ESLintレベルでtheme systemの使用を強制するシステムです。

## 🎯 目的

1. **デザイン一貫性の確保**: すべてのUIコンポーネントで統一されたデザインシステムを使用
2. **メンテナンス性向上**: テーマ変更が一箇所での修正で全体に反映
3. **ダークモード自動対応**: theme systemによる自動的なダークモード切り替え
4. **開発体験向上**: 明確なルールと自動チェックによる迷いのない開発

## 🏗️ システム構成

### 基本設定ファイル

```
.eslint/
├── configs/
│   ├── theme-simple.js     # 基本的なtheme enforcement
│   └── theme-strict.js     # 新規コンポーネント用厳格ルール
├── rules/
│   └── theme/
│       └── enforce-theme-usage.js  # カスタムルール（将来拡張用）
└── index.js                # メイン設定（統合済み）
```

### 設定レベル

1. **theme-simple.js**: 既存コード用の段階的移行
   - 警告レベル（`warn`）で通知
   - 大部分のファイルを除外設定
2. **theme-strict.js**: 新規コンポーネント用厳格チェック
   - エラーレベル（`error`）で強制
   - 直接的なTailwindクラス完全禁止

## ✅ 正しい実装例

### 基本的なコンポーネント

```tsx
import React from 'react'
import { colors, typography, spacing, rounded } from '@/config/theme'

export const MyComponent = () => {
  return (
    <div className={` ${colors.background.surface} ${spacing.component.lg} ${rounded.component.card.md} `}>
      <h2 className={`${typography.heading.h2} ${colors.text.primary}`}>タイトル</h2>
      <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>本文テキスト</p>
      <button
        className={` ${colors.primary.DEFAULT} hover:${colors.primary.hover} ${spacing.button.md} ${rounded.component.button.md} `}
      >
        アクションボタン
      </button>
    </div>
  )
}
```

### インタラクティブ要素

```tsx
// ホバー・フォーカス状態もtheme system使用
<button
  className={` ${colors.semantic.success.DEFAULT} hover:${colors.semantic.success.hover} focus:${colors.semantic.success.focus} ${spacing.button.lg} `}
>
  成功アクション
</button>
```

## ❌ 禁止される実装例

### 直接的なTailwindクラス使用

```tsx
// ❌ 禁止 - 直接的な色指定
<div className="bg-blue-500 text-white">

// ❌ 禁止 - 直接的なサイズ指定
<p className="text-2xl font-bold">

// ❌ 禁止 - 直接的な余白指定
<button className="px-4 py-2 m-4">

// ❌ 禁止 - ダークモードの個別指定
<div className="bg-white dark:bg-gray-900">
```

## 🔧 開発ワークフロー

### 新規コンポーネント作成時

1. **theme importから開始**

   ```tsx
   import { colors, typography, spacing } from '@/config/theme'
   ```

2. **theme値を使用してスタイリング**

   ```tsx
   className={colors.primary.DEFAULT}
   ```

3. **ESLintチェック実行**
   ```bash
   npm run lint
   ```

### 既存コンポーネント修正時

1. **段階的移行**
   - 警告レベルで通知されるため、徐々に修正
   - 優先度の高いコンポーネントから実施

2. **theme system確認**
   ```bash
   # theme値が利用可能か確認
   ls src/config/theme/
   ```

## 🚨 違反時のエラーメッセージ

### 基本的な違反

```
warning  🎨 直接的なTailwindカラークラス (bg-*-*) の使用は禁止です。
代わりに @/config/theme の colors を使用してください。
```

### 厳格モード違反

```
error  ❌ 直接的な色指定は禁止です。
@/config/theme/colors を使用してください。
例: colors.primary.DEFAULT, colors.semantic.error.DEFAULT
```

## 📊 チェック対象

### 検出されるパターン

- `bg-{color}-{number}`: 背景色の直接指定
- `text-{color}-{number}`: テキスト色の直接指定
- `border-{color}-{number}`: ボーダー色の直接指定
- `hover:bg-{color}-{number}`: ホバー状態の直接指定
- `dark:bg-{color}-{number}`: ダークモードの直接指定
- `p-{number}`, `m-{number}`: 余白の直接指定
- `text-{size}`: フォントサイズの直接指定
- `rounded-{size}`: 角丸の直接指定

### 除外されるパターン

- 基本レイアウトクラス（`flex`, `grid`, `block`など）
- 位置指定（`absolute`, `relative`など）
- サイズ指定（`w-*`, `h-*`）
- 構造的なクラス（`space-*`, `gap-*`）

## 🎨 利用可能なTheme値

### 色系統

- `colors.primary.*`: メインカラー
- `colors.secondary.*`: サブカラー
- `colors.semantic.*`: セマンティックカラー（成功、警告、エラー）
- `colors.text.*`: テキストカラー
- `colors.background.*`: 背景色
- `colors.border.*`: ボーダーカラー

### タイポグラフィ

- `typography.heading.*`: 見出し用フォント
- `typography.body.*`: 本文用フォント
- `typography.special.*`: 特別な用途のフォント

### スペーシング

- `spacing.component.*`: コンポーネント内余白
- `spacing.button.*`: ボタン専用余白
- `spacing.stack.*`: 垂直方向の間隔
- `spacing.page.*`: ページレベルの余白

### その他

- `rounded.component.*`: コンポーネント別角丸
- `layout.*`: レイアウト設定
- `animations.*`: アニメーション設定

## 🔄 移行戦略

### Phase 1: 基本有効化 ✅

- theme-simple.jsの統合
- 既存ファイルは警告レベル
- 大部分を除外設定で段階的移行

### Phase 2: 新規コンポーネント厳格化 ✅

- theme-strict.jsの追加
- 新規作成ファイルでの厳格チェック
- テスト用コンポーネントでの動作確認

### Phase 3: 重要コンポーネント移行

- 共通UIコンポーネントから順次移行
- theme-simple.jsの除外リストから段階的削除
- 各featureモジュール単位での移行

### Phase 4: 完全移行

- 全ファイルでtheme system使用
- カスタムルールの有効化
- 100% theme compliance達成

## 💡 ベストプラクティス

### 1. インポートの統一

```tsx
// ✅ 推奨 - 必要な分野のみインポート
import { colors, typography } from '@/config/theme'

// ❌ 非推奨 - 全体インポート
import * as theme from '@/config/theme'
```

### 2. className構成

```tsx
// ✅ 推奨 - template literalで構成
const buttonClasses = `
  ${colors.primary.DEFAULT}
  hover:${colors.primary.hover}
  ${spacing.button.md}
  ${rounded.component.button.md}
`

// ✅ 推奨 - 配列join構成
const cardClasses = [colors.background.surface, spacing.component.lg, rounded.component.card.md].join(' ')
```

### 3. 条件付きスタイリング

```tsx
// ✅ 推奨 - theme値での条件分岐
<div className={`
  ${colors.background.surface}
  ${isError ? colors.semantic.error.background : colors.background.base}
`}>
```

## 🛠️ トラブルシューティング

### よくあるエラーと解決方法

**Q: theme値が見つからない**

```bash
# theme定義を確認
ls -la src/config/theme/
cat src/config/theme/colors.ts
```

**Q: ESLintエラーが大量に表示される**

```bash
# 段階的に修正 - 1ファイルずつ
npx eslint src/components/MyComponent.tsx --fix
```

**Q: 既存のライブラリコンポーネントでエラー**

- `theme-simple.js`の除外リストに追加
- または`/* eslint-disable no-restricted-syntax */`でファイル単位で無効化

## 📈 効果測定

### 成功指標

- Theme violation件数: 目標 0件
- 新規コンポーネントの100% theme compliance
- ダークモード切り替えでのUI破綻: 0件
- デザインシステム変更時の影響範囲: `/src/config/theme`のみ

### 監視コマンド

```bash
# theme violation チェック
npm run lint | grep "theme\|Tailwind"

# 特定ディレクトリのtheme compliance
npx eslint src/components/ui/ | grep "restricted-syntax"
```

---

**最終更新**: 2025-09-18  
**ステータス**: Phase 2完了、新規コンポーネントでの厳格enforcement実装済み
