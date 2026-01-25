# Release v0.8.0

**リリース日**: 2025-12-16
**バージョン**: 0.8.0

## 概要

カレンダー機能の大幅改善、認証セキュリティ強化（RLS/reCAPTCHA/IP制限/監査ログ）、パフォーマンス最適化、M3準拠デザインシステム導入を含むメジャーアップデート。v0.7.0から28のPRをマージ。

---

## 変更内容

### ✨ 新機能 (Added)

#### カレンダーフィルタリング機能 ([#793](https://github.com/t3-nico/boxlog-app/pull/793))

**84コミットによる大幅改善**

- Googleカレンダースタイルのフィルタリング機能
- ミニカレンダーとメインカレンダーの連携強化
- GoogleカレンダーライクなDnD動作を実装
- クリックとドラッグの判定ロジック改善
- SelectMenu/DropdownMenuのチェックマーク統一

#### カレンダー機能の大幅改善 ([#792](https://github.com/t3-nico/boxlog-app/pull/792), [#781](https://github.com/t3-nico/boxlog-app/pull/781))

- 複数のカレンダービュー改善
- サイドバーInboxタブをTodoにリネーム
- CalendarNavigationAreaおよび未使用コンポーネント削除
- 型エクスポート競合を解決し命名をPlanに統一

#### オフライン同期競合解決モーダル ([#795](https://github.com/t3-nico/boxlog-app/pull/795))

- オフライン時の競合を解決するモーダル実装
- 非推奨API削除

#### Inbox品質向上 ([#784](https://github.com/t3-nico/boxlog-app/pull/784))

**14コミットによる機能強化**

- 一括操作機能を実装
- タグ一括追加機能を実装
- サイドバーにコンパクトDayViewを追加
- InboxTableRowにドラッグ機能を追加
- start_timeがある場合は自動でdoingに表示
- useInboxDataの型安全性向上

#### サイドバー開閉UIの改善 ([#780](https://github.com/t3-nico/boxlog-app/pull/780))

- AppBarのUI改善

#### 統計ページ ([#765](https://github.com/t3-nico/boxlog-app/pull/765), [#779](https://github.com/t3-nico/boxlog-app/pull/779))

- 統計ページの実装
- 統計API追加
- ステータスバーからプラン作成機能

#### 法的ページ改善 ([#770](https://github.com/t3-nico/boxlog-app/pull/770))

- 特定商取引法表記追加

### 🔄 変更 (Changed)

#### ローディングパターンの改善 ([#789](https://github.com/t3-nico/boxlog-app/pull/789))

- `isLoading` → `isPending`移行（TanStack Query v5準拠）

#### コードクリーンアップとAPIリファクタリング ([#791](https://github.com/t3-nico/boxlog-app/pull/791))

#### タグ構造のフラット化と品質改善 ([#783](https://github.com/t3-nico/boxlog-app/pull/783))

#### tRPCアーキテクチャの改善 ([#782](https://github.com/t3-nico/boxlog-app/pull/782))

- サービス層の拡充

#### コロケーション原則に基づくリファクタリング ([#776](https://github.com/t3-nico/boxlog-app/pull/776))

- `src/types/`のリファクタリング

#### features/table・inspector の共通化 ([#774](https://github.com/t3-nico/boxlog-app/pull/774))

- コンポーネント整理

#### M3準拠セマンティックトークン導入 ([#764](https://github.com/t3-nico/boxlog-app/pull/764))

- デザインシステムの改善

### 🐛 バグ修正 (Fixed)

#### エラーハンドリングの改善 ([#794](https://github.com/t3-nico/boxlog-app/pull/794))

#### アイドルタイムアウト自動ログアウト機能を無効化 ([#790](https://github.com/t3-nico/boxlog-app/pull/790))

- セッション設定緩和

#### 統計ページの改善 ([#778](https://github.com/t3-nico/boxlog-app/pull/778))

- サイドバー簡素化
- PageHeader統一
- 合計時間カード追加

#### ハードコードされた日本語メッセージを翻訳キーに置換 ([#777](https://github.com/t3-nico/boxlog-app/pull/777))

#### ログインページフリーズ解消 ([#773](https://github.com/t3-nico/boxlog-app/pull/773))

- Providers分離

### ⚡ パフォーマンス (Performance)

#### ルーティング遅延を大幅改善 ([#796](https://github.com/t3-nico/boxlog-app/pull/796))

- middleware最適化
- タグページ高速化

### 🔒 セキュリティ (Security)

#### React 19.2.1へ更新 ([#775](https://github.com/t3-nico/boxlog-app/pull/775))

- CVE-2025-55182対策

#### 認証セキュリティ強化 ([#766](https://github.com/t3-nico/boxlog-app/pull/766))

**5コミットによる包括的なセキュリティ強化**

- ログイン画面フリーズ問題を修正（RLS + ロックアウト機能）
- reCAPTCHA v3統合
- セッションタイムアウト機能
- IP単位レート制限を実装
- 認証監査ログ機能を実装

### 🧪 テスト (Test)

#### ユニットテスト追加 ([#769](https://github.com/t3-nico/boxlog-app/pull/769))

- ゴミ箱機能削除
- useInboxDataのユニットテスト追加

#### E2Eテスト追加 ([#763](https://github.com/t3-nico/boxlog-app/pull/763))

- エラー修正
- reCAPTCHAフリーズ解消

### 📚 ドキュメント (Documentation)

#### ドキュメント品質向上 ([#785](https://github.com/t3-nico/boxlog-app/pull/785))

- TODOコメント整理

### 📦 依存関係 (Dependencies)

#### 本番依存関係の更新 ([#787](https://github.com/t3-nico/boxlog-app/pull/787))

- 15パッケージの更新

---

## 破壊的変更 (Breaking Changes)

### 削除された機能

- ゴミ箱機能
- CalendarNavigationAreaコンポーネント

### API変更

- `isLoading` → `isPending`に移行

---

## 関連リンク

### Pull Requests

| PR                                                     | タイトル                                                     | コミット数 |
| ------------------------------------------------------ | ------------------------------------------------------------ | ---------- |
| [#796](https://github.com/t3-nico/boxlog-app/pull/796) | perf: ルーティング遅延を大幅改善                             | -          |
| [#795](https://github.com/t3-nico/boxlog-app/pull/795) | feat: オフライン同期競合解決モーダル                         | -          |
| [#794](https://github.com/t3-nico/boxlog-app/pull/794) | fix: エラーハンドリングの改善                                | -          |
| [#793](https://github.com/t3-nico/boxlog-app/pull/793) | feat(calendar): Googleカレンダースタイルのフィルタリング機能 | 84         |
| [#792](https://github.com/t3-nico/boxlog-app/pull/792) | feat(calendar): カレンダー機能の大幅改善                     | -          |
| [#791](https://github.com/t3-nico/boxlog-app/pull/791) | refactor: コードクリーンアップとAPIリファクタリング          | -          |
| [#790](https://github.com/t3-nico/boxlog-app/pull/790) | fix(auth): アイドルタイムアウト無効化                        | -          |
| [#789](https://github.com/t3-nico/boxlog-app/pull/789) | refactor: isLoading→isPending移行                            | -          |
| [#787](https://github.com/t3-nico/boxlog-app/pull/787) | chore(deps): 15パッケージ更新                                | -          |
| [#785](https://github.com/t3-nico/boxlog-app/pull/785) | docs: ドキュメント品質向上                                   | -          |
| [#784](https://github.com/t3-nico/boxlog-app/pull/784) | feat(inbox): 一括操作・DnD・サイドバー改善                   | 14         |
| [#783](https://github.com/t3-nico/boxlog-app/pull/783) | refactor(tags): タグ構造のフラット化                         | -          |
| [#782](https://github.com/t3-nico/boxlog-app/pull/782) | refactor(trpc): tRPCアーキテクチャ改善                       | -          |
| [#781](https://github.com/t3-nico/boxlog-app/pull/781) | feat(calendar): カレンダー大幅改善                           | -          |
| [#780](https://github.com/t3-nico/boxlog-app/pull/780) | feat(appbar): サイドバー開閉UI改善                           | -          |
| [#779](https://github.com/t3-nico/boxlog-app/pull/779) | feat: 統計ページAPI追加                                      | -          |
| [#778](https://github.com/t3-nico/boxlog-app/pull/778) | fix(stats): 統計ページ改善                                   | -          |
| [#777](https://github.com/t3-nico/boxlog-app/pull/777) | fix(i18n): 日本語メッセージを翻訳キーに置換                  | -          |
| [#776](https://github.com/t3-nico/boxlog-app/pull/776) | refactor(types): コロケーション原則リファクタリング          | -          |
| [#775](https://github.com/t3-nico/boxlog-app/pull/775) | fix(security): React 19.2.1へ更新 (CVE対策)                  | -          |
| [#774](https://github.com/t3-nico/boxlog-app/pull/774) | refactor: table・inspector共通化                             | -          |
| [#773](https://github.com/t3-nico/boxlog-app/pull/773) | fix(auth): ログインページフリーズ解消                        | -          |
| [#770](https://github.com/t3-nico/boxlog-app/pull/770) | feat(legal): 特定商取引法表記追加                            | -          |
| [#769](https://github.com/t3-nico/boxlog-app/pull/769) | test: ユニットテスト追加                                     | -          |
| [#766](https://github.com/t3-nico/boxlog-app/pull/766) | fix(auth): 認証セキュリティ強化                              | 5          |
| [#765](https://github.com/t3-nico/boxlog-app/pull/765) | feat(stats): 統計ページ実装                                  | -          |
| [#764](https://github.com/t3-nico/boxlog-app/pull/764) | refactor(design-system): M3準拠トークン導入                  | -          |
| [#763](https://github.com/t3-nico/boxlog-app/pull/763) | test: E2Eテスト追加                                          | -          |

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.7.0...v0.8.0
