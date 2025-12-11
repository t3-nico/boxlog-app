# BoxLog App - メインドキュメント

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

## 📚 ドキュメント構成

### 🔧 [セットアップ・設定](./setup/)

**開発環境構築・外部サービス連携**

- [Cursor AI統合](./setup/CURSOR_SETUP.md) - 開発ツール設定（推奨）
- [CI/CD設定](./setup/CI_CD_SETUP.md) - 自動化パイプライン
- [Vercelデプロイ](./setup/VERCEL_SETUP.md) - 本番環境設定

### 🏗️ [アーキテクチャ・設計](./architecture/)

**システム設計・エラーハンドリング・API設計**

- [エラーハンドリング](./architecture/ERROR_HANDLING.md) - 統一エラーシステム
- [エラーバウンダリー](./architecture/ERROR_BOUNDARY_SYSTEM.md) - エラー境界設計
- [エラーパターン](./architecture/ERROR_PATTERNS_GUIDE.md) - エラーコード体系
- [APIバリデーション](./architecture/API_VALIDATION_GUIDE.md) - API検証ガイド

### 🎨 [デザインシステム](./design-system/)

**UI統一・テーマ管理・視覚設計**

- [デザインシステム概要](./design-system/README.md) - デザインシステム全体像
- [テーマ移行ガイド](./design-system/THEME_MIGRATION.md) - 既存コード移行手順
- [スタイルガイド](./design-system/STYLE_GUIDE.md) - 8pxグリッド・カラー・タイポグラフィ

### ⚡ [開発ガイドライン](./development/)

**開発ワークフロー・品質管理・コミット規約**

- [ESLintハイブリッド](./development/ESLINT_HYBRID_APPROACH.md) - 公式準拠ESLint設定
- [品質システム](./development/QUALITY_SYSTEM_README.md) - コード品質管理
- [PRテンプレート](./development/PR_TEMPLATE.md) - プルリクエスト作成指針
- [Issue管理](./development/ISSUE_MANAGEMENT.md) - Issue運用ルール
- [セッション管理](./development/CLAUDE_SESSION_MANAGEMENT.md) - 開発セッション記録
- [コマンド一覧](./development/COMMANDS.md) - 利用可能コマンド

### 🔌 [統合・外部連携](./integrations/)

**外部サービス統合**

- [Sentry統合](./integrations/SENTRY.md) - エラー監視システム

### ⚡ [パフォーマンス](./performance/)

**最適化・アクセシビリティ**

- [Bundle監視](./performance/BUNDLE_MONITORING.md) - バンドルサイズ最適化

### 🏗️ [機能実装](./features/)

**機能開発・UI改善・システム実装**

- [プログレッシブ開示](./features/PROGRESSIVE_DISCLOSURE_IMPLEMENTATION.md) - UI段階表示
- [機能実装概要](./features/README.md) - 実装済み機能一覧

### 📊 [アーカイブ](./archive/)

**完了した実装・将来計画・履歴**

- [将来改善・ノート](./archive/FUTURE_IMPROVEMENTS_AND_NOTES.md) - 改善計画・アイデア
- [完了レポート](./archive/completed/) - 過去の実装記録

## 🚀 クイックスタート

### 新規開発者向け

1. **環境構築**: [`setup/`](./setup/) - 開発環境セットアップ
2. **開発ルール**: [`development/`](./development/) - コミット・品質管理
3. **デザイン統一**: [`design-system/`](./design-system/) - UI実装ルール

### 機能開発者向け

1. **アーキテクチャ理解**: [`architecture/`](./architecture/) - システム設計
2. **UI実装**: [`design-system/`](./design-system/) - デザインシステム
3. **品質管理**: [`development/`](./development/) - ESLint・テスト

## 🎯 技術スタック概要

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **データベース**: Supabase (PostgreSQL)
- **UIライブラリ**: shadcn/ui, kiboUI
- **スタイリング**: Tailwind CSS v4 + 8pxグリッド
- **品質管理**: ESLint（96%完成）, Vitest（80%カバレッジ）
- **パフォーマンス**: Bundle最適化（99.5%削減達成）
- **開発支援**: テストデータシード管理（環境別自動生成）

## 📖 ドキュメント利用ガイド

### 目的別ナビゲーション

| 目的             | 参照ディレクトリ                     | 重要度  |
| ---------------- | ------------------------------------ | ------- |
| **環境構築**     | [`setup/`](./setup/)                 | 🔴 必須 |
| **UI実装**       | [`design-system/`](./design-system/) | 🔴 必須 |
| **品質管理**     | [`performance/`](./performance/)     | 🟡 重要 |
| **機能開発**     | [`features/`](./features/)           | 🟡 重要 |
| **履歴参考**     | [`development/`](./features/)        | 🟢 参考 |

### コロケーション原則

機能固有のドキュメントは各機能ディレクトリ内に配置：

- **カレンダー**: `/src/features/calendar/__docs__/`
- **設定**: `/src/features/settings/README.md`
- **テーマ**: `/src/config/ui/README.md`
- **ESLint**: `/.eslint/README.md`

---

**最終更新**: 2025-10-06
**管理**: BoxLog 開発チーム
**バージョン**: v3.0 - ドキュメント構造整理完了（Issue #442）
