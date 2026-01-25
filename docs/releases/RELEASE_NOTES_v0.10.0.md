# Release v0.10.0

**リリース日**: 2025-12-24
**バージョン**: 0.10.0

## 概要

モバイルレスポンシブ対応の大幅改善。GAFAガイドライン準拠のUX実装、Drawer(Vaul)ベースのボトムシート統一、8pxグリッドシステムによるアイコンサイズ統一、PWA対応を含む大型モバイルUXアップデート。

---

## 変更内容

### ✨ 新機能 (Added)

#### モバイルレスポンシブ対応 ([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831))

**TableNavigationレスポンシブ**

- PCではPopover、モバイルではDrawer (Vaul) を使用
- 検索・フィルター・ソート・設定の4機能を統合
- フィルター数バッジ表示対応

**Inspectorボトムシート対応**

- モバイルでDrawerベースのボトムシート表示
- PCでは従来のサイドパネル表示を維持

**MobileSettingsSheet共通コンポーネント**

- `MobileSettingsSheet` - Notion風ボトムシート（汎用）
- `MobileSettingsSection` - セクション区切り
- `MobileSettingsChip` - マルチセレクト用チップ
- `MobileSettingsButtonGroup` - シングルセレクト用ボタングループ
- `MobileSettingsRadioGroup` - ラジオボタン風チップ

**ページ別モバイル設定シート**

- Inbox: フィルター・グループ化・列設定
- Board: 列表示・優先度・ソート
- Tags: 検索・表示モード・列設定
- Stats: 期間・比較・エクスポート

**モバイルUX強化**

- Haptic Feedback（カレンダー、Kanban、タグ操作）
- scroll-snap（カレンダー週表示）
- Pull-to-Refresh対応
- prefers-reduced-motion対応
- Long Pressフック追加
- Load Moreパターン実装

**PWA対応**

- Service Worker追加
- オフラインページ追加

#### タグ機能改善 ([#830](https://github.com/t3-nico/boxlog-app/pull/830))

**UI/UX改善**

- 説明フィールドのインライン編集
- HoverTooltipに統一
- タグフィルターにプラン件数表示
- アーカイブページ統合
- グループソート機能とドラッグ並び替え

**Inspector統一**

- 共通Inspector基盤の整備
- PlanInspectorとTagInspectorのスタイル統一
- 紐づくプラン・レコードセクション改善

**カラー・スタイル**

- ColorPalettePickerを横並び表示に統一
- tooltipカラーのセマンティックトークン化

#### AI機能基盤 ([#831](https://github.com/t3-nico/boxlog-app/pull/831))

- AI機能の基盤実装
- サイドバーにAIアシスタントボタン追加
- MoreActionSheetにAIアシスタント追加

#### カレンダー機能強化 ([#830](https://github.com/t3-nico/boxlog-app/pull/830))

- 週番号表示（バッジ形式）
- モバイル用ViewSwitcherList
- シングルクリックでプラン作成
- 日付間ドラッグ移動
- チェックボックスホバー時にチェックマーク表示
- プラン削除時のUndo機能
- タッチデバイスでのドラッグ選択対応

### 🔄 変更 (Changed)

#### Drawerデザイン改善 ([#832](https://github.com/t3-nico/boxlog-app/pull/832))

- 48pxタッチターゲットのドラッグハンドル
- rounded-2xlでモダンなデザイン
- 閉じるボタンアイコン24px統一

#### アイコンサイズ統一（8pxグリッド準拠）([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831))

- HeaderActions: 24px
- MobileMenuButton: 24px
- PageHeader AIボタン: 20px
- ナビゲーションアイコンボタン: 32px

#### ボタンデザインシステム統一 ([#825](https://github.com/t3-nico/boxlog-app/pull/825))

**outlineバリアント改善**

- `border-input` → `border-border`
- `bg-background` → `bg-surface-container`

**ボタンサイズ統一**

- メインUIボタンを`sm`(24px)から`default`(32px)に統一
- Calendar: Today、ViewSwitcher
- Inbox: ツールバー全般
- Tags: フィルターバー、グループ管理
- Settings: 各種設定画面

#### コンポーネント整理 ([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831))

- InboxBoardToolbar削除 → TableNavigationに統合
- BoardViewをTableNavigationに統合
- TableViewからGroupBySelectorを削除
- TagsFilterBarをTableNavigationに統合
- EmptyStateコンポーネント共通化
- PageHeader派生コンポーネントを削除し直接使用に統一

#### 設定UIリファクタリング ([#831](https://github.com/t3-nico/boxlog-app/pull/831))

- 設定をダイアログからページベースに移行
- モバイル設定画面のUI統一とGAFA準拠デザイン

#### モバイルスクロールバー非表示 ([#832](https://github.com/t3-nico/boxlog-app/pull/832))

- `@media (hover: none) and (pointer: coarse)` でタッチデバイス判定
- iOS/Android標準挙動に準拠

### 🐛 バグ修正 (Fixed)

#### アクセシビリティ ([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831))

- プライマリカラーのコントラスト比をWCAG AA準拠に改善
- パスワードトグルボタンにaria-label追加
- Sheetコンポーネントのアクセシビリティ改善
- ボトムシートのアクセシビリティとデザイン改善

#### カレンダー ([#830](https://github.com/t3-nico/boxlog-app/pull/830))

- ミニカレンダーとメインカレンダーの連携強化
- ドラッグハンドラーの要素検出改善
- DnDのゴースト表示とマウス追従改善
- クリックとドラッグの判定ロジック改善
- タグ表示・更新時の保持を修正

#### UI/UX ([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831), [#830](https://github.com/t3-nico/boxlog-app/pull/830))

- グローバル検索のモバイル対応
- PageHeaderのモバイル対応改善
- TablePaginationの構文エラー修正
- TableToolbarの水平スクロール対応
- exactOptionalPropertyTypesエラー対応
- Inspectorヘッダー/タブ固定、コンテンツ部分のみスクロール

### 📚 ドキュメント ([#832](https://github.com/t3-nico/boxlog-app/pull/832), [#831](https://github.com/t3-nico/boxlog-app/pull/831))

- 環境設定ガイド（Local/Staging/Production）追加
- レスポンシブデザインガイドライン拡充（M3準拠）
- Claude 4ベストプラクティス統合
- エージェントコーディングのベストプラクティス追加
- CLAUDE.mdを公式ベストプラクティスに準拠して簡素化
- STYLE_GUIDEにz-index階層セクション追加

### 🔧 メンテナンス

#### スキル追加 ([#832](https://github.com/t3-nico/boxlog-app/pull/832))

- `/releasing` スキル追加
- 開発効率化スキル追加

#### 依存関係更新 ([#828](https://github.com/t3-nico/boxlog-app/pull/828))

- lucide-react 0.561.0 → 0.562.0

---

## 破壊的変更 (Breaking Changes)

### 削除されたコンポーネント

- InboxBoardToolbar（TableNavigationに統合）
- PageHeader派生コンポーネント
- SimpleTooltip（HoverTooltipに統一）
- GroupBySelector（TableViewから削除）

### UI変更

- ボタンサイズ: `sm`(24px) → `default`(32px)がデフォルトに
- モバイルボトムシート: Sheet → Drawer (Vaul)に統一

---

## 統計

| 項目               | 数値 |
| ------------------ | ---- |
| コミット数         | 288+ |
| 新規コンポーネント | 10+  |

---

## 関連リンク

### Pull Requests

| PR                                                     | タイトル                                               | コミット数 |
| ------------------------------------------------------ | ------------------------------------------------------ | ---------- |
| [#832](https://github.com/t3-nico/boxlog-app/pull/832) | feat(mobile): モバイルレスポンシブ対応の大幅改善       | 100        |
| [#831](https://github.com/t3-nico/boxlog-app/pull/831) | feat(mobile): モバイルレスポンシブ対応の総合改善       | 81         |
| [#830](https://github.com/t3-nico/boxlog-app/pull/830) | feat(tags): タグ機能の改善                             | 100        |
| [#828](https://github.com/t3-nico/boxlog-app/pull/828) | chore(deps): Bump lucide-react from 0.561.0 to 0.562.0 | 1          |
| [#825](https://github.com/t3-nico/boxlog-app/pull/825) | refactor(ui): ボタンデザインシステムの統一             | 7          |

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.9.0...v0.10.0
