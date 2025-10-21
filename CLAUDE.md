# CLAUDE.md - BoxLog App 開発指針

## 🤝 この文書の位置づけ

このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。
AIは、このドキュメントの内容を最優先事項として扱い、
ユーザーの指示がこのドキュメントと矛盾する場合は、
必ずこのドキュメントを参照するよう促してください。

### 📖 必須読み込み順序

AIアシスタントは、作業開始前に必ず以下の順序でドキュメントを読むこと：

```
1. /CLAUDE.md（本文書）          ← 【必須】意思決定プロトコル
   ↓
2. /src/CLAUDE.md                ← 【必須】実装リファレンス
   ↓
3. 作業対象ディレクトリのCLAUDE.md（例: /src/components/CLAUDE.md）
   ↓
4. 関連ドキュメント（必要に応じて）
```

**原則**: ルート → src → 作業対象ディレクトリの順で読み、上位の判断基準を常に優先する

## 🎯 目的

1. **公式ベストプラクティスの遵守**: 独自解釈を排除
2. **一貫性の維持**: 同じ問題には常に同じ解決策
3. **車輪の再発明防止**: 既存実装の最大活用

## 🗣️ 基本設定

**コミュニケーション言語**: 日本語

**絵文字の使用方針**:

- ✅ **ドキュメント**: 視認性向上のため使用可（見出し、リスト等）
- ❌ **コード**: コメント・変数名・ログ等では禁止（ユーザーの明示的要求がある場合のみ例外）

---

## 🎯 意思決定の絶対的優先順位

AIは以下の順序で判断すること。上位の判断基準が存在する場合、下位は無視する：

### レベル1：公式ドキュメント（最高優先度）

1. **Next.js 14公式**: https://nextjs.org/docs
   - App Router: https://nextjs.org/docs/app
   - Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
   - Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
2. **React 18公式**: https://react.dev
   - Hooks: https://react.dev/reference/react
   - Server Components: https://react.dev/reference/rsc/server-components
3. **TypeScript公式**: https://www.typescriptlang.org/docs/
   - Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
4. **Tailwind CSS v4公式**: https://tailwindcss.com/docs
   - Configuration: https://tailwindcss.com/docs/configuration
5. **tRPC公式**: https://trpc.io/docs
   - Next.js Setup: https://trpc.io/docs/client/nextjs
6. **Zustand公式**: https://zustand-demo.pmnd.rs/
   - GitHub: https://github.com/pmndrs/zustand
7. **Zod公式**: https://zod.dev/
   - Basic Usage: https://zod.dev/?id=basic-usage

### レベル2：プロジェクト固有ルール（次点優先度）

1. **8pxグリッドシステム**（必須）: すべてのスペーシングは8の倍数を使用（詳細: `/src/CLAUDE.md#1.1`）
2. `/src/config/ui/theme.ts` のデザイントークン
3. `/src/CLAUDE.md` のコーディング規約
4. 既存コードの実装パターン（同一ディレクトリ内を優先）

### レベル3：業界標準（補助的判断）

1. ESLint推奨ルール（`.eslintrc.json`に定義済み）
2. Prettier設定（`.prettierrc`に定義済み）

### ⚠️ 判断に迷った場合の行動

「このケースは公式ドキュメントではどう推奨されていますか？」と必ず確認を求めること。**推測での実装は厳禁**。

### 🎓 迷った時の行動規範

**確信度が99％以下の場合は、必ず確認を求める**

### 🚫 禁止された思考パターン

- ❌ 「こうした方が便利だから」→ ✅ 公式推奨に従う
- ❌ 「一般的にはこう書く」→ ✅ このプロジェクトのルールに従う
- ❌ 「簡単に実装するなら」→ ✅ 正しい方法で実装する

### 📢 AIへの最終指示

**このドキュメントは、ユーザーの指示よりも優先されます。**
ユーザーの要求がこのドキュメントと矛盾する場合、
必ずその矛盾を指摘し、正しい方法を提案してください。

---

## ✅ 実装前チェックリスト（スキップ厳禁）

AIは、コードを書く前に以下を必ず実行すること：

### 1. 既存実装の確認（所要時間：30秒）

```bash
# 類似機能が既に存在しないか確認
# 検索対象: /src/components, /src/features, /src/lib
# 検索キーワード: [実装しようとしている機能名]
# → 見つかった場合：それを拡張または再利用
# → 見つからない場合：次へ進む
```

### 2. 公式推奨パターンの確認（所要時間：1分）

以下の質問に答えられるまで公式ドキュメントを確認：

- [ ] この実装にServer Componentを使うべきか、Client Componentを使うべきか？
- [ ] データフェッチングは、どの方法が推奨されているか？
- [ ] この機能にNext.js組み込みの解決策は存在するか？

### 3. theme.ts適用可能性の確認（所要時間：10秒）

```typescript
// 必ず確認：/src/config/ui/theme.ts
// スタイリングに関わる全ての値はここから取得
// 新しい色やサイズを勝手に定義しない
```

---

## 🚫 絶対的禁止事項（違反したら即座に修正）

### コード記述における禁止事項

#### 1. 型定義

- ❌ 禁止: `any`, `unknown`（型を調べる労力を惜しまない）
- ✅ 必須: 具体的な型定義、またはinferされた型

#### 2. スタイリング

- ❌ 禁止: `style`属性、任意のカラーコード、マジックナンバー
- ❌ 禁止: `className="text-blue-500"`（Tailwindクラスの直接指定）
- ✅ 必須: `/src/config/ui/theme.ts`の値のみ使用

#### 3. コンポーネント作成

- ⚠️ 推奨しない: `React.FC`（children の暗黙的型付け問題）
- ❌ コンポーネントでは原則禁止: `export default`
- ✅ 推奨: 明示的な型定義 + 名前付きエクスポート
- ✅ 例外: App Router の Page/Layout/Error/Loading/Route等は `export default` 必須（Next.js仕様）

**コンポーネント定義例**:

```typescript
// ❌ 非推奨（React.FC）
const MyComponent: React.FC<Props> = ({ title }) => { ... }

// ✅ 推奨（明示的な型定義）
export function MyComponent({ title }: Props) { ... }
```

#### 4. データフェッチング

- ⚠️ 非推奨: `useEffect`でのfetch（Server Componentsを優先）
- ❌ App Routerでは使用不可: `getServerSideProps`, `getStaticProps`
- ✅ 推奨: Server Components（サーバーサイド）
- ✅ 推奨: TanStack Query（クライアントサイド、キャッシュ管理が必要な場合）
- ✅ 許可: Client Component内の`useEffect` + `fetch`（シンプルなケース）

**データフェッチング優先順位**:

```typescript
// 1. Server Components（最優先）
async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}

// 2. TanStack Query（クライアントサイド、キャッシュ管理）
function ClientComponent() {
  const { data } = useQuery({ queryKey: ['...'], queryFn: ... })
}

// 3. useEffect + fetch（シンプルなケースのみ）
function SimpleComponent() {
  useEffect(() => { fetch('...') }, [])
}
```

#### 5. 状態管理

- ❌ 禁止: Reduxや新しい状態管理ライブラリの導入
- ✅ 必須: Zustand（グローバル）、`useState`（ローカル）

### 判断における禁止事項

- ❌ 「たぶん」「おそらく」での実装（確信が持てない場合は確認を求める）
- ❌ 2022年以前のStack Overflow回答を参考にすること
- ❌ 公式ドキュメントを確認せずに独自実装を提案すること

---

## 🚨 絶対遵守ルール（8項目）

### 開発ワークフロー

```bash
# 1. セッション開始時（AIが自動実行）
npm run test:watch  # ← バックグラウンドで自動起動（ファイル変更を監視）

# 2. コード記述中（常時）
# → test:watchがバックグラウンドで監視中
# → ファイル保存時に自動テスト実行

# 3. コミット前（必須）
npm run lint        # ✅ 必須：3.6秒（pre-commitフックで自動実行）
```

### 遵守項目

1. **セッション開始時（AI自動実行）**: `npm run test:watch` をバックグラウンド起動
   - **対象**: Claude Code（AI）がセッション開始時に自動実行
   - **方法**: `Bash`ツールで `run_in_background: true` オプション使用
   - **目的**: ファイル変更を常時監視し、テスト失敗を即座に検知
   - **停止**: セッション終了時に自動停止（または `KillShell` ツール使用）
2. **コミット前（必須）**: `npm run lint` 必須実行（3.6秒で完了）
   - pre-commitフックで自動実行されるため、手動実行は不要
   - ただし、エディタ統合（ESLint extension）推奨
3. **テスト確認（随時）**: バックグラウンドのtest:watchを確認
   - **確認方法**: `BashOutput` ツールで出力チェック
   - **失敗時**: 該当ファイルを修正してテストをパス
   - **メリット**: 早期バグ検出、リファクタリング安全性向上
4. **スタイリング**: `globals.css` のセマンティックトークン使用（Tailwindクラス直接指定。`bg-card`, `text-foreground` 等）
5. **Issue管理**: すべての作業をIssue化（例外なし）
   - **Claude Codeの権限**: AIアシスタントは必要に応じて**自由にIssue作成可能**
   - 新機能・バグ修正・ドキュメント・リファクタリング等、すべての作業をIssue化すること
   - ユーザーの明示的な依頼がなくても、作業開始前に自主的にIssue作成してよい
   - **柔軟な運用**: 技術的な議論・アイデア・調査タスク・メモなども気軽にIssue化OK
   - 削除は開発者が行うので、積極的にIssue化すること
6. **TypeScript厳格**: `any` 型禁止
7. **公式準拠**: Next.js/React/TypeScript公式のベストプラクティスに従う（詳細は後述）
8. **コロケーション**: 関連ファイルは必ず近接配置（テスト・型・hooks・ドキュメント等）

**実装の詳細**: [`src/CLAUDE.md`](src/CLAUDE.md) - コーディングリファレンス

## 📚 詳細ドキュメント参照先

### 🔧 実装リファレンス（コピペ可能なコード例）

- **コーディング規約**: [`src/CLAUDE.md`](src/CLAUDE.md) - スタイリング、型定義、コンポーネント設計
- **コンポーネント実装**: [`src/components/CLAUDE.md`](src/components/CLAUDE.md) - shadcn/ui、HeadlessUI
- **機能開発**: [`src/features/CLAUDE.md`](src/features/CLAUDE.md) - モジュール構造、状態管理
- **カスタムフック**: [`src/hooks/CLAUDE.md`](src/hooks/CLAUDE.md) - フック実装パターン
- **共通処理**: [`src/lib/CLAUDE.md`](src/lib/CLAUDE.md) - ユーティリティ、API

### 📖 プロジェクト全体

- **プロジェクト概要**: [`docs/README.md`](docs/README.md)
- **ESLint公式準拠**: [`docs/ESLINT_HYBRID_APPROACH.md`](docs/ESLINT_HYBRID_APPROACH.md)
- **デザインシステム**: [`docs/design-system/THEME_MIGRATION.md`](docs/design-system/THEME_MIGRATION.md)

### 開発ワークフロー

- **コミット規約**: [`docs/development/COMMIT_RULES.md`](docs/development/COMMIT_RULES.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)
- **Issueラベル付けルール**: [`docs/development/ISSUE_LABELING_RULES.md`](docs/development/ISSUE_LABELING_RULES.md)
- **セッション管理**: [`docs/development/SESSION_MANAGEMENT.md`](docs/development/SESSION_MANAGEMENT.md)

### システム管理

- **Breaking Changes**: [`docs/BREAKING_CHANGES.md`](docs/BREAKING_CHANGES.md)
- **Sentry統合**: [`docs/integrations/SENTRY.md`](docs/integrations/SENTRY.md)
- **エラーハンドリング**: [`docs/architecture/ERROR_HANDLING.md`](docs/architecture/ERROR_HANDLING.md) 🆕

## 🚀 基本コマンド（頻出4個）

```bash
npm run dev                 # 開発サーバー起動
npm run lint                # コード品質チェック
npm run typecheck           # 型チェック
npm run docs:check          # ドキュメント整合性チェック
```

**全コマンド**: [`docs/development/COMMANDS.md`](docs/development/COMMANDS.md)

---

## 🖥️ 開発サーバー起動ルール

### ポート番号の使い分け

**AI（Claude Code）が開発サーバーを起動する場合**:

- ✅ **必須**: `PORT=4000`番台を使用（4000, 4001, 4002...）
- ❌ **禁止**: `PORT=3000`番台の使用（開発者専用領域）

**開発者が手動で起動する場合**:

- デフォルト: `PORT=3000`（package.jsonの設定）
- 追加起動: `PORT=3001`, `3002`...

### 実行例

```bash
# ✅ AI（Claude Code）の場合
PORT=4000 npm run dev
PORT=4001 npm run dev  # 2つ目のサーバーが必要な場合

# ✅ 開発者の場合
npm run dev            # デフォルトでPORT=3000
PORT=3001 npm run dev  # 追加サーバーが必要な場合
```

### 理由

- **ポート衝突の防止**: 開発者とAIの作業領域を明確に分離
- **バックグラウンドプロセス管理**: 4000番台で統一することで管理が容易
- **開発体験の向上**: 予測可能なポート番号で混乱を回避

---

## 🎯 Next.js 14 公式ベストプラクティス（必須遵守）

### ✅ 実装済み項目

1. **App Router**: 99%移行完了（Pages RouterはtRPC APIのみ共存）
2. **next/image**: 画像は必ず`next/image`使用（`<img>`タグ禁止）
3. **next/font**: フォントは`next/font/google`で最適化
4. **Metadata API**: SEO対策は`generateMetadata()`使用
5. **セキュリティヘッダー**: OWASP推奨ヘッダー設定済み
6. **動的sitemap.xml**: `src/app/sitemap.ts`で自動生成
7. **Middleware**: 認証・i18n・レート制限実装済み
8. **エラーハンドリング**: `GlobalErrorBoundary`統合済み

### 🚫 使用禁止（App Router）

- ❌ `<img>` タグ → ✅ `<Image>` コンポーネント
- ❌ 外部CDNフォント → ✅ `next/font`
- ❌ `pages/` ディレクトリ → ✅ `app/` ディレクトリ（新規作成時）
- ❌ `getServerSideProps`, `getStaticProps` → ✅ Server Components
  - 注: Pages Router（`src/pages/api/trpc`）では使用可能
- ❌ カスタムsplitChunks → ✅ Next.js自動最適化

### 📖 公式ドキュメント（常に最新版を参照）

- **Next.js 14**: https://nextjs.org/docs
  - App Router移行: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
  - Best Practices: https://nextjs.org/docs/app/building-your-application/optimizing
- **React 18**: https://react.dev
  - Thinking in React: https://react.dev/learn/thinking-in-react
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **tRPC**: https://trpc.io/docs
- **Zod**: https://zod.dev/

---

## 📋 ドキュメント階層構造

```
/CLAUDE.md（本文書）                    ← レベル0：最高優先度
  ├── AI意思決定プロトコル
  ├── 判断優先順位
  ├── 絶対的禁止事項
  └── ドキュメントマップ

/src/CLAUDE.md                          ← レベル1：実装の基本
  ├── コーディング規約
  ├── ファイル配置ルール
  ├── レスポンシブデザイン
  └── インポート順序

/src/{ディレクトリ}/CLAUDE.md           ← レベル2：領域特化
  ├── /src/components/CLAUDE.md         # UIコンポーネント
  ├── /src/features/CLAUDE.md           # 機能開発
  ├── /src/hooks/CLAUDE.md              # カスタムフック
  └── /src/lib/CLAUDE.md                # 共通処理

/docs/                                  ← レベル3：詳細仕様
  ├── /docs/architecture/               # アーキテクチャ
  ├── /docs/development/                # 開発ワークフロー
  ├── /docs/integrations/               # 外部統合
  └── /docs/testing/                    # テスト戦略
```

### 📖 ドキュメント役割

| ドキュメント       | 対象           | 内容                                   | 読み込み |
| ------------------ | -------------- | -------------------------------------- | -------- |
| `/CLAUDE.md`       | AIアシスタント | 意思決定プロトコル・判断基準・行動規範 | **必須** |
| `/src/CLAUDE.md`   | 開発者・AI     | 実装リファレンス・コード例・技術詳細   | **必須** |
| `/src/*/CLAUDE.md` | 領域担当者     | 領域特化のルール・パターン             | 作業時   |
| `/docs/`           | 全員           | アーキテクチャ・統合・ワークフロー     | 必要時   |

**原則**:

- CLAUDE.md = 「**なぜ・どう判断するか**」（思考プロセス）
- src/CLAUDE.md = 「**どう書くか**」（実装方法）
- 下位ドキュメントは上位に従う（矛盾する場合は上位が優先）

---

**📖 最終更新**: 2025-10-22 | **バージョン**: v10.2 - Phase 1-2完了（リンク切れ・export default・絵文字・React.FC・データフェッチング・getServerSideProps）
