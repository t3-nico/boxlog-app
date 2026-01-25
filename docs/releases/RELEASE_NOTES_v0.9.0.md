# Release v0.9.0

**リリース日**: 2025-12-19
**バージョン**: 0.9.0

## 概要

タグ機能の大幅改善、デザインシステム統一、アクセシビリティ強化、パフォーマンス改善を含む大規模アップデート。UIコンポーネントの8pxグリッドシステム準拠、WCAG AA準拠のアクセシビリティ対応、Carbon Design System準拠のボタン改善を実現。

---

## 変更内容

### ✨ 新機能 (Added)

#### タグ機能の大幅改善 ([#821](https://github.com/t3-nico/boxlog-app/pull/821), [#817](https://github.com/t3-nico/boxlog-app/pull/817))

**データモデル**

- `is_active`カラム追加によるアーカイブ機能
- プラン・タグ連携のtRPCエンドポイント実装

**UI/UX改善**

- タグページの検索ボックス追加
- 表示モード切り替え（カード/リスト）
- TagsSidebar/TagsToolbarのUI統一
- 説明フィールドのインライン編集
- タグフィルターにプラン件数表示
- ColorPalettePickerを横並び表示に統一
- 文字数制限追加

**ドラッグ&ドロップ強化**

- アーカイブページ統合
- グループソート機能
- ドラッグ並び替え

**Inspector統一**

- 共通Inspector基盤の整備
- PlanInspectorとTagInspectorのスタイル統一
- TagInspector紐づくプラン・レコードセクション改善

#### カレンダー機能強化 ([#821](https://github.com/t3-nico/boxlog-app/pull/821), [#817](https://github.com/t3-nico/boxlog-app/pull/817))

- GoogleカレンダーライクなDnD動作を実装
- 日付間ドラッグ移動のサポート
- シングルクリックでプラン作成
- チェックボックスホバー時にチェックマーク表示
- キーボードショートカット対応
- プラン削除時のUndo機能

#### Dropzoneコンポーネント追加 ([#820](https://github.com/t3-nico/boxlog-app/pull/820))

- Supabase UI Library統合によるファイルアップロード機能

#### prefers-reduced-motion対応 ([#810](https://github.com/t3-nico/boxlog-app/pull/810))

- ユーザーのモーション設定に応じたアニメーション制御

### 🔄 変更 (Changed)

#### デザインシステム統一 ([#822](https://github.com/t3-nico/boxlog-app/pull/822))

**Buttonコンポーネント改善**

- Carbon Design System準拠のボタンサイズ・スタイル
- variant名を業界標準に統一
- default/secondary廃止 → primary/outline統一
- サイズ・バリアントの用途ガイド追加

**その他コンポーネント**

- Badge/Input/Avatar/Toggle/Alertのデザインシステム統一
- チャートにセマンティックカラートークン導入
- HoverTooltipコンポーネントへの移行

#### UIスタイル統一 ([#808](https://github.com/t3-nico/boxlog-app/pull/808))

**8pxグリッドシステム準拠**

- ヘッダー・ナビゲーションコンポーネントを8pxグリッドに統一
- ボタン・入力フィールドの高さ統一（24px/32px/40px/48px）
- ナビゲーションアイコンボタンを32pxに統一
- smサイズを24px→32pxに変更

**レイアウト統一**

- Nav-Content間の余白を統一（GAFA方式）
- ナビバーの左右余白を16pxに統一
- フォントサイズをtext-lgに変更

**フォーカスリング改善**

- 視認性向上

#### コンポーネント整理 ([#809](https://github.com/t3-nico/boxlog-app/pull/809))

- ボタン・フォームコンポーネントを`ui/`ディレクトリに統一
- AlertDialogをSheet外に分離しPortal競合を回避
- z-index階層を統一管理

#### ルートディレクトリ整理 ([#819](https://github.com/t3-nico/boxlog-app/pull/819))

- legalディレクトリを削除
- プロジェクト構造の簡素化

### 🐛 バグ修正 (Fixed)

#### アクセシビリティ改善（WCAG AA準拠）([#811](https://github.com/t3-nico/boxlog-app/pull/811))

- コントラスト比の改善
- フォーカス表示の強化
- キーボードナビゲーション対応

#### カレンダー関連 ([#821](https://github.com/t3-nico/boxlog-app/pull/821), [#817](https://github.com/t3-nico/boxlog-app/pull/817))

- ミニカレンダーとメインカレンダーの連携強化
- ドラッグハンドラーの要素検出改善
- DnDのゴースト表示とマウス追従改善
- クリックとドラッグの判定ロジック改善
- ミニカレンダーの日付同期とUI改善
- タグ表示・更新時の保持を修正

#### UI関連 ([#821](https://github.com/t3-nico/boxlog-app/pull/821), [#817](https://github.com/t3-nico/boxlog-app/pull/817))

- SelectMenu/DropdownMenuのチェックマーク統一
- Inspectorヘッダー/タブ固定、コンテンツ部分のみスクロール
- DataTableのテーブル構造修正
- セル高さ修正と選択色のセマンティック化
- TagMergeDialogのドロップダウンUI改善
- status-barテキストとアイコンサイズを12pxに修正

#### i18n ([#821](https://github.com/t3-nico/boxlog-app/pull/821))

- TablePaginationの翻訳名前空間修正
- QuickTagCreateModalの翻訳キー使用

### ⚡ パフォーマンス (Performance)

#### ページ遷移パフォーマンス改善 ([#818](https://github.com/t3-nico/boxlog-app/pull/818))

- BaseLayoutContentのuseMemoによるレンダリング最適化

### 📚 ドキュメント

- STYLE_GUIDEにz-index階層セクション追加
- Buttonサイズ・バリアントの用途ガイド追加

### 🔧 メンテナンス (Maintenance)

#### 依存関係更新 ([#816](https://github.com/t3-nico/boxlog-app/pull/816))

- @types/node 20.19.27 → 25.0.3

#### Dependabot設定最適化 ([#815](https://github.com/t3-nico/boxlog-app/pull/815))

- 1人開発向けに設定を調整

---

## 破壊的変更 (Breaking Changes)

### Buttonコンポーネント

- variant: `default`, `secondary` → `primary`, `outline`に変更
- サイズ: `sm` 24px → 32pxに変更

### 削除されたコンポーネント

- CalendarNavigationArea
- SimpleTooltip（HoverTooltipに統一）

### データベース

- tagsテーブルに`is_active`カラム追加

---

## 関連リンク

### Pull Requests

| PR                                                     | タイトル                                                               | コミット数 |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | ---------- |
| [#822](https://github.com/t3-nico/boxlog-app/pull/822) | refactor(ui): デザインシステム統一とボタン改善                         | 9          |
| [#821](https://github.com/t3-nico/boxlog-app/pull/821) | feat(tags): タグ機能の大幅改善とUI統一                                 | 100        |
| [#820](https://github.com/t3-nico/boxlog-app/pull/820) | feat(storage): Supabase UI Library統合によるDropzoneコンポーネント追加 | -          |
| [#819](https://github.com/t3-nico/boxlog-app/pull/819) | chore: ルートディレクトリの整理                                        | -          |
| [#818](https://github.com/t3-nico/boxlog-app/pull/818) | perf: ページ遷移パフォーマンス改善                                     | -          |
| [#817](https://github.com/t3-nico/boxlog-app/pull/817) | feat(tags): タグ機能の改善・UI統一・DnD強化                            | 86         |
| [#816](https://github.com/t3-nico/boxlog-app/pull/816) | chore(deps-dev): Bump @types/node from 20.19.27 to 25.0.3              | -          |
| [#815](https://github.com/t3-nico/boxlog-app/pull/815) | chore: Dependabot設定を1人開発向けに最適化                             | -          |
| [#811](https://github.com/t3-nico/boxlog-app/pull/811) | fix(a11y): アクセシビリティ改善（WCAG AA準拠）                         | -          |
| [#810](https://github.com/t3-nico/boxlog-app/pull/810) | feat(a11y): prefers-reduced-motion対応によるアニメーション制御         | -          |
| [#809](https://github.com/t3-nico/boxlog-app/pull/809) | refactor: ボタン・フォームコンポーネントをui/に統一                    | -          |
| [#808](https://github.com/t3-nico/boxlog-app/pull/808) | style: UIスタイル統一とButton改善（8pxグリッド・アクセシビリティ）     | 71         |

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.8.1...v0.9.0
