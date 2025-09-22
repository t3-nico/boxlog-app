# CLAUDE.md - BoxLog App メインリポジトリ

このファイルは、BoxLog App メインリポジトリでの Claude Code (claude.ai/code) の動作指針を定義します。

## 🗣️ コミュニケーション言語

**重要: 基本的に日本語で応答してください。** ただし、技術的に一般的な英語（feature、bug、commit、etc.）は適宜使用可能です。

## 📚 ドキュメント構成

**重要: このリポジトリ内でドキュメントを直接管理しています。**

- **メインドキュメント**: [`docs/README.md`](docs/README.md) - プロジェクト全体概要
- **開発セットアップ**: [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md) - 1Password連携
- **ESLint設定**: [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) - コード品質
- **デザインシステム**: [`docs/DESIGN_SYSTEM_README.md`](docs/DESIGN_SYSTEM_README.md) - UI統一
- **テーマ強制**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) - スタイル管理
- **Bundle監視**: [`docs/BUNDLE_MONITORING.md`](docs/BUNDLE_MONITORING.md) - パフォーマンス

## 🚀 開発コマンド

**重要**: 1Password Developer Security完全自動化システムを採用しています。

```bash
# === 推奨: スマート自動化コマンド ===
npm run smart:dev           # 開発サーバー（自動認証・同期）
npm run smart:build         # ビルド（自動認証・同期）
npm run smart:test          # テスト（自動認証・同期）

# === 従来コマンド（手動op run） ===
npm run dev                 # op run --env-file=.env.local -- next dev
npm run build               # op run --env-file=.env.local -- next build
npm run test                # op run --env-file=.env.local -- vitest

# === 1Password管理コマンド ===
npm run 1password:auth      # 認証状態確認・自動認証
npm run 1password:sync      # 環境変数同期
npm run 1password:audit     # セキュリティ監査
npm run 1password:compliance # コンプライアンスレポート
```

詳細は [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md) を参照してください。

## 🏗️ プロジェクト概要

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

### 主要技術スタック

- **フロントエンド**: Next.js 14（App Router）, React 18, TypeScript
- **UIコンポーネント**: shadcn/ui（基本）, kiboUI（高度な機能）
- **データベース**: Supabase（PostgreSQL）
- **スタイリング**: Tailwind CSS v4 + 8pxグリッドシステム

詳細は [`docs/README.md`](docs/README.md) を参照してください。

### コンポーネント選択優先度

1. **🥇 shadcn/ui（第一選択）** - 基本UIコンポーネント
2. **🥈 kiboUI（高度な機能）** - AI コンポーネント、Kanban など
3. **🥉 カスタム実装（最後の手段）** - ライブラリオプションが存在しない場合のみ

## 🎯 開発ワークフロー

### ブランチ戦略

- **dev**: 開発・統合ブランチ（メイン作業）
- **main**: 本番環境ブランチ
- **feature/\***: 機能開発ブランチ
- **fix/\***: バグ修正ブランチ

### 重要なルール

1. **コミット前に `npm run lint` を必ず実行** - [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) 参照
2. **新しいコンポーネントはライト・ダークモード両方をテスト**
3. **8pxグリッドシステムに準拠**
4. **TypeScript を厳密に使用（`any` 型を避ける）**
5. **未使用変数・未使用インポートの禁止（コードクリーンアップ徹底）**
6. **複雑度管理でリーダブルコードを維持（関数の複雑度15以下推奨、10以下必須）**
7. **すべてのスタイリングは `/src/config/theme` を必ず使用** - [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) 参照
8. **テストはコロケーション方式でfeatureごとに配置**
9. **アクセシビリティ（WCAG AA準拠）を必ず確認** - [`docs/performance/ACCESSIBILITY_TESTING_GUIDE.md`](docs/performance/ACCESSIBILITY_TESTING_GUIDE.md) 参照

## 📋 開発時の指針

### Claude Code 使用時

- **コンポーネント実装**: shadcn/ui → kiboUI → カスタム の順で検討
- **デザインシステム**: `/src/config/theme` の統一トークンを使用
- **型安全**: TypeScript を厳密に使用
- **コードクリーンアップ**: 未使用変数・インポートの除去を徹底
- **リーダブルコード**: 関数の複雑度を低く保ち、理解しやすいコードを実装

### ドキュメント更新

1. **開発ドキュメント**: `docs/` ディレクトリで管理
2. **コンポーネント**: インラインコメントとJSDoc
3. **変更追跡**: コミットメッセージで修正内容を明記
4. **品質管理**: ドキュメント・コード整合性の自動チェック

#### 📚 ドキュメント品質管理コマンド

```bash
# 日常開発時
npm run docs:check        # 整合性チェック
npm run docs:fix-and-check # 自動修正→チェック（推奨）

# コミット前必須
npm run lint && npm run docs:check && npm run a11y:check
```

詳細は [`docs/development/DOCS_WORKFLOW_GUIDE.md`](docs/development/DOCS_WORKFLOW_GUIDE.md) を参照してください。

## 📋 Issue管理ルール（絶対遵守）

### 🎯 基本方針

**すべての新しい作業はIssueで管理してください。これは絶対のルールです。**

> 「新しい動きをする場合は基本はissueに入れてそこで進捗管理をするって感じにしたい。これを絶対のルールにする。」

### 📝 Issue化が必要な作業

- ✅ **新機能の実装** - すべての機能追加
- ✅ **バグ修正** - 不具合対応
- ✅ **リファクタリング** - コード改善
- ✅ **ドキュメント更新** - 仕様書・README更新
- ✅ **設定変更** - CI/CD・環境設定
- ✅ **依存関係更新** - ライブラリアップデート
- ✅ **パフォーマンス改善** - 最適化作業

### 🚀 Issue作成手順

```bash
# 1. 新しい作業開始
npm run issue:start "機能名: 実装内容"

# 2. 進捗更新
npm run issue:progress "作業内容の詳細"

# 3. 完了報告
npm run issue:complete "完了内容とテスト結果"
```

### 🏷️ Issue管理システム

| 機能                             | ステータス | 説明                             |
| -------------------------------- | ---------- | -------------------------------- |
| **Issue Manager + テンプレート** | ✅ 対応済  | Claude Code作業進捗をIssue化     |
| **作業ログ自動化**               | ✅ 完璧    | 4種類のテンプレート + 自動化     |
| **ステータス管理**               | ✅ 完璧    | ready→in-progress→review→blocked |
| **詳細追跡**                     | ✅ 完璧    | Issue Timeline + Commit History  |
| **週次レポート**                 | ✅ 完璧    | Weekly Progress Report           |

### 📊 Issue分類・ラベル

#### 優先度ラベル

- `priority:critical` - 緊急対応必須
- `priority:high` - 高優先度
- `priority:medium` - 中優先度（デフォルト）
- `priority:low` - 低優先度

#### 作業種別ラベル

- `type:feature` - 新機能
- `type:bugfix` - バグ修正
- `type:refactor` - リファクタリング
- `type:docs` - ドキュメント
- `type:chore` - 雑務・設定

#### サイズ見積もり

- `size:xs` - 1時間未満
- `size:sm` - 1-4時間
- `size:md` - 4-8時間
- `size:lg` - 1-2日
- `size:xl` - 2日以上

### 🌿 ブランチ戦略

**Issue管理は細かく行いますが、ブランチは柔軟に運用します。**

#### 基本方針

- ✅ **Issue = 細かく管理** - すべての作業をIssue化
- ✅ **ブランチ = 自由運用** - 必要に応じて適切な粒度で作成
- ✅ **Issue ≠ ブランチ** - 1つのブランチで複数Issueに対応可能

#### ブランチ作成の判断基準

```bash
# ✅ ブランチを作る場合
- 大きな機能追加（複数日の作業）
- 実験的な実装
- 複数人で作業する機能
- リスクの高い変更

# ✅ ブランチを作らない場合
- 小さなバグ修正
- ドキュメント更新
- 設定ファイルの調整
- 軽微なリファクタリング
```

### ⚠️ 重要な注意事項

1. **例外は認めません** - どんな小さな作業でもIssue化
2. **作業前にIssue作成** - コードを書く前に必ずIssue作成
3. **適切なラベル付与** - 優先度・種別・サイズを必ず設定
4. **進捗の定期更新** - 作業中は進捗を随時更新
5. **完了時の詳細報告** - 成果物とテスト結果を必ず記載
6. **ブランチは柔軟運用** - Issue数に比例してブランチを作る必要はない
7. **ブランチ操作禁止** - Claude Codeはブランチを操作しない（ユーザー管理）

## 🔗 重要なリンク

- **デザインシステム**: `/src/config/theme/`
- **コンポーネント**: `/src/components/`
- **開発ドキュメント**: `/docs/`
- **TypeScript設定**: `tsconfig.json`
- **Issue管理スクリプト**: `/scripts/simple-issue-manager.js`

## 🎨 デザインシステム（Theme）の厳守

### 必須要件

BoxLogでは統一されたデザインシステムを採用しています。
**すべてのスタイリングは `/src/config/theme` を使用してください。**

詳細は [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) を参照してください。

### ❌ 禁止事項（絶対にやらないこと）

- Tailwindクラスの直接指定
- 色の直接指定（#FFFFFFなど）
- `dark:` プレフィックスの使用
- カスタム値（p-[13px]など）の使用

### ✅ 正しい実装方法

```tsx
// ✅ 必ずthemeをインポート
import { colors, typography, spacing, borders, rounded, animations } from '@/config/theme'

// ✅ themeの値を使用
;<div className={colors.background.base}>
  <h1 className={typography.heading.h1}>タイトル</h1>
  <button className={`${colors.primary.DEFAULT} ${spacing.button.md} ${rounded.component.button.md}`}>ボタン</button>
</div>
```

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

詳細は [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) の「Vitestカバレッジ80%必須システム」を参照してください。

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

**📖 このドキュメントについて**: BoxLog App メインリポジトリ開発指針
**最終更新**: 2025-09-22
**バージョン**: v4.0 - docs/参照スリム版 (1484行→370行、75%削減)
