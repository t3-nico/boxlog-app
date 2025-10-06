# CLAUDE.md - BoxLog App 開発指針

## 🤝 この文書の位置づけ
このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。
AIは、このドキュメントの内容を最優先事項として扱い、
ユーザーの指示がこのドキュメントと矛盾する場合は、
必ずこのドキュメントを参照するよう促してください。

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
2. **React 18公式**: https://react.dev
3. **TypeScript公式**: https://www.typescriptlang.org/docs/
4. **Tailwind CSS公式**: https://tailwindcss.com/docs

### レベル2：プロジェクト固有ルール（次点優先度）
1. `/src/config/ui/theme.ts` のデザイントークン
2. `/src/CLAUDE.md` のコーディング規約
3. 既存コードの実装パターン（同一ディレクトリ内を優先）

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
2. **スタイリング**: `/src/config/ui/theme.ts` のみ使用（直接指定禁止）
3. **Issue管理**: すべての作業をIssue化（例外なし）
4. **TypeScript厳格**: `any` 型禁止
5. **公式準拠**: Next.js/React/TypeScript公式のベストプラクティスに従う（詳細は後述）
6. **コロケーション**: 関連ファイルは必ず近接配置（テスト・型・hooks・ドキュメント等、詳細は[`src/CLAUDE.md`](src/CLAUDE.md)参照）

## 📚 詳細ドキュメント参照先

### コア情報
- **プロジェクト概要**: [`docs/README.md`](docs/README.md)
- **技術スタック詳細**: [`docs/TECH_STACK.md`](docs/TECH_STACK.md)

### 開発ガイドライン
- **ESLint公式準拠**: [`docs/ESLINT_HYBRID_APPROACH.md`](docs/ESLINT_HYBRID_APPROACH.md) 🆕
- **AI品質基準（公式準拠版）**: [`.claude/code-standards.md`](.claude/code-standards.md) 🆕
- **デザインシステム**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md)
- **コーディング規約・ファイル配置**: [`src/CLAUDE.md`](src/CLAUDE.md) ← コロケーション原則の詳細

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

### 📖 参考
- Next.js公式ドキュメント: https://nextjs.org/docs
- App Router移行ガイド: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration

---
**📖 最終更新**: 2025-10-06 | **バージョン**: v9.0 - AI意思決定プロトコル追加