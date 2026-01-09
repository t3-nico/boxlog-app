# Release v0.12.0

**リリース日**: 2025-01-09
**バージョン**: 0.12.0

## 概要

ステータス管理の簡略化、Settings/Tags UIの大幅刷新、通知設定のリアルタイム連携、アクセシビリティ改善を含む大規模アップデート。

---

## 変更内容

### 新機能 (Added)

- **ステータス簡略化** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - 3段階(todo/doing/done)から2段階(open/done)に簡略化
  - よりシンプルで直感的なタスク管理

- **通知設定のリアルタイム連携** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - ブラウザ通知とRealtimeの統合
  - 通知配信設定のマイグレーション追加

- **カレンダー機能強化** ([#850](https://github.com/t3-nico/boxlog-app/pull/850))
  - 繰り返しプラン対応
  - スタイル統一

### 変更 (Changed)

- **Settings UI刷新** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - ChatGPT/Notion風のモダンなデザイン
  - SettingRowパターンによる統一的なレイアウト
  - 余白を24pxに拡大し読みやすさ向上

- **Tags管理UI変更** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - サイドバーを削除しInbox風の単一カラムレイアウトに
  - Inspector経由でのタグ作成に統一

- **アカウントメニュー改善** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - UX改善とレイアウト統一

- **コード整理** ([#851](https://github.com/t3-nico/boxlog-app/pull/851))
  - 開発環境カスタマイズ
  - 不要コンポーネント削除

### 修正 (Fixed)

- **アクセシビリティ改善** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - WCAG準拠の見出し構造
  - aria-describedby追加
  - TimeGridにrole="grid"追加
  - DayColumnにrole="gridcell"追加
  - Spinnerにaria-live追加

- **i18n対応** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - ハードコードされた日本語文字列の国際化

### 削除 (Removed)

- **未使用コンポーネント削除** ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
  - Kanbanコンポーネント
  - 未使用UIコンポーネント

---

## 関連リンク

### Pull Requests

- [#852](https://github.com/t3-nico/boxlog-app/pull/852) - feat: Status簡略化、Settings/Tags UI刷新、通知設定
- [#851](https://github.com/t3-nico/boxlog-app/pull/851) - chore: コード整理 & 開発環境カスタマイズ
- [#850](https://github.com/t3-nico/boxlog-app/pull/850) - feat: カレンダー機能強化・スタイル統一・繰り返しプラン対応

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.11.0...v0.12.0

**Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>**
