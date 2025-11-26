# Release v0.5.0

**リリース日**: 2025-11-26
**バージョン**: 0.5.0

## 🎯 概要

このリリースでは、カレンダー機能の大幅な改善（Event→Plan大規模リファクタリング）、統計ページの強化、Inbox機能の拡張、デザインシステムの抜本的見直し（カラーシステム統一）を実施しました。特に、Event→Planへの命名統一により、コードベース全体の一貫性が大幅に向上しています。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **統計ページの改善** ([#710](https://github.com/t3-nico/boxlog-app/pull/710))
  - レイアウト改善とツールバー機能追加
  - ユーザビリティ向上

- **Inbox機能の強化** ([#698](https://github.com/t3-nico/boxlog-app/pull/698), [#697](https://github.com/t3-nico/boxlog-app/pull/697))
  - Board/Tableフィルター機能の実装
  - Board列設定の実装
  - タグ表示とUI改善（Notion風日時セル）
  - セクション分けと画面外対策

- **カレンダー機能の改善** ([#700](https://github.com/t3-nico/boxlog-app/pull/700), [#699](https://github.com/t3-nico/boxlog-app/pull/699))
  - カレンダーUI調整
  - チケット機能拡張

- **Ticket×Tags完全統合** ([#694](https://github.com/t3-nico/boxlog-app/pull/694))
  - UI/UX改善
  - カラーパレット統一

### 🔄 変更 (Changed)

- **Event→Plan大規模リファクタリング** ([#704](https://github.com/t3-nico/boxlog-app/pull/704))
  - カレンダーの命名を統一（event→plan）
  - 型定義の一貫性向上
  - コードベース全体の可読性改善
  - EventPosition → PlanPosition型に統一

- **カラーシステムの抜本的改善** ([#712](https://github.com/t3-nico/boxlog-app/pull/712), [#711](https://github.com/t3-nico/boxlog-app/pull/711), [#714](https://github.com/t3-nico/boxlog-app/pull/714))
  - セマンティックトークンの適用
  - ハイブリッド構造への変更
  - UIの一貫性向上
  - テーマシステムの最適化

- **Toast通知システムの統一** ([#713](https://github.com/t3-nico/boxlog-app/pull/713))
  - sonner（shadcn/ui公式推奨）への統一
  - ユーザー体験の向上

- **コード品質改善** ([#709](https://github.com/t3-nico/boxlog-app/pull/709))
  - any型削除
  - CLAUDE.md準拠
  - TypeScript厳格化

### 🐛 バグ修正 (Fixed)

- **カレンダードラッグ&ドロップの修正**
  - 楽観的更新の修正
  - スクロール座標計算の改善（累積スクロール量対応）
  - 15分単位のスナップ改善
  - plan undefined防御の追加
  - 自動スクロール中のドラッグ座標計算修正

- **型エラー修正** ([#707](https://github.com/t3-nico/boxlog-app/pull/707))
  - usePerformanceMonitor.tsの型エラー修正

- **カレンダー表示バグ修正**
  - DayViewのプランカード表示バグ修正
  - props名統一（3Day/5Day/WeekView）
  - onTimeRangeSelect型不一致の修正

### 📚 ドキュメント (Documentation)

- **ドキュメント整合性改善** ([#706](https://github.com/t3-nico/boxlog-app/pull/706), [#703](https://github.com/t3-nico/boxlog-app/pull/703))
  - README.md最新化
  - CLAUDE.mdドキュメント改善
  - プロジェクト構造の可視化向上

- **リリースプロセス改善** ([#692](https://github.com/t3-nico/boxlog-app/pull/692))
  - リリースフロー自動化準備
  - RELEASE_CHECKLIST.md追加

---

## 🔗 関連リンク

### Pull Requests（主要）

- [#714](https://github.com/t3-nico/boxlog-app/pull/714) - fix(ui): セマンティックトークンの適用とUIの一貫性向上
- [#713](https://github.com/t3-nico/boxlog-app/pull/713) - refactor(toast): sonner(shadcn/ui公式推奨)に統一
- [#712](https://github.com/t3-nico/boxlog-app/pull/712) - refactor(styles): カラーシステムの統一とセマンティックトークン適用
- [#711](https://github.com/t3-nico/boxlog-app/pull/711) - refactor(styles): カラーシステムをハイブリッド構造に変更
- [#710](https://github.com/t3-nico/boxlog-app/pull/710) - feat(stats): 統計ページのレイアウト改善とツールバー機能追加
- [#709](https://github.com/t3-nico/boxlog-app/pull/709) - refactor: コード構造改善 - any型削除とCLAUDE.md準拠
- [#707](https://github.com/t3-nico/boxlog-app/pull/707) - fix(#389): usePerformanceMonitor.tsの型エラーを修正
- [#706](https://github.com/t3-nico/boxlog-app/pull/706) - docs: README.mdの整合性改善と最新化
- [#704](https://github.com/t3-nico/boxlog-app/pull/704) - refactor(calendar): Event→Plan大規模リファクタリング完了
- [#703](https://github.com/t3-nico/boxlog-app/pull/703) - Write a CLAUDE.md
- [#700](https://github.com/t3-nico/boxlog-app/pull/700) - feat(calendar): カレンダー機能の改善とUI調整
- [#699](https://github.com/t3-nico/boxlog-app/pull/699) - feat(calendar): カレンダー改善とチケット機能拡張
- [#698](https://github.com/t3-nico/boxlog-app/pull/698) - feat(inbox): Board/Tableフィルター機能とBoard列設定の実装
- [#697](https://github.com/t3-nico/boxlog-app/pull/697) - feat(inbox): Inboxタグ表示とUI改善 - セクション分け、画面外対策、Notion風日時セル
- [#694](https://github.com/t3-nico/boxlog-app/pull/694) - feat(tickets): Ticket×Tags完全統合 - UI/UX改善とカラーパレット統一
- [#692](https://github.com/t3-nico/boxlog-app/pull/692) - docs: リリースプロセス抜本改善 + CLAUDE.md更新 (v0.4.0準備)

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.4.0...v0.5.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
