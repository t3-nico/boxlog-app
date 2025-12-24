# Release v0.10.0

**リリース日**: 2025-12-24
**バージョン**: 0.10.0

## 🎯 概要

モバイルレスポンシブ対応の大幅改善。TableNavigationのPC/モバイル対応、Inspectorのボトムシート対応、8pxグリッドシステムに基づくアイコンサイズ統一を実現。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **TableNavigationレスポンシブ対応** ([#831](https://github.com/t3-nico/boxlog-app/pull/831), [#832](https://github.com/t3-nico/boxlog-app/pull/832))
  - PCではPopover、モバイルではDrawer (Vaul) を使用
  - 検索・フィルター・ソート・設定の4機能を統合
  - フィルター数バッジ表示対応

- **Inspectorボトムシート対応** ([#832](https://github.com/t3-nico/boxlog-app/pull/832))
  - モバイルでDrawerベースのボトムシート表示
  - PCでは従来のサイドパネル表示を維持

- **タグ機能の改善** ([#830](https://github.com/t3-nico/boxlog-app/pull/830))
  - タグページのUI改善

### 🔄 変更 (Changed)

- **Drawerデザイン改善** ([#831](https://github.com/t3-nico/boxlog-app/pull/831))
  - 48pxタッチターゲットのドラッグハンドル
  - rounded-2xlでモダンなデザイン
  - 閉じるボタンアイコン20px統一

- **アイコンサイズ統一（8pxグリッド準拠）** ([#831](https://github.com/t3-nico/boxlog-app/pull/831), [#832](https://github.com/t3-nico/boxlog-app/pull/832))
  - HeaderActions: 24px
  - MobileMenuButton: 24px
  - PageHeader AIボタン: 20px

- **コンポーネント整理** ([#831](https://github.com/t3-nico/boxlog-app/pull/831), [#832](https://github.com/t3-nico/boxlog-app/pull/832))
  - InboxBoardToolbar削除 → TableNavigationに統合
  - InboxFilterContent / InboxBoardFilterContent 新規作成
  - TagsSettingsContent 新規作成

- **モバイルスクロールバー非表示** ([#831](https://github.com/t3-nico/boxlog-app/pull/831))
  - `@media (hover: none) and (pointer: coarse)` でタッチデバイス判定

- **ボタンデザインシステムの統一** ([#825](https://github.com/t3-nico/boxlog-app/pull/825))
  - UIコンポーネントの整理

### 🔧 メンテナンス (Maintenance)

- **依存関係更新** ([#828](https://github.com/t3-nico/boxlog-app/pull/828))
  - lucide-react 0.561.0 → 0.562.0

---

## 🔗 関連リンク

### Pull Requests

- [#832](https://github.com/t3-nico/boxlog-app/pull/832) - feat(mobile): モバイルレスポンシブ対応の大幅改善
- [#831](https://github.com/t3-nico/boxlog-app/pull/831) - feat(mobile): モバイルレスポンシブ対応の総合改善
- [#830](https://github.com/t3-nico/boxlog-app/pull/830) - feat(tags): タグ機能の改善
- [#828](https://github.com/t3-nico/boxlog-app/pull/828) - chore(deps): Bump lucide-react from 0.561.0 to 0.562.0
- [#825](https://github.com/t3-nico/boxlog-app/pull/825) - refactor(ui): ボタンデザインシステムの統一

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.9.0...v0.10.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
