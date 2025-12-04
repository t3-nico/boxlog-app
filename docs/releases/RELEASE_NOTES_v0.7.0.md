# Release v0.7.0

**リリース日**: 2025-12-04
**バージョン**: 0.7.0

## 🎯 概要

このリリースでは、**ステータスシステムの3段階簡素化**、**i18n構造の最適化**、**カレンダー機能の大幅改善**、**パフォーマンス最適化**、および**TypeScript厳格モードの有効化**を含む大規模な改善を行いました。

主なハイライト:
- ステータスを5段階から3段階（todo/doing/done）に簡素化
- i18n構造の最適化とデフォルトロケールプレフィックス削除
- AgendaView機能実装とカレンダーUIリデザイン
- Cursor風ステータスバーの実装
- LCP/INP改善によるパフォーマンス最適化
- TypeScript厳格モード・ESLint any禁止の有効化

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **AgendaView機能実装とUIリデザイン** ([#751](https://github.com/t3-nico/boxlog-app/pull/751))
  - カレンダーにAgendaView（一覧表示）を追加
  - UIをリデザインして使いやすさを向上

- **Cursor風ステータスバーの実装** ([#744](https://github.com/t3-nico/boxlog-app/pull/744))
  - エディタ下部にCursor風のステータスバーを追加
  - 現在の状態を視覚的に表示

- **タグマージ機能とDataTable統合** ([#757](https://github.com/t3-nico/boxlog-app/pull/757))
  - タグをマージする機能を追加
  - DataTableとの統合を実装

- **フッターからクロノタイプ設定へのナビゲーション機能追加** ([#752](https://github.com/t3-nico/boxlog-app/pull/752))
  - フッターからクロノタイプ設定へ直接アクセス可能に

- **タグベースの本番デプロイを実装** ([#755](https://github.com/t3-nico/boxlog-app/pull/755))
  - Gitタグに基づく本番デプロイの自動化

- **通知ドロップダウンのデザイン改善とUI統一** ([#750](https://github.com/t3-nico/boxlog-app/pull/750))
  - 通知UIを改善しデザインを統一

- **ハードコード文字列の多言語化とコンポーネント改善** ([#749](https://github.com/t3-nico/boxlog-app/pull/749))
  - 多言語対応を拡大

### 🔄 変更 (Changed)

- **ステータスシステムを3段階に簡素化 (todo/doing/done)** ([#759](https://github.com/t3-nico/boxlog-app/pull/759))
  - 5段階ステータスから3段階に簡素化
  - より直感的なタスク管理を実現

- **i18n構造の最適化とデフォルトロケールプレフィックス削除** ([#760](https://github.com/t3-nico/boxlog-app/pull/760))
  - i18n構造を最適化
  - デフォルトロケール（日本語）のURLプレフィックスを削除

- **M3 State Layers準拠のopacity値を修正** ([#758](https://github.com/t3-nico/boxlog-app/pull/758))
  - Material Design 3のState Layers仕様に準拠

- **設定ダイアログのUI改善とスタイル統一** ([#748](https://github.com/t3-nico/boxlog-app/pull/748))
  - 設定ダイアログのUIを改善

- **カレンダー機能の型安全性向上とコードクリーンアップ** ([#747](https://github.com/t3-nico/boxlog-app/pull/747))
  - TypeScriptの型安全性を向上
  - 不要なコードを削除

- **Sentry SDK v10 + Next.js 15 ベストプラクティスに移行** ([#745](https://github.com/t3-nico/boxlog-app/pull/745))
  - Sentry SDKを最新版にアップグレード
  - Next.js 15のベストプラクティスに対応

- **ページ遷移最適化とモジュール構造改善** ([#753](https://github.com/t3-nico/boxlog-app/pull/753))
  - ページ遷移のパフォーマンスを最適化
  - モジュール構造を改善

- **TypeScript厳格モード・ESLint any禁止を有効化** ([#740](https://github.com/t3-nico/boxlog-app/pull/740))
  - より厳格な型チェックを有効化
  - any型の使用を禁止

- **PRラベル自動付与とConventional Commits検証を追加** ([#746](https://github.com/t3-nico/boxlog-app/pull/746))
  - CI/CDの改善

### 🐛 バグ修正 (Fixed)

- **search機能のmainマージ後の型エラーを修正** ([#761](https://github.com/t3-nico/boxlog-app/pull/761))
  - 検索機能の型エラーを修正
  - fuse.jsの統合

- **Google reCAPTCHAを許可するCSP設定を追加** ([#754](https://github.com/t3-nico/boxlog-app/pull/754))
  - セキュリティヘッダーの修正

### ⚡ パフォーマンス (Performance)

- **パフォーマンス最適化（LCP/INP改善、i18nフラッシュ修正）** ([#756](https://github.com/t3-nico/boxlog-app/pull/756))
  - Largest Contentful Paint (LCP) の改善
  - Interaction to Next Paint (INP) の改善
  - チャート遅延ロードとフォント最適化
  - バンドルサイズ削減とキャッシュ戦略強化
  - Lighthouse改善（SEO、PWA、A11y）
  - 翻訳キーフラッシュ問題を解決

### 📦 依存関係 (Dependencies)

- **メジャー依存関係アップグレード** ([#741](https://github.com/t3-nico/boxlog-app/pull/741))
  - recharts 3.x
  - vitest 4.x
  - @ai-sdk/openai 2.x

- **production-dependencies group更新** ([#742](https://github.com/t3-nico/boxlog-app/pull/742))
  - 15個の依存関係をアップデート

### 📚 ドキュメント (Documentation)

- **リリースノートの品質基準とファイル配置を改善** ([#739](https://github.com/t3-nico/boxlog-app/pull/739))

---

## 🔗 関連リンク

### Pull Requests

- [#761](https://github.com/t3-nico/boxlog-app/pull/761) - fix(search): main マージ後の型エラーを修正
- [#760](https://github.com/t3-nico/boxlog-app/pull/760) - refactor(i18n): i18n構造の最適化とデフォルトロケールプレフィックス削除
- [#759](https://github.com/t3-nico/boxlog-app/pull/759) - refactor(status): ステータスシステムを3段階に簡素化 (todo/doing/done)
- [#758](https://github.com/t3-nico/boxlog-app/pull/758) - style: M3 State Layers準拠のopacity値を修正
- [#757](https://github.com/t3-nico/boxlog-app/pull/757) - feat(tags): タグマージ機能とDataTable統合
- [#756](https://github.com/t3-nico/boxlog-app/pull/756) - perf: パフォーマンス最適化（LCP/INP改善、i18nフラッシュ修正）
- [#755](https://github.com/t3-nico/boxlog-app/pull/755) - feat(deploy): タグベースの本番デプロイを実装
- [#754](https://github.com/t3-nico/boxlog-app/pull/754) - fix(csp): Google reCAPTCHAを許可するCSP設定を追加
- [#753](https://github.com/t3-nico/boxlog-app/pull/753) - refactor: ページ遷移最適化とモジュール構造改善
- [#752](https://github.com/t3-nico/boxlog-app/pull/752) - feat(settings): フッターからクロノタイプ設定へのナビゲーション機能追加
- [#751](https://github.com/t3-nico/boxlog-app/pull/751) - feat(calendar): AgendaView機能実装とUIリデザイン
- [#750](https://github.com/t3-nico/boxlog-app/pull/750) - feat(notifications): 通知ドロップダウンのデザイン改善とUI統一
- [#749](https://github.com/t3-nico/boxlog-app/pull/749) - feat(i18n): ハードコード文字列の多言語化とコンポーネント改善
- [#748](https://github.com/t3-nico/boxlog-app/pull/748) - refactor(settings): 設定ダイアログのUI改善とスタイル統一
- [#747](https://github.com/t3-nico/boxlog-app/pull/747) - refactor(calendar): カレンダー機能の型安全性向上とコードクリーンアップ
- [#746](https://github.com/t3-nico/boxlog-app/pull/746) - ci: PRラベル自動付与とConventional Commits検証を追加
- [#745](https://github.com/t3-nico/boxlog-app/pull/745) - refactor(sentry): Sentry SDK v10 + Next.js 15 ベストプラクティスに移行
- [#744](https://github.com/t3-nico/boxlog-app/pull/744) - feat(status-bar): Cursor風ステータスバーの実装
- [#742](https://github.com/t3-nico/boxlog-app/pull/742) - chore(deps): Bump the production-dependencies group with 15 updates
- [#741](https://github.com/t3-nico/boxlog-app/pull/741) - deps: メジャー依存関係アップグレード (recharts 3.x, vitest 4.x, @ai-sdk/openai 2.x)
- [#740](https://github.com/t3-nico/boxlog-app/pull/740) - refactor: TypeScript厳格モード・ESLint any禁止を有効化
- [#739](https://github.com/t3-nico/boxlog-app/pull/739) - docs(release): リリースノートの品質基準とファイル配置を改善

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.6.0...v0.7.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
