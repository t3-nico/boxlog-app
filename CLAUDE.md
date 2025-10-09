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

- ❌ 禁止: `React.FC`（非推奨）
- ❌ 禁止: `export default`
- ✅ 必須: `export function ComponentName() {}`（名前付きエクスポート）

#### 4. データフェッチング

- ❌ 禁止: `useEffect`でのfetch
- ❌ 禁止: `getServerSideProps`, `getStaticProps`
- ✅ 必須: Server ComponentsまたはTanStack Query

#### 5. 状態管理

- ❌ 禁止: Reduxや新しい状態管理ライブラリの導入
- ✅ 必須: Zustand（グローバル）、`useState`（ローカル）

### 判断における禁止事項

- ❌ 「たぶん」「おそらく」での実装（確信が持てない場合は確認を求める）
- ❌ 2022年以前のStack Overflow回答を参考にすること
- ❌ 公式ドキュメントを確認せずに独自実装を提案すること

---

## 🚨 絶対遵守ルール（6項目）

1. **コミット前**: `npm run lint` 必須実行（3.6秒で完了）
2. **スタイリング**: `globals.css` のセマンティックトークン使用（Tailwindクラス直接指定。`bg-card`, `text-foreground` 等）
3. **Issue管理**: すべての作業をIssue化（例外なし）
4. **TypeScript厳格**: `any` 型禁止
5. **公式準拠**: Next.js/React/TypeScript公式のベストプラクティスに従う（詳細は後述）
6. **コロケーション**: 関連ファイルは必ず近接配置（テスト・型・hooks・ドキュメント等）

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
- **AI品質基準**: [`.claude/code-standards.md`](.claude/code-standards.md)
- **デザインシステム**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md)

### 開発ワークフロー

- **コミット規約**: [`docs/development/COMMIT_RULES.md`](docs/development/COMMIT_RULES.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)
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

### 🚫 使用禁止

- ❌ `<img>` タグ → ✅ `<Image>` コンポーネント
- ❌ 外部CDNフォント → ✅ `next/font`
- ❌ `pages/` ディレクトリ → ✅ `app/` ディレクトリ（新規作成時）
- ❌ `getServerSideProps` → ✅ Server Components
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

**📖 最終更新**: 2025-10-06 | **バージョン**: v9.1 - ドキュメント棲み分け明確化
