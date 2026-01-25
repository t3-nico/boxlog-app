# Release v0.12.0

**リリース日**: 2025-01-09
**バージョン**: 0.12.0

## 概要

ステータス管理の簡略化（3段階→2段階）、Settings/Tags UIのChatGPT/Notion風刷新、カレンダー機能強化（繰り返しプラン・睡眠時間帯対応）、通知設定のリアルタイム連携を含む大規模アップデート。

---

## 変更内容

### ✨ 新機能 (Added)

#### ステータス簡略化 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

**データモデル変更**

- 3段階(todo/doing/done)から2段階(open/done)に簡略化
- Board/Table/Calendarビューを新ステータスシステムに対応

**UI変更**

- サイドバーの「Todo」→「Open」にリネーム
- Inspectorにステータストグル機能追加
- 一括ステータス変更とタブカウントバッジ

#### 通知設定のリアルタイム連携 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

**バックエンド**

- `notifications` tRPCルーター追加
- `delivery_settings` DBマイグレーション追加
- リマインダーcronジョブ有効化

**フロントエンド**

- ChatGPT風の通知設定UI実装
- ブラウザ通知とRealtimeの統合

#### カレンダー機能強化 ([#850](https://github.com/t3-nico/boxlog-app/pull/850))

**繰り返しプラン対応**

- 繰り返しプランをカレンダー上で展開表示
- スコープ選択ダイアログ（単一/今後すべて/すべて）
- Board/Tableビューでインライン編集時もスコープ選択対応
- 繰り返しインスタンスクリック時に親プランを開く

**睡眠時間帯機能**

- 睡眠スケジュール設定UI
- カレンダーグリッドに睡眠時間帯を背景色で表示
- 睡眠時間帯の折りたたみ機能（1行に圧縮表示）

**その他カレンダー改善**

- Google Calendar風のオーバーデュー（期限切れ）ポップオーバー
- 週番号表示（設定と連携）
- ドラッグ選択プラン作成時の重複チェック・視覚的フィードバック
- モバイルタッチサポート

### 🔄 変更 (Changed)

#### Settings UI刷新 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

**デザイン変更**

- ChatGPT/Notion風のモダンなデザイン
- SettingRowパターンによる統一的なレイアウト
- コンテンツパディングを24pxに拡大
- セクションボーダーを削除

**設定カテゴリ変更**

- 「About」カテゴリを削除
- 「Integrations」カテゴリを追加
- General設定に言語・起動画面を追加

#### Tags管理UI変更 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

- サイドバーを削除しInbox風の単一カラムレイアウトに変更
- Inspector経由でのタグ作成に統一
- タグルートを `/settings/tags` に移動
- グループ表示モードでもタグ作成可能に

#### Inbox機能改善 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

**ビュー統一**

- ボードビューを削除、テーブルビューに統一
- Linear風の2カラムフィルターUI実装
- Notion風ソートUIと永続化・動的ソート

**検索・ページネーション**

- インライン展開パターンの検索改善
- ローカルステートとデバウンスで検索入力安定化
- 動的ページサイズとシンプルなページネーション

**CompactDayView改善**

- カレンダーピッカーとInspector追加
- 睡眠時間表示と折りたたみ機能

#### スタイル統一 ([#850](https://github.com/t3-nico/boxlog-app/pull/850))

- ホバースタイルを `hover:bg-state-hover` に統一
- ハードコード青色をセマンティックトークンに変更
- クロノタイプ色をセマンティックトークン化（indigo→purple）
- RadioGroupのスタイリング改善

#### 開発環境カスタマイズ ([#851](https://github.com/t3-nico/boxlog-app/pull/851))

**新規スキル追加**

- `/brainstorming` - 壁打ち・相談
- `/explain` - コードの「なぜ」を解説
- `/health-check` - 技術的健全性チェック

**新規コマンド追加**

- `/cleanup` - 不要コード削除
- `/learn` - 概念・ツールの解説

**新規ドキュメント追加**

- `docs/architecture/DATA_FLOW.md` - データの流れ
- `docs/architecture/TOOLS.md` - ツールの役割
- `docs/architecture/PATTERNS.md` - 設計パターン
- `docs/learning/CONCEPTS.md` - 重要概念の解説

### 🐛 バグ修正 (Fixed)

#### アクセシビリティ改善 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

- WCAG準拠の見出し構造
- `aria-describedby` 追加
- TimeGridに `role="grid"` 追加
- DayColumnに `role="gridcell"` 追加
- Spinnerに `aria-live` 追加

#### その他の修正

- **i18n**: ハードコードされた日本語文字列の国際化 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
- **カレンダー**: overdue section縦線整列とタイムゾーン表示改善 ([#850](https://github.com/t3-nico/boxlog-app/pull/850))
- **カレンダー**: ドラッグ・リサイズ時の重複視覚フィードバック表示修正 ([#850](https://github.com/t3-nico/boxlog-app/pull/850))
- **UI**: LoadingStatesのbuttonサイズprop修正 ([#850](https://github.com/t3-nico/boxlog-app/pull/850))
- **検索**: モーダル幅の`sm:w-auto`削除で正しい幅に ([#852](https://github.com/t3-nico/boxlog-app/pull/852))
- **設定**: flexとblockクラスの競合解決 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

### ⚡ パフォーマンス (Performance)

- **設定ページ**: Server Component + プリフェッチでページ遷移最適化 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

### 🗑️ 削除 (Removed)

#### 未使用コンポーネント削除 ([#852](https://github.com/t3-nico/boxlog-app/pull/852))

- Kanbanコンポーネント一式
- 未使用UIコンポーネント
- 通知ドロップダウンの未使用コンポーネント

#### コード整理 ([#851](https://github.com/t3-nico/boxlog-app/pull/851))

- オフライン機能削除
- framer-motionをスタブに置き換え
- 未使用ファイル・依存関係削除
- `console.log` デバッグステートメント削除

#### リファクタリング ([#850](https://github.com/t3-nico/boxlog-app/pull/850))

- 未使用の `size="lg"`, `size="icon-lg"` ボタンバリアント削除
- タグの `number` フィールド削除（UUIDのみに統一）
- ID列をテーブルから削除

---

## 破壊的変更 (Breaking Changes)

### データベース

- ステータス: `todo/doing/done` → `open/done` に変更
- タグ: `number` フィールド削除、UUIDのみに統一
- タグURL: `/tags/:number` → `/tags/:uuid` に変更

### 削除されたコンポーネント

- Kanbanコンポーネント一式
- ボードビュー（テーブルビューに統一）
- タグサイドバー

### 削除された機能

- オフライン機能
- framer-motionアニメーション（スタブに置き換え）

---

## 関連リンク

### Pull Requests

| PR                                                     | タイトル                                                   | コミット数 |
| ------------------------------------------------------ | ---------------------------------------------------------- | ---------- |
| [#852](https://github.com/t3-nico/boxlog-app/pull/852) | feat: Status簡略化、Settings/Tags UI刷新、通知設定         | 65         |
| [#851](https://github.com/t3-nico/boxlog-app/pull/851) | chore: コード整理 & 開発環境カスタマイズ                   | 7          |
| [#850](https://github.com/t3-nico/boxlog-app/pull/850) | feat: カレンダー機能強化・スタイル統一・繰り返しプラン対応 | 53         |

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.11.0...v0.12.0
