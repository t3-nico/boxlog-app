# CLAUDE.md - BoxLog App 開発指針

## 🗣️ 基本設定
**コミュニケーション言語**: 日本語

## 🚨 絶対遵守ルール（5項目）
1. **コミット前**: `npm run lint` 必須実行（3.6秒で完了）
2. **スタイリング**: `/src/config/theme` のみ使用（直接指定禁止）
3. **Issue管理**: すべての作業をIssue化（例外なし）
4. **TypeScript厳格**: `any` 型禁止
5. **Next.js公式準拠**: Next.js 14公式のベストプラクティスに従う（詳細は後述）

## 📚 詳細ドキュメント参照先

### コア情報
- **プロジェクト概要**: [`docs/README.md`](docs/README.md)
- **技術スタック詳細**: [`docs/TECH_STACK.md`](docs/TECH_STACK.md)

### 開発ガイドライン
- **ESLint公式準拠**: [`docs/ESLINT_HYBRID_APPROACH.md`](docs/ESLINT_HYBRID_APPROACH.md) 🆕
- **AI品質基準（公式準拠版）**: [`.claude/code-standards.md`](.claude/code-standards.md) 🆕
- **デザインシステム**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md)
- **レスポンシブデザイン**: [`src/CLAUDE.md`](src/CLAUDE.md)

### 開発ワークフロー
- **コミット規約**: [`docs/development/COMMIT_RULES.md`](docs/development/COMMIT_RULES.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)
- **セッション管理**: [`docs/development/SESSION_MANAGEMENT.md`](docs/development/SESSION_MANAGEMENT.md)

### システム管理
- **1Password設定**: [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md)
- **Breaking Changes**: [`docs/BREAKING_CHANGES.md`](docs/BREAKING_CHANGES.md)
- **Sentry統合**: [`docs/integrations/SENTRY.md`](docs/integrations/SENTRY.md)

## 🚀 基本コマンド（頻出5個）
```bash
npm run smart:dev           # 開発サーバー起動
npm run lint                # コード品質チェック
npm run typecheck           # 型チェック
npm run 1password:auth      # 認証確認
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
**📖 最終更新**: 2025-09-30 | **バージョン**: v8.0 - Next.js 14完全準拠