# BoxLog App - メインドキュメント

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

## 📚 ドキュメント構成

### 🔧 [セットアップ・設定](./setup/)

**開発環境構築・外部サービス連携**

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

### 🏗️ [ビジネスルール辞書システム](./BUSINESS_RULES_GUIDE.md)

**技術的失敗を防ぐ自動化システム（Issue #338完全実現）**

- [完全ガイド](./BUSINESS_RULES_GUIDE.md) - 使用方法・高度設定・トラブルシューティング
- **実現済み機能**: バリデーション・権限・ワークフロー・制約の全自動化
- **パフォーマンス**: 0.11ms/回の高速実行
- **品質保証**: 93%テスト通過率・企業級品質システム
- [Bundle監視システム](./performance/BUNDLE_MONITORING.md) - 99.5%サイズ削減達成
- [アクセシビリティ](./performance/ACCESSIBILITY_TESTING_GUIDE.md) - WCAG準拠テスト

### 🏗️ [機能実装](./features/)

**機能開発・UI改善・システム実装**

- [自動保存システム](./features/AUTO_SAVE_SYSTEM.md) - データ保存最適化
- [プログレッシブ開示](./features/PROGRESSIVE_DISCLOSURE_IMPLEMENTATION.md) - UI段階表示
- [設定レイアウト](./features/SETTINGS_LAYOUT_IMPLEMENTATION.md) - 設定画面最適化

### 🌱 [テストデータ管理](../seeds/)

**開発・テスト環境データ管理システム（Issue #351実装完了）**

- [シードシステム](../seeds/README.md) - 環境別テストデータ自動生成
- **利用可能コマンド**: `seed:dev`, `seed:test`, `seed:staging`, `seed:minimal`, `seed:quick`
- **対応データ**: ユーザー・タスク・プロジェクト（TypeScript型安全）
- **実装パターン**: ファクトリーパターン・環境別設定・関係性管理

### 🛠️ [開発履歴・作業記録](./features/)

**開発作業・変更履歴・改善提案**

- [コードクリーンアップ](./features/CLEANUP_BATCHES.md) - 未使用変数削除戦略
- [レイアウト変更履歴](./features/LAYOUT_CHANGES.md) - UI構造変更記録
- [Claude Code改善提案](./features/claude-code-improvement-proposals.md) - 開発体験向上

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
# 1. 推奨: 開発効率化
docs/setup/CURSOR_SETUP.md

# 2. 開発ルール理解
docs/design-system/THEME_ENFORCEMENT.md
docs/performance/ESLINT_SETUP_COMPLETE.md
```

### 機能開発者向け

```bash
# UI実装時
docs/design-system/          # デザイン統一
docs/features/               # 実装パターン
docs/performance/            # 品質・最適化

# テストデータ管理
seeds/                       # テストデータ生成システム
npm run seed:dev             # 開発用データ
npm run seed:quick           # デバッグ用データ

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
- **開発支援**: テストデータシード管理（環境別自動生成）

## 📖 ドキュメント利用ガイド

### 目的別ナビゲーション

| 目的         | 参照ディレクトリ                     | 重要度  |
| ------------ | ------------------------------------ | ------- |
| **環境構築** | [`setup/`](./setup/)                 | 🔴 必須 |
| **UI実装**   | [`design-system/`](./design-system/) | 🔴 必須 |
| **テストデータ** | [`../seeds/`](../seeds/)           | 🟡 重要 |
| **品質管理** | [`performance/`](./performance/)     | 🟡 重要 |
| **機能開発** | [`features/`](./features/)           | 🟡 重要 |
| **履歴参考** | [`development/`](./features/)        | 🟢 参考 |

### コロケーション原則

機能固有のドキュメントは各機能ディレクトリ内に配置：

- **カレンダー**: `/src/features/calendar/__docs__/`
- **設定**: `/src/features/settings/README.md`
- **テーマ**: `/src/config/theme/README.md`
- **ESLint**: `/.eslint/README.md`
- **テストデータ**: `/seeds/README.md`

---

**最終更新**: 2025-09-29
**管理**: BoxLog 開発チーム
**バージョン**: v2.1 - テストデータシード管理システム追加（Issue #351完了）
