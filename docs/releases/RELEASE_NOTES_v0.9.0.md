# Release v0.9.0

**リリース日**: 2025-12-19
**バージョン**: 0.9.0

## 🎯 概要

タグ機能の大幅改善、デザインシステム統一、アクセシビリティ強化、パフォーマンス改善を含む大規模アップデート。UIコンポーネントの8pxグリッドシステム準拠とWCAG AA準拠のアクセシビリティ対応を実現。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **タグ機能の大幅改善** ([#821](https://github.com/t3-nico/boxlog-app/pull/821), [#817](https://github.com/t3-nico/boxlog-app/pull/817))
  - タグページの検索ボックス追加
  - 表示モード切り替え（カード/リスト）
  - TagsSidebar/TagsToolbarのUI統一
  - ドラッグ&ドロップ機能強化

- **Dropzoneコンポーネント追加** ([#820](https://github.com/t3-nico/boxlog-app/pull/820))
  - Supabase UI Library統合によるファイルアップロード機能

- **prefers-reduced-motion対応** ([#810](https://github.com/t3-nico/boxlog-app/pull/810))
  - ユーザーのモーション設定に応じたアニメーション制御

### 🔄 変更 (Changed)

- **デザインシステム統一とボタン改善** ([#822](https://github.com/t3-nico/boxlog-app/pull/822))
  - Buttonバリアント整理（default/secondary廃止、primary/outline統一）
  - HoverTooltipコンポーネントへの移行

- **UIスタイル統一** ([#808](https://github.com/t3-nico/boxlog-app/pull/808))
  - 8pxグリッドシステム準拠
  - ボタン・入力フィールドの高さ統一（24px/32px/40px/48px）
  - フォーカスリングの視認性向上

- **コンポーネント整理** ([#809](https://github.com/t3-nico/boxlog-app/pull/809))
  - ボタン・フォームコンポーネントを`ui/`ディレクトリに統一

- **ルートディレクトリ整理** ([#819](https://github.com/t3-nico/boxlog-app/pull/819))
  - プロジェクト構造の簡素化

### 🐛 バグ修正 (Fixed)

- **アクセシビリティ改善（WCAG AA準拠）** ([#811](https://github.com/t3-nico/boxlog-app/pull/811))
  - コントラスト比の改善
  - フォーカス表示の強化
  - キーボードナビゲーション対応

### ⚡ パフォーマンス (Performance)

- **ページ遷移パフォーマンス改善** ([#818](https://github.com/t3-nico/boxlog-app/pull/818))
  - BaseLayoutContentのuseMemoによるレンダリング最適化

### 🔧 メンテナンス (Maintenance)

- **依存関係更新** ([#816](https://github.com/t3-nico/boxlog-app/pull/816))
  - @types/node 20.19.27 → 25.0.3

- **Dependabot設定最適化** ([#815](https://github.com/t3-nico/boxlog-app/pull/815))
  - 1人開発向けに設定を調整

---

## 🔗 関連リンク

### Pull Requests

- [#822](https://github.com/t3-nico/boxlog-app/pull/822) - refactor(ui): デザインシステム統一とボタン改善
- [#821](https://github.com/t3-nico/boxlog-app/pull/821) - feat(tags): タグ機能の大幅改善とUI統一
- [#820](https://github.com/t3-nico/boxlog-app/pull/820) - feat(storage): Supabase UI Library統合によるDropzoneコンポーネント追加
- [#819](https://github.com/t3-nico/boxlog-app/pull/819) - chore: ルートディレクトリの整理
- [#818](https://github.com/t3-nico/boxlog-app/pull/818) - perf: ページ遷移パフォーマンス改善
- [#817](https://github.com/t3-nico/boxlog-app/pull/817) - feat(tags): タグ機能の改善・UI統一・DnD強化
- [#816](https://github.com/t3-nico/boxlog-app/pull/816) - chore(deps-dev): Bump @types/node from 20.19.27 to 25.0.3
- [#815](https://github.com/t3-nico/boxlog-app/pull/815) - chore: Dependabot設定を1人開発向けに最適化
- [#811](https://github.com/t3-nico/boxlog-app/pull/811) - fix(a11y): アクセシビリティ改善（WCAG AA準拠）
- [#810](https://github.com/t3-nico/boxlog-app/pull/810) - feat(a11y): prefers-reduced-motion対応によるアニメーション制御
- [#809](https://github.com/t3-nico/boxlog-app/pull/809) - refactor: ボタン・フォームコンポーネントをui/に統一
- [#808](https://github.com/t3-nico/boxlog-app/pull/808) - style: UIスタイル統一とButton改善（8pxグリッド・アクセシビリティ）

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.8.1...v0.9.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
