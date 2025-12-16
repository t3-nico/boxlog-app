# Release v0.8.0

**リリース日**: 2025-12-16
**バージョン**: 0.8.0

## 🎯 概要

カレンダー機能の大幅改善、パフォーマンス最適化、認証セキュリティ強化を含むメジャーアップデート。v0.7.0から28のPRをマージし、新機能追加・バグ修正・リファクタリングを実施。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **カレンダーフィルタリング機能** ([#793](https://github.com/t3-nico/boxlog-app/pull/793))
  - Googleカレンダースタイルのフィルタリング機能
  - UI改善

- **カレンダー機能の大幅改善** ([#792](https://github.com/t3-nico/boxlog-app/pull/792), [#781](https://github.com/t3-nico/boxlog-app/pull/781))
  - 複数のカレンダービュー改善
  - リファクタリングによる品質向上

- **オフライン同期競合解決モーダル** ([#795](https://github.com/t3-nico/boxlog-app/pull/795))
  - オフライン時の競合を解決するモーダル実装
  - 非推奨API削除

- **Inbox品質向上** ([#784](https://github.com/t3-nico/boxlog-app/pull/784))
  - 一括操作機能
  - ドラッグ&ドロップ対応
  - サイドバー改善

- **サイドバー開閉UIの改善** ([#780](https://github.com/t3-nico/boxlog-app/pull/780))
  - AppBarのUI改善

- **統計ページ** ([#765](https://github.com/t3-nico/boxlog-app/pull/765), [#779](https://github.com/t3-nico/boxlog-app/pull/779))
  - 統計ページの実装
  - API追加
  - ステータスバーからプラン作成機能

- **法的ページ改善** ([#770](https://github.com/t3-nico/boxlog-app/pull/770))
  - 特定商取引法表記追加

### 🔄 変更 (Changed)

- **ローディングパターンの改善** ([#789](https://github.com/t3-nico/boxlog-app/pull/789))
  - isLoading→isPending移行

- **コードクリーンアップとAPIリファクタリング** ([#791](https://github.com/t3-nico/boxlog-app/pull/791))

- **タグ構造のフラット化と品質改善** ([#783](https://github.com/t3-nico/boxlog-app/pull/783))

- **tRPCアーキテクチャの改善とサービス層の拡充** ([#782](https://github.com/t3-nico/boxlog-app/pull/782))

- **コロケーション原則に基づくsrc/types/のリファクタリング** ([#776](https://github.com/t3-nico/boxlog-app/pull/776))

- **features/table・inspector の共通化とコンポーネント整理** ([#774](https://github.com/t3-nico/boxlog-app/pull/774))

- **M3準拠セマンティックトークン導入** ([#764](https://github.com/t3-nico/boxlog-app/pull/764))
  - デザインシステムの改善

### 🐛 バグ修正 (Fixed)

- **エラーハンドリングの改善** ([#794](https://github.com/t3-nico/boxlog-app/pull/794))

- **アイドルタイムアウト自動ログアウト機能を無効化** ([#790](https://github.com/t3-nico/boxlog-app/pull/790))
  - セッション設定緩和

- **統計ページの改善** ([#778](https://github.com/t3-nico/boxlog-app/pull/778))
  - サイドバー簡素化
  - PageHeader統一
  - 合計時間カード追加

- **ハードコードされた日本語メッセージを翻訳キーに置換** ([#777](https://github.com/t3-nico/boxlog-app/pull/777))

- **ログインページフリーズ解消** ([#773](https://github.com/t3-nico/boxlog-app/pull/773))
  - Providers分離

### ⚡ パフォーマンス (Performance)

- **ルーティング遅延を大幅改善** ([#796](https://github.com/t3-nico/boxlog-app/pull/796))
  - middleware最適化
  - タグページ高速化

### 🔒 セキュリティ (Security)

- **React 19.2.1へ更新** ([#775](https://github.com/t3-nico/boxlog-app/pull/775))
  - CVE-2025-55182対策

- **認証セキュリティ強化** ([#766](https://github.com/t3-nico/boxlog-app/pull/766))
  - RLS強化
  - reCAPTCHA
  - IP制限
  - 監査ログ

### 🧪 テスト (Test)

- **ユニットテスト追加** ([#769](https://github.com/t3-nico/boxlog-app/pull/769))
  - ゴミ箱機能削除

- **E2Eテスト追加** ([#763](https://github.com/t3-nico/boxlog-app/pull/763))
  - エラー修正
  - reCAPTCHAフリーズ解消

### 📚 ドキュメント (Documentation)

- **ドキュメント品質向上** ([#785](https://github.com/t3-nico/boxlog-app/pull/785))
  - TODOコメント整理

### 📦 依存関係 (Dependencies)

- **本番依存関係の更新** ([#787](https://github.com/t3-nico/boxlog-app/pull/787))
  - 15パッケージの更新

---

## 🔗 関連リンク

### Pull Requests

- [#796](https://github.com/t3-nico/boxlog-app/pull/796) - perf: ルーティング遅延を大幅改善（middleware最適化・タグページ高速化）
- [#795](https://github.com/t3-nico/boxlog-app/pull/795) - feat: オフライン同期競合解決モーダルと非推奨API削除
- [#794](https://github.com/t3-nico/boxlog-app/pull/794) - fix: エラーハンドリングの改善
- [#793](https://github.com/t3-nico/boxlog-app/pull/793) - feat(calendar): Googleカレンダースタイルのフィルタリング機能とUI改善
- [#792](https://github.com/t3-nico/boxlog-app/pull/792) - feat(calendar): カレンダー機能の大幅改善
- [#791](https://github.com/t3-nico/boxlog-app/pull/791) - refactor: コードクリーンアップとAPIリファクタリング
- [#790](https://github.com/t3-nico/boxlog-app/pull/790) - fix(auth): アイドルタイムアウト自動ログアウト機能を無効化・セッション設定緩和
- [#789](https://github.com/t3-nico/boxlog-app/pull/789) - refactor: ローディングパターンの改善とisLoading→isPending移行
- [#787](https://github.com/t3-nico/boxlog-app/pull/787) - chore(deps): Bump the production-dependencies group across 1 directory with 15 updates
- [#785](https://github.com/t3-nico/boxlog-app/pull/785) - docs: ドキュメント品質向上とTODOコメント整理
- [#784](https://github.com/t3-nico/boxlog-app/pull/784) - feat(inbox): Inbox品質向上（一括操作・DnD・サイドバー改善）
- [#783](https://github.com/t3-nico/boxlog-app/pull/783) - refactor(tags): タグ構造のフラット化と品質改善
- [#782](https://github.com/t3-nico/boxlog-app/pull/782) - refactor(trpc): tRPCアーキテクチャの改善とサービス層の拡充
- [#781](https://github.com/t3-nico/boxlog-app/pull/781) - feat(calendar): カレンダー機能の大幅改善とリファクタリング
- [#780](https://github.com/t3-nico/boxlog-app/pull/780) - feat(appbar): サイドバー開閉UIの改善
- [#779](https://github.com/t3-nico/boxlog-app/pull/779) - feat: 統計ページAPI追加 & ステータスバーからプラン作成機能
- [#778](https://github.com/t3-nico/boxlog-app/pull/778) - fix(stats): 統計ページの改善 - サイドバー簡素化・PageHeader統一・合計時間カード追加
- [#777](https://github.com/t3-nico/boxlog-app/pull/777) - fix(i18n): ハードコードされた日本語メッセージを翻訳キーに置換
- [#776](https://github.com/t3-nico/boxlog-app/pull/776) - refactor(types): コロケーション原則に基づくsrc/types/のリファクタリング
- [#775](https://github.com/t3-nico/boxlog-app/pull/775) - fix(security): React 19.2.1へ更新 (CVE-2025-55182対策)
- [#774](https://github.com/t3-nico/boxlog-app/pull/774) - refactor: features/table・inspector の共通化とコンポーネント整理
- [#773](https://github.com/t3-nico/boxlog-app/pull/773) - fix(auth): ログインページフリーズ解消とProviders分離
- [#770](https://github.com/t3-nico/boxlog-app/pull/770) - feat(legal): 法的ページ改善と特定商取引法表記追加
- [#769](https://github.com/t3-nico/boxlog-app/pull/769) - test: ユニットテスト追加とゴミ箱機能削除
- [#766](https://github.com/t3-nico/boxlog-app/pull/766) - fix(auth): 認証セキュリティ強化 - RLS/reCAPTCHA/IP制限/監査ログ
- [#765](https://github.com/t3-nico/boxlog-app/pull/765) - feat(stats): 統計ページの実装と不要ページの整理
- [#764](https://github.com/t3-nico/boxlog-app/pull/764) - refactor(design-system): M3準拠セマンティックトークン導入
- [#763](https://github.com/t3-nico/boxlog-app/pull/763) - test: E2Eテスト追加・エラー修正・reCAPTCHAフリーズ解消

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.7.0...v0.8.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
