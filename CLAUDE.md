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
- **feature/\***: 機能開発ブランチ
- **fix/\***: バグ修正ブランチ

### 重要なルール

1. **コミット前に `npm run lint` を必ず実行**
2. **新しいコンポーネントはライト・ダークモード両方をテスト**
3. **8pxグリッドシステムに準拠**
4. **TypeScript を厳密に使用（`any` 型を避ける）**
5. **未使用変数・未使用インポートの禁止（コードクリーンアップ徹底）**
6. **複雑度管理でリーダブルコードを維持（関数の複雑度15以下推奨、10以下必須）**
7. **すべてのスタイリングは `/src/config/theme` を必ず使用**
8. **テストはコロケーション方式でfeatureごとに配置**

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

### 📈 週次Progress Report

毎週自動生成される作業サマリー：

- 完了したIssue数・時間
- 進行中のIssue状況
- ブロック要因の分析
- 次週の計画

### 🎯 2年後の追跡可能性

すべてのIssueに以下が記録：

- **開始時刻**: 作業開始タイムスタンプ
- **ブランチ情報**: 使用ブランチ名
- **コミット履歴**: 関連するすべてのコミット
- **進捗ログ**: 詳細な作業内容
- **完了報告**: 成果物とテスト結果

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

#### Issue-Branch関係の例

```
feature/user-auth ブランチ
├── Issue #123: ログイン画面UI実装
├── Issue #124: 認証API連携
├── Issue #125: エラーハンドリング追加
└── Issue #126: テストケース作成

main/dev ブランチ直接
├── Issue #127: README更新
├── Issue #128: ESLint設定調整
└── Issue #129: タイポ修正
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
;<div className={colors.background.base}>
  <h1 className={typography.heading.h1}>タイトル</h1>
  <button className={`${colors.primary.DEFAULT} ${spacing.button.md} ${rounded.component.button.md}`}>ボタン</button>
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
test / TaskList.tsx
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
<div className="grid grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
  {/* デスクトップ：4カラム → タブレット：2カラム → モバイル：1カラム */}
</div>

// 複雑なテーブルはモバイルで横スクロール許可
<div className="w-full overflow-x-auto">
  <table className="min-w-[800px]">
    {/* 最小幅を確保し、スクロール可能に */}
  </table>
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

### 🛠️ 実装パターン集

#### 1. レイアウトの切り替え

```tsx
// フレックスボックスの方向転換
<div className="flex flex-col lg:flex-row gap-4">
  {/* モバイル：縦並び、デスクトップ：横並び */}
</div>

// グリッドの動的調整
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {/* 段階的にカラム数を増やす */}
</div>
```

#### 2. 表示/非表示の制御

```tsx
// プログレッシブエンハンスメント
<aside className="hidden lg:block">
  {/* デスクトップのみ表示（追加情報） */}
</aside>

// グレースフルデグラデーション
<nav className="hidden md:flex">
  {/* タブレット以上で表示 */}
</nav>
<button className="md:hidden">
  {/* モバイルのみハンバーガーメニュー */}
</button>
```

#### 3. スペーシングの調整

```tsx
// デバイスサイズに応じた余白
<section className="py-8 md:py-12 lg:py-16">
  <div className="px-4 sm:px-6 lg:px-8 xl:px-12">{/* 画面が大きくなるにつれて余白も増加 */}</div>
</section>
```

#### 4. タッチ対応の考慮

```tsx
// モバイルでのタッチターゲット最小44px確保
<button className="p-2 sm:p-3 min-h-[44px] min-w-[44px]">
  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
</button>

// ホバー効果はタッチデバイスで控えめに
<div className="hover:bg-gray-100 lg:hover:scale-105">
  {/* デスクトップのみスケール効果 */}
</div>
```

### 📱 コンポーネント別実装例

#### FloatingActionButton（FAB）レスポンシブ実装

```tsx
// レスポンシブ位置調整の実例
className={cn(
  'fixed z-50',
  // モバイル: 中央寄り、ボトムナビの上
  'right-4 bottom-20',
  // タブレット: やや右寄り
  'md:right-6 md:bottom-6',
  // デスクトップ: より右寄り
  'lg:right-8',
  // 大画面: さらに右寄り
  'xl:right-12',
  // 超大画面: 最大右寄り
  '2xl:right-16',
)}

// サイズとアイコンもレスポンシブ対応
const sizeMap = {
  sm: 'w-12 h-12 md:w-14 md:h-14',
  md: 'w-14 h-14 md:w-16 md:h-16',
  lg: 'w-16 h-16 md:w-18 md:h-18'
}
```

#### データテーブル

```tsx
// アプローチ1: レスポンシブテーブル（優先度列の表示切り替え）
<table>
  <thead>
    <tr>
      <th>名前</th> {/* 常に表示 */}
      <th className="hidden sm:table-cell">日付</th>
      <th className="hidden lg:table-cell">詳細</th>
    </tr>
  </thead>
</table>

// アプローチ2: モバイルでカード形式に変換
<div className="hidden md:block">
  <Table data={data} />
</div>
<div className="md:hidden space-y-4">
  {data.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### フォーム

```tsx
// 入力フィールドの配置最適化
<form className="space-y-6">
  {/* 2カラムレイアウト（大画面） */}
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <Input label="姓" />
    <Input label="名" />
  </div>

  {/* フル幅（全デバイス） */}
  <Input label="メールアドレス" className="w-full" />

  {/* ボタングループ */}
  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
    <Button variant="secondary" className="w-full sm:w-auto">
      キャンセル
    </Button>
    <Button variant="primary" className="w-full sm:w-auto">
      保存
    </Button>
  </div>
</form>
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

### 🚀 実装の優先順位

1. **必須対応**（すべての画面）
   - 基本的な表示崩れがない
   - 主要機能へのアクセスが可能
   - テキストが読める

2. **推奨対応**（主要画面）
   - UIの最適化
   - タッチ操作の改善
   - レイアウトの調整

3. **オプション対応**（補助機能）
   - アニメーションの追加
   - 高度なインタラクション
   - デバイス固有の最適化

### 💡 判断基準

画面の性質に応じて適切なアプローチを選択：

- **データ密度が高い** → デスクトップ優先、モバイルは簡略化
- **頻繁に使用する** → 全デバイスで快適な操作性を確保
- **閲覧中心** → モバイルでも読みやすさを重視
- **作業効率重視** → デスクトップで最大効率、モバイルは最小限

### ⚠️ よくある実装ミス

```tsx
// ❌ 固定幅の使用
<div className="w-[1200px]">

// ✅ 最大幅とレスポンシブ幅
<div className="w-full max-w-7xl">

// ❌ px単位の固定フォントサイズ
<p style={{ fontSize: '16px' }}>

// ✅ レスポンシブなフォントサイズ
<p className="text-sm sm:text-base lg:text-lg">

// ❌ ホバーのみのインタラクション
<div className="opacity-0 hover:opacity-100">

// ✅ フォーカスとタッチも考慮
<div className="opacity-0 hover:opacity-100 focus:opacity-100 active:opacity-100">
```

---

**📖 このドキュメントについて**: BoxLog App メインリポジトリ開発指針  
**最終更新**: 2025-08-22  
**バージョン**: v3.0 - サブモジュール削除・独立運用版
