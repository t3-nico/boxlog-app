# CLAUDE.md - BoxLog App メインリポジトリ

このファイルは、BoxLog App メインリポジトリでの Claude Code (claude.ai/code) の動作指針を定義します。

## 🗣️ コミュニケーション言語

**重要: 基本的に日本語で応答してください。** ただし、技術的に一般的な英語（feature、bug、commit、etc.）は適宜使用可能です。

## 📚 ドキュメント配置

**重要: このリポジトリ内でドキュメントを直接管理しています。**

プロジェクトのドキュメントは以下の場所に配置されています：
- **開発ドキュメント**: `docs/` ディレクトリ
- **コンポーネントガイド**: `src/components/` の各ディレクトリ
- **型定義・API**: TypeScript定義ファイル
- **設定ファイル**: `src/config/` ディレクトリ

## 🚀 開発コマンド

**重要**: すべての開発コマンドは1Password Developer Security経由で実行されます。

```bash
# 開発サーバー起動（1Password経由）
npm run dev

# プロダクションビルド（1Password経由）
npm run build

# リンティング実行
npm run lint

# テスト実行（1Password経由）
npm test

# 型チェック（1Password経由）
npm run typecheck
```

### 🔐 1Password連携

BoxLogでは機密情報管理に1Password Developer Securityを使用：
- **セットアップ**: `docs/1PASSWORD_SETUP.md` を参照
- **環境変数**: `.env.local` で1Password参照形式を使用
- **フォールバック**: 緊急時は `npm run dev:fallback` で従来通り実行可能

## 🏗️ プロジェクト概要

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

### 主要技術スタック

- **フロントエンド**: Next.js 14（App Router）, React 18, TypeScript
- **UIコンポーネント**: shadcn/ui（基本）, kiboUI（高度な機能）
- **ドキュメント**: リポジトリ内で直接管理
- **データベース**: Supabase（PostgreSQL）
- **スタイリング**: Tailwind CSS v4 + 8pxグリッドシステム

### コンポーネント選択優先度

1. **🥇 shadcn/ui（第一選択）** - 基本UIコンポーネント
2. **🥈 kiboUI（高度な機能）** - AI コンポーネント、Kanban など
3. **🥉 カスタム実装（最後の手段）** - ライブラリオプションが存在しない場合のみ

## 🎯 開発ワークフロー

### ブランチ戦略
- **dev**: 開発・統合ブランチ（メイン作業）
- **main**: 本番環境ブランチ
- **feature/***: 機能開発ブランチ
- **fix/***: バグ修正ブランチ

### 重要なルール
1. **コミット前に `npm run lint` を必ず実行**
2. **新しいコンポーネントはライト・ダークモード両方をテスト**
3. **8pxグリッドシステムに準拠**
4. **TypeScript を厳密に使用（`any` 型を避ける）**
5. **すべてのスタイリングは `/src/config/theme` を必ず使用**
6. **テストはコロケーション方式でfeatureごとに配置**

## 📋 開発時の指針

### Claude Code 使用時
- **コンポーネント実装**: shadcn/ui → kiboUI → カスタム の順で検討
- **デザインシステム**: `/src/config/theme` の統一トークンを使用
- **型安全**: TypeScript を厳密に使用

### ドキュメント更新
1. **開発ドキュメント**: `docs/` ディレクトリで管理
2. **コンポーネント**: インラインコメントとJSDoc
3. **変更追跡**: コミットメッセージで修正内容を明記

## 🔗 重要なリンク

- **デザインシステム**: `/src/config/theme/`
- **コンポーネント**: `/src/components/`
- **開発ドキュメント**: `/docs/`
- **TypeScript設定**: `tsconfig.json`

## 🎨 デザインシステム（Theme）の厳守

### 必須要件
BoxLogでは統一されたデザインシステムを採用しています。
**すべてのスタイリングは `/src/config/theme` を使用してください。**

### ❌ 禁止事項（絶対にやらないこと）

```tsx
// ❌ Tailwindクラスの直接指定
<div className="bg-white text-gray-700 p-4">

// ❌ 色の直接指定
<button className="bg-blue-600 hover:bg-blue-700">

// ❌ サイズの直接指定
<h1 className="text-3xl font-bold">

// ❌ 任意値の使用
<div className="p-[13px] text-[#3B82F6]">

// ❌ ダークモードの個別指定
<div className="bg-white dark:bg-gray-900">
```

### ✅ 正しい実装方法

```tsx
// ✅ 必ずthemeをインポート
import { colors, typography, spacing, borders, rounded, animations } from '@/config/theme'

// ✅ themeの値を使用
<div className={colors.background.base}>
  <h1 className={typography.heading.h1}>
    タイトル
  </h1>
  <button className={`${colors.primary.DEFAULT} ${spacing.button.md} ${rounded.component.button.md}`}>
    ボタン
  </button>
</div>
```

### 📁 利用可能なthemeファイル

- `colors.ts` - すべての色定義（primary, secondary, semantic, background, text, border）
- `typography.ts` - 文字スタイル（heading, body, link, special）
- `spacing.ts` - 余白（8pxグリッド準拠）
- `layout.ts` - レイアウト（3カラム構成、コンテナ、グリッド）
- `animations.ts` - アニメーション（transition, hover, loading, feedback）
- `elevation.ts` - 影と境界線（borders, elevation）
- `rounded.ts` - 角丸（component別、サイズ別）
- `icons.ts` - アイコンサイズと色

### 🔍 実装前の確認事項

1. **themeに定義があるか確認**
   ```bash
   # 例：青色を使いたい場合
   # colors.tsを確認 → primary.DEFAULT がある → これを使う
   ```

2. **themeにない場合**
   - 安易に直接指定しない
   - 本当に必要か検討
   - 必要なら`theme/`に追加してから使用

3. **コンポーネント作成時**
   ```tsx
   // 新規コンポーネントの最初の行
   import { colors, typography, spacing } from '@/config/theme'
   // これを書くことから始める
   ```

### 💡 なぜthemeを使うのか

1. **一貫性** - アプリ全体で統一されたデザイン
2. **保守性** - 色やサイズの変更が1箇所で完結
3. **ダークモード** - 自動対応（個別指定不要）
4. **型安全** - TypeScriptの補完とチェック
5. **8pxグリッド** - 整然としたレイアウト

### 🚨 レビュー基準

PRレビュー時、以下があれば修正を要求：
- Tailwindクラスの直接指定
- 色コード（#FFFFFFなど）の直接指定
- `dark:` プレフィックスの使用
- カスタム値（p-[13px]など）の使用
- themeのインポートがないコンポーネント

### 📋 移行チェックコマンド

```bash
# 直接指定が残っていないか確認
grep -r "bg-\|text-\|border-" --include="*.tsx" src/ | grep -v "config/theme"

# themeを使用しているファイル数
grep -r "from '@/config/theme'" --include="*.tsx" src/ | wc -l
```

### 🎯 目標

**100% theme経由でのスタイリング**を実現し、デザインの変更が`/src/config/theme`の編集だけで完結する状態を維持する。

---

**重要**: この規則は例外なく適用されます。「今回だけ」「仮で」といった理由での直接指定も認めません。

## 🧪 テスト戦略

### コロケーション方式の採用

**重要: テストファイルは対象コードと同じディレクトリに配置してください。**

```
src/features/tasks/
├── components/
│   ├── TaskList.tsx
│   └── TaskList.test.tsx  ← コンポーネントテスト
├── stores/
│   ├── useTaskStore.ts
│   └── useTaskStore.test.ts  ← ストアテスト
└── utils/
    ├── taskHelpers.ts
    └── taskHelpers.test.ts  ← ユーティリティテスト
```

### テストフレームワーク

- **Vitest** - テストランナー（Jest互換）
- **@testing-library/react** - コンポーネントテスト
- **@testing-library/jest-dom** - DOM マッチャー

### テスト命名規則

```tsx
// ✅ 正しい命名
TaskList.test.tsx
useTaskStore.test.ts
taskHelpers.test.ts

// ❌ 避ける命名
TaskList.spec.tsx
test/TaskList.tsx
```

### テスト実行コマンド

```bash
# 全テスト実行
npm test

# 監視モード
npm run test:watch

# カバレッジ付き
npm run test:coverage
```

---

**📖 このドキュメントについて**: BoxLog App メインリポジトリ開発指針  
**最終更新**: 2025-08-22  
**バージョン**: v3.0 - サブモジュール削除・独立運用版