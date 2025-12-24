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
8. **Claude 4 ベストプラクティス**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
   - プロジェクト内ガイド: [`docs/development/CLAUDE_4_BEST_PRACTICES.md`](docs/development/CLAUDE_4_BEST_PRACTICES.md)

### レベル2：プロジェクト固有ルール（次点優先度）

1. **スタイルガイド**（必須）: [`docs/design-system/STYLE_GUIDE.md`](docs/design-system/STYLE_GUIDE.md)
   - 8pxグリッドシステム
   - カラーシステム（セマンティックトークン）
   - タイポグラフィ
   - レスポンシブデザイン
2. `src/app/globals.css` のセマンティックトークン（カラー、ダークモード）
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

### 🤖 Claude 4ベストプラクティスに基づく行動規範

AIは、開発者とのコミュニケーションにおいて以下を実践すること：

#### 1. 曖昧な指示への対応

開発者の指示が不明確な場合は、**推測で実装せず確認を求める**：

```markdown
「ご依頼を確認させてください。以下の点が明確でないため、
作業前に確認したいと思います:

**確認事項**:
1. [具体的な質問]

**想定される選択肢**:
- A案: [選択肢A]
- B案: [選択肢B]

どちらで進めますか？」
```

#### 2. ベストプラクティス違反の検出

開発者の指示がベストプラクティスに反する場合は、**理由と代替案を提示**：

```markdown
「ご依頼の実装方法について、一点確認させてください。

**懸念事項**: [公式ドキュメント]では[推奨方法]が推奨されています。
**理由**: [なぜ推奨されるか]
**提案**: [代替案]

このまま進めますか？それとも推奨方法で実装しますか？」
```

#### 3. 開発者への質問を促すケース

以下の場合は、必ず開発者に確認を求める：

- [ ] 複数の実装方法が存在し、どれが最適か判断できない
- [ ] セキュリティやパフォーマンスに影響する選択がある
- [ ] 既存の実装パターンと異なるアプローチが必要
- [ ] ドキュメントに記載のない新しいユースケース

**詳細**: [`docs/development/CLAUDE_4_BEST_PRACTICES.md`](docs/development/CLAUDE_4_BEST_PRACTICES.md)

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

### 3. globals.css セマンティックトークン確認（所要時間：10秒）

```typescript
// 必ず確認：/src/styles/globals.css
// スタイリングは globals.css で定義されたセマンティックトークンを使用
// 新しい色やサイズを勝手に定義しない
// 例: bg-card, text-foreground, border-border 等
```

---

## 🚫 絶対的禁止事項（違反したら即座に修正）

### コード記述における禁止事項

#### 1. 型定義

- ❌ 禁止: `any`, `unknown`（型を調べる労力を惜しまない）
- ✅ 必須: 具体的な型定義、またはinferされた型

#### 2. スタイリング

- ❌ 禁止: `style`属性、任意のカラーコード、マジックナンバー
- ❌ 禁止: `className="text-blue-500"`（Tailwindカラークラスの直接指定）
- ✅ 必須: `globals.css` のセマンティックトークン使用（`bg-card`, `text-foreground` 等）

#### 3. コンポーネント作成

- ❌ 禁止: `React.FC`（非推奨）
- ❌ コンポーネントでは原則禁止: `export default`
- ✅ 推奨: `export function ComponentName() {}`（名前付きエクスポート）
- ✅ 例外: App Router の Page/Layout/Error/Loading/Route等は `export default` 必須（Next.js仕様）

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

## 🚨 絶対遵守ルール（8項目）

### 開発ワークフロー

```bash
# AI（Claude Code）の責務
npm run typecheck   # 型エラーチェック（コード変更後）
npm run lint        # コード品質チェック（コミット前のみ）

# ユーザーの責務
npm run dev         # 開発サーバー起動・停止
```

### 遵守項目

1. **型チェック（AI必須）**: コード変更後に `npm run typecheck` を実行
   - **対象**: Claude Code（AI）が自動実行
   - **タイミング**: コンポーネント・hooks・ユーティリティ等の実装後
   - **目的**: 型エラーの早期検出
   - **注意**: エラーがある場合は必ず修正してからユーザーに報告

2. **コミット前（必須）**: `npm run lint` 必須実行（3.6秒で完了）
   - pre-commitフックで自動実行されるため、手動実行は不要
   - ただし、エディタ統合（ESLint extension）推奨

3. **開発サーバー管理（ユーザー責務）**: AIは開発サーバーを起動・停止しない
   - **理由**:
     - ユーザーが既に起動している可能性が高い
     - 複数サーバー起動によるリソース無駄・ポート競合を防止
     - ユーザーの確認環境（localhost:3000）と一致
   - **AIの対応**:
     - コード変更後: 「localhost:3000 で動作を確認してください」と依頼
     - サーバー未起動の場合: 「npm run dev で開発サーバーを起動してください」と依頼

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

9. **リリース作業**: [`docs/releases/RELEASE_CHECKLIST.md`](docs/releases/RELEASE_CHECKLIST.md) を必ず参照
   - **リリース作業開始前に必ずこのファイルを開く**（例外なし）
   - 既存バージョンの重複チェック（Phase 0.1）を最優先で実施
   - 重複が見つかった場合、必ず「v0.X.0じゃないですか？」と確認
   - package.json 更新はPRマージ前（Phase 0.3）に実施
   - Full Changelog リンクは必須

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
- **ESLint公式準拠**: [`docs/development/ESLINT_HYBRID_APPROACH.md`](docs/development/ESLINT_HYBRID_APPROACH.md)
- **デザインシステム**: [`docs/design-system/THEME_MIGRATION.md`](docs/design-system/THEME_MIGRATION.md)

### 開発ワークフロー

- **コマンド一覧**: [`docs/development/COMMANDS.md`](docs/development/COMMANDS.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)
- **Issueラベル付けルール**: [`docs/development/ISSUE_LABELING_RULES.md`](docs/development/ISSUE_LABELING_RULES.md)
- **PRラベル付けルール**: [`docs/development/PR_LABELING_RULES.md`](docs/development/PR_LABELING_RULES.md)
- **セッション管理**: [`docs/development/CLAUDE_SESSION_MANAGEMENT.md`](docs/development/CLAUDE_SESSION_MANAGEMENT.md)
- **Claude 4ベストプラクティス**: [`docs/development/CLAUDE_4_BEST_PRACTICES.md`](docs/development/CLAUDE_4_BEST_PRACTICES.md)

### 🚀 リリース管理（⚠️ 必読）

**AIがリリース作業を行う際は、必ず以下の順序でドキュメントを確認すること**：

1. **[`docs/releases/RELEASE_CHECKLIST.md`](docs/releases/RELEASE_CHECKLIST.md)** - 【最優先】実作業チェックリスト
   - リリース作業を行う前に**必ず**このファイルを開く
   - 上から順番に全ての項目を確認
   - 既存バージョンの重複チェック（Phase 0.1）が最重要
   - package.json 更新はPRマージ前（Phase 0.3）
2. **[`docs/releases/README.md`](docs/releases/README.md)** - リリース管理の全体像
3. **[`docs/releases/RELEASE_PROCESS.md`](docs/releases/RELEASE_PROCESS.md)** - 詳細説明と背景情報
4. **[`docs/releases/template.md`](docs/releases/template.md)** - リリースノートテンプレート

**⚠️ 重要な注意事項**:

- 既存のリリースバージョンを上書きしない（Phase 0.1で確認必須）
- バージョン番号が既に存在する場合、必ず「v0.X.0じゃないですか？」と確認
- package.json 更新を忘れない（PRマージ前に実施）
- Full Changelog リンクを必ず含める

### システム管理

- **Sentry統合**: [`docs/integrations/SENTRY.md`](docs/integrations/SENTRY.md)
- **エラーハンドリング**: [`docs/architecture/ERROR_HANDLING.md`](docs/architecture/ERROR_HANDLING.md)

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

## 📝 変更履歴

### v11.2（2025-12-24）- Claude 4ベストプラクティス統合

**変更内容**:

- ✅ Claude 4プロンプトエンジニアリングベストプラクティスを追加
  - 新規作成: `docs/development/CLAUDE_4_BEST_PRACTICES.md`
  - 公式ドキュメントへの参照を「レベル1：公式ドキュメント」に追加
- ✅ AIの行動規範に「ベストプラクティスに基づく行動規範」セクション追加
  - 曖昧な指示への対応テンプレート
  - ベストプラクティス違反の検出と報告
  - 開発者への質問を促すケース
- ✅ 開発ワークフローセクションにドキュメント参照を追加

**理由**:

- Claude 4モデルは「指示を文字通りに実行する」特性があり、明確な指示が必要
- 開発者とAIの双方向コミュニケーション改善
- ベストプラクティスに沿わない場合の自動検出と提案

**効果**: 開発者とClaude Code間のコミュニケーション品質向上

---

### v11.1（2025-11-12）- リリース管理の必須化

**変更内容**:

- ✅ 絶対遵守ルールに「リリース作業」を追加（ルール9）
  - リリース作業前に `docs/releases/RELEASE_CHECKLIST.md` を必ず参照
  - 既存バージョンの重複チェックを最優先化
  - package.json 更新タイミングの明確化（PRマージ前）
- ✅ 詳細ドキュメント参照先に「リリース管理」セクション追加
  - RELEASE_CHECKLIST.md を最優先ドキュメントとして位置付け
  - AIの行動規範を明確化（重複時は必ず確認）

**理由**:

- v0.4.0 リリース時の重大ミス（v0.3.0重複）を防止
- AIがリリースドキュメントを参照する明確なトリガーが必要
- 「既存があったのに v0.3.0 で更新するのはありえないミス」の再発防止

**効果**: AIによるリリース作業の確実性向上

---

### v11.0（2025-10-30）- 開発サーバー管理の抜本的見直し

**変更内容**:

- ✅ 開発サーバー管理をユーザー責務に変更
  - AIは開発サーバーを起動・停止しない
  - AIは `npm run typecheck` でエラーチェックのみ実施
- ✅ ポート番号ルール（PORT=4000等）を完全削除
- ✅ 開発ワークフローの簡素化
  - AI責務: `npm run typecheck`, `npm run lint`（コミット前のみ）
  - ユーザー責務: `npm run dev`（開発サーバー）

**理由**:

- 複数サーバー起動によるリソース無駄・ポート競合を防止
- ユーザーの確認環境（localhost:3000）と一致
- 役割分担の明確化

**効果**: シンプルで混乱のない開発フロー

### v10.1（2025-10-22）- Phase 1 + Phase 3 完了

**Phase 1（緊急修正）**:

- ✅ リンク切れ修正（`.claude/code-standards.md` 削除、`docs/THEME_ENFORCEMENT.md` → `docs/design-system/THEME_MIGRATION.md`）
- ✅ export default ルール修正（App Router の例外を明記）
- ✅ 絵文字使用方針の統一（ドキュメント: 使用可、コード: 禁止）

**Phase 2（一貫性向上）**:

- ❌ 取り消し（CLAUDE.md の基本思想「公式ベストプラクティスの厳格な遵守」と矛盾）

**Phase 3（構造改善）**:

- ✅ Single Source of Truth の徹底
  - 新規作成: `docs/design-system/STYLE_GUIDE.md`（8pxグリッド、カラー、タイポグラフィを集約）
  - CLAUDE.md から STYLE_GUIDE.md への参照追加
- ✅ 頻出パターン集の追加
  - `src/CLAUDE.md` に Server Component/Client Component/i18n/フォーム/レスポンシブのコード例を追加
- ✅ バージョン履歴の追加（本セクション）

**効果**: ドキュメント評価 65点 → 85点

### v10.0（2025-10-21）

- AIによる test:watch 自動起動を必須化

### v9.3 以前

- Issue管理の柔軟な運用を明記
- コミット規約・Issue管理ルールの整備

---

**📖 最終更新**: 2025-12-24 | **バージョン**: v11.2
