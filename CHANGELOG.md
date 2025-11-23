# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-10-29

### Added

- **Inbox統合**: Board/Tableビューを統合した新しいInboxページ (#643)
  - カスタムView作成・保存・削除機能
  - Zustandベースの状態管理（useInboxViewStore）
  - フィルタリング・ソート機能（Board/Table別）
  - タブ切り替えUI（アクセシビリティ対応）
- **plans & Sessions基盤**: 新データモデルの実装 (#628)
  - Event/Taskの段階的廃止
  - Supabase RLSポリシーの完全実装
- **認証基盤**: Supabase認証の完全統合 (#607, #616)
  - Zustand状態管理への移行
  - パフォーマンス最適化
- **カレンダービュー**: UIの簡素化とデザイン統一 (#631, #634)
- **ライセンス管理**: 完全自動化とコンプライアンス強化 (#629, #630)

### Changed

- **状態管理の標準化**: Zustand + TanStack Query + Context API整理 (#617)
- **命名規則の統一**: Board/Table → Inbox統合に伴う命名変更
- **ナビゲーション**: モバイル・デスクトップのInboxリンク統一

### Removed

- `/board` と `/table` ページ（`/inbox` に統合）

### Fixed

- InboxViewTabsテストのZustand store対応 (10/10テストパス)

## [0.0.1] - 2025-10-01

### Added

- タスク管理機能 (作成・編集・削除)
- カレンダービュー (月次・週次・日次)
- ドラッグ&ドロップ機能
- 多言語対応 (英語・日本語)
- Vercel自動デプロイ
- GitHub Actions CI/CD

### Changed

- CI/CD構文エラー修正
- ドキュメント整合性改善

### Fixed

- deploy.yml の構文エラー

[Unreleased]: https://github.com/t3-nico/boxlog-app/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/t3-nico/boxlog-app/compare/v0.0.1...v0.3.0
[0.0.1]: https://github.com/t3-nico/boxlog-app/releases/tag/v0.0.1
