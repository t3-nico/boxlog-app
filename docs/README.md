# BoxLog App - メインドキュメント

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

## 📚 ドキュメント構成

### 🔧 [セットアップ・設定](./setup/)

**開発環境構築・外部サービス連携**

- [1Password連携](./setup/1PASSWORD_SETUP.md) - セキュリティ設定（必須）
- [Cursor AI統合](./setup/CURSOR_SETUP.md) - 開発ツール設定（推奨）
- [CI/CD設定](./setup/CI_CD_SETUP.md) - 自動化パイプライン
- [Vercelデプロイ](./setup/VERCEL_SETUP.md) - 本番環境設定

### 🎨 [デザインシステム](./design-system/)

**UI統一・テーマ管理・視覚設計**

- [テーマ強制システム](./design-system/THEME_ENFORCEMENT.md) - 統一スタイリング（メイン）
- [テーマ移行ガイド](./design-system/THEME_MIGRATION.md) - 既存コード移行手順
- [タイポグラフィ](./design-system/TYPOGRAPHY_ADJUSTMENTS.md) - 文字体系統一
- [アイコン・スペーシング](./design-system/ICONS_AND_SPACING_CHANGES.md) - 8pxグリッド
- [ESLintテーマ強制](./design-system/ESLINT_THEME_ENFORCEMENT.md) - 自動品質管理

### ⚡ [パフォーマンス・品質](./performance/)

**最適化・コード品質・アクセシビリティ**

- [ESLint企業級設定](./performance/ESLINT_SETUP_COMPLETE.md) - 96%完成（Google・Meta基準）
- [Bundle監視システム](./performance/BUNDLE_MONITORING.md) - 99.5%サイズ削減達成
- [アクセシビリティ](./performance/ACCESSIBILITY_TESTING_GUIDE.md) - WCAG準拠テスト

### 🏗️ [機能実装](./features/)

**機能開発・UI改善・システム実装**

- [自動保存システム](./features/AUTO_SAVE_SYSTEM.md) - データ保存最適化
- [プログレッシブ開示](./features/PROGRESSIVE_DISCLOSURE_IMPLEMENTATION.md) - UI段階表示
- [設定レイアウト](./features/SETTINGS_LAYOUT_IMPLEMENTATION.md) - 設定画面最適化

### 🛠️ [開発履歴・作業記録](./development/)

**開発作業・変更履歴・改善提案**

- [コードクリーンアップ](./development/CLEANUP_BATCHES.md) - 未使用変数削除戦略
- [レイアウト変更履歴](./development/LAYOUT_CHANGES.md) - UI構造変更記録
- [Claude Code改善提案](./development/claude-code-improvement-proposals.md) - 開発体験向上

### 📊 [レポート・データ](./reports/)

**分析結果・検証レポート・進捗管理**

- [データベース検証](./database-verification-report.md) - DB整合性確認
- [TODO レポート](./TODO_REPORT.md) - 作業進捗管理

### 📋 プロジェクト管理

- [PR テンプレート](./PR_TEMPLATE.md) - プルリクエスト作成指針
- [将来改善・ノート](./FUTURE_IMPROVEMENTS_AND_NOTES.md) - 改善計画

## 🚀 クイックスタート

### 新規開発者向け

```bash
# 1. 必須: セキュリティ設定
docs/setup/1PASSWORD_SETUP.md

# 2. 推奨: 開発効率化
docs/setup/CURSOR_SETUP.md

# 3. 開発ルール理解
docs/design-system/THEME_ENFORCEMENT.md
docs/performance/ESLINT_SETUP_COMPLETE.md
```

### 機能開発者向け

```bash
# UI実装時
docs/design-system/          # デザイン統一
docs/features/               # 実装パターン
docs/performance/            # 品質・最適化

# 継続的改善
docs/development/            # 作業履歴参考
docs/reports/                # 現状分析
```

## 🎯 技術スタック概要

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **データベース**: Supabase (PostgreSQL)
- **UIライブラリ**: shadcn/ui, kiboUI
- **スタイリング**: Tailwind CSS v4 + 8pxグリッド
- **品質管理**: ESLint（96%完成）, Vitest（80%カバレッジ）
- **パフォーマンス**: Bundle最適化（99.5%削減達成）

## 📖 ドキュメント利用ガイド

### 目的別ナビゲーション

| 目的         | 参照ディレクトリ                     | 重要度  |
| ------------ | ------------------------------------ | ------- |
| **環境構築** | [`setup/`](./setup/)                 | 🔴 必須 |
| **UI実装**   | [`design-system/`](./design-system/) | 🔴 必須 |
| **品質管理** | [`performance/`](./performance/)     | 🟡 重要 |
| **機能開発** | [`features/`](./features/)           | 🟡 重要 |
| **履歴参考** | [`development/`](./development/)     | 🟢 参考 |

### コロケーション原則

機能固有のドキュメントは各機能ディレクトリ内に配置：

- **カレンダー**: `/src/features/calendar/__docs__/`
- **設定**: `/src/features/settings/README.md`
- **テーマ**: `/src/config/theme/README.md`
- **ESLint**: `/.eslint/README.md`

---

**最終更新**: 2025-09-22
**管理**: BoxLog 開発チーム
**バージョン**: v2.0 - サブディレクトリ化・README統合版
