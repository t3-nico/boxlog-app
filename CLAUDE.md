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
npm run smart:report        # レポート生成（自動認証・同期）

# === 従来コマンド（手動op run） ===
npm run dev                 # op run --env-file=.env.local -- next dev
npm run build               # op run --env-file=.env.local -- next build
npm run typecheck           # op run --env-file=.env.local -- tsc --noEmit

# === コード品質管理コマンド ===
npm run lint                # ESLint全品質チェック
npm run lint:fix            # 自動修正可能な問題を修正
npm run lint:a11y           # アクセシビリティ専用チェック

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
8. **テスト環境**: 現在はテストファイル整理済み（将来的にE2Eテスト導入予定）**
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

## 🛡️ ESLint企業級品質管理システム

BoxLogでは2025年9月に大幅なESLint強化を実施し、企業レベルの品質管理を実現しています。

### 8分野の包括的強化

| 分野 | 実装内容 | 効果 |
|------|----------|------|
| **🔒 セキュリティ** | XSS防止、秘密情報ハードコーディング検出 | セキュリティ脆弱性の未然防止 |
| **♿ アクセシビリティ** | WCAG AA準拠の自動チェック | ユニバーサルデザイン保証 |
| **⚡ パフォーマンス** | Bundle最適化、メモリリーク防止 | アプリケーション高速化 |
| **📦 Import管理** | 重複防止、順序統一、未使用削除 | コードベースの整理・最適化 |
| **🔧 TypeScript厳格化** | 型安全性強化、非null制御 | 実行時エラーの削減 |
| **🪝 コミットフック** | ESLint→prettier→tsc→監査 | 自動品質ゲート |
| **📝 コミットメッセージ** | Conventional Commits検証 | 変更履歴の標準化 |
| **🌿 ブランチ名** | プレフィックス強制 | Git運用の統一 |

### 自動化された品質ゲート

```bash
# コミット時（自動実行 - .husky/pre-commit）
1. ESLint全ルール適用 → 2. Prettier自動整形 → 3. TypeScript型チェック → 4. セキュリティ監査

# プッシュ時（自動実行 - .husky/pre-push）
ブランチ名検証: feature/, fix/, chore/, docs/, style/, refactor/, test/, build/

# コミットメッセージ時（自動実行 - .husky/commit-msg）
Conventional Commits準拠チェック（feat, fix, docs等 + 72文字制限）
```

### 成果・統計

- **実装Issue数**: 8件（#228〜#235, #246, #249〜#250）
- **設定ファイル**: 15個以上のESLint設定ファイルを最適化
- **検出ルール**: 100以上の品質ルールを追加・強化
- **自動修正**: lint:fixで70%以上の問題を自動解決
- **テストファイル整理**: 旧テストファイル・設定の完全除去

詳細は [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) を参照してください。

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

## 🎯 Claude Code セッション管理ルール

**重要**: 効率的な開発ワークフローのため、以下のセッション管理ルールを必ず遵守してください。

### 📋 基本原則

#### セッション境界の定義
- **機能単位**: 1つのfeature/fix/*ブランチ = 1セッション
- **時間制限**: 最大2時間 または 集中力低下時点
- **Issue単位**: 1つのGitHub Issue = 複数セッション可（工程分割）

#### セッション遷移ルール
- **タスク切り替え**: 必ず `/clear` → 新セッション開始
- **工程切り替え**: 探索→設計→実装→検証 で `/clear`
- **緊急対応**: 現セッションを中断・記録後に `/clear`

#### コンテキスト管理
- **60%使用率**: アラート → `/compact` 検討
- **80%到達**: 必須 `/compact` または セッション分割
- **重要な決定・発見**: CLAUDE.md に即座記録

### 🏗️ 開発工程別セッション

1. **🔍 調査セッション**: Issue分析・技術検証・仕様確認
2. **📋 設計セッション**: アーキテクチャ・API設計・UI設計
3. **⚡ 実装セッション**: コーディング・テスト実装
4. **🧪 検証セッション**: 動作確認・品質チェック・ドキュメント

### 📝 情報管理ルール

#### セッション開始時
- Issue番号 + 目標を明記
- 前回セッションの続きの場合は経緯を確認

#### セッション終了時
- 成果・残課題・次アクションを CLAUDE.md に記録
- 複雑な決定は理由・代替案・影響範囲を文書化
- 発見した問題は即座に GitHub Issue に起票

### 📊 品質指標

#### 効率性指標
- セッション目標達成率: 80%以上
- 時間予測精度: ±30%以内
- `/clear` 適切使用: タスク切り替え時100%

#### ナレッジ蓄積指標
- CLAUDE.md 更新頻度: セッション終了時100%
- 決定事項記録率: 重要判断100%
- Issue起票率: 問題発見時100%

詳細は [`docs/development/CLAUDE_SESSION_MANAGEMENT.md`](docs/development/CLAUDE_SESSION_MANAGEMENT.md) を参照してください。

---

**📖 このドキュメントについて**: BoxLog App メインリポジトリ開発指針
**最終更新**: 2025-09-25
**バージョン**: v4.1 - セッション管理ルール追加
