# Release v0.13.0

**リリース日**: 2026-01-23
**バージョン**: 0.13.0

## 概要

タグ機能リファクタリング、レイアウト/ナビゲーション刷新、Lighthouse CI強化、PostHog導入による品質・パフォーマンス・開発体験の大幅改善リリース。

---

## 変更内容

### ✨ 新機能 (Added)

- **PostHog アナリティクス導入** ([#863](https://github.com/t3-nico/boxlog-app/pull/863))
  - プロダクト分析基盤としてPostHog SDKを導入

- **テスト戦略強化** ([#860](https://github.com/t3-nico/boxlog-app/pull/860))
  - CI/カバレッジ計測、E2Eテスト、Integrationテストの整備

- **品質改善パッケージ** ([#870](https://github.com/t3-nico/boxlog-app/pull/870))
  - パフォーマンス、認証、テスト、CI/CDの包括的改善

### 🔄 変更 (Changed)

- **タグ機能リファクタリング** ([#910](https://github.com/t3-nico/boxlog-app/pull/910))
  - タグ機能全体の改善とコード品質向上

- **レイアウト・ナビゲーション統一** ([#865](https://github.com/t3-nico/boxlog-app/pull/865))
  - Linear/VS Code風のサイドバーとナビゲーションUIに刷新

- **Lighthouse CI厳格化** ([#872](https://github.com/t3-nico/boxlog-app/pull/872))
  - PRブロッキングによるスコア退行防止

- **ESLint no-consoleルール追加** ([#859](https://github.com/t3-nico/boxlog-app/pull/859))
  - logger統一によるデバッグ品質向上

- **スタイルシステム統一** ([#853](https://github.com/t3-nico/boxlog-app/pull/853))
  - カラー・ボタンサイズの一貫性確保

### 🐛 バグ修正 (Fixed)

- **Sentryイベント送信修正** ([#868](https://github.com/t3-nico/boxlog-app/pull/868))
  - tunnelRoute削除によりイベント送信を正常化

### ⚡ パフォーマンス (Performance)

- **認証フローLighthouse最適化 Phase 2** ([#874](https://github.com/t3-nico/boxlog-app/pull/874))
  - 認証関連のパフォーマンス改善

---

## 関連リンク

### Pull Requests

- [#910](https://github.com/t3-nico/boxlog-app/pull/910) - refactor(tags): タグ機能の改善とリファクタリング
- [#874](https://github.com/t3-nico/boxlog-app/pull/874) - perf(auth): Phase 2 - Lighthouse CI optimization
- [#872](https://github.com/t3-nico/boxlog-app/pull/872) - ci(lighthouse): enable PR blocking on score regression
- [#870](https://github.com/t3-nico/boxlog-app/pull/870) - feat: quality improvements - performance, auth, tests, CI/CD
- [#868](https://github.com/t3-nico/boxlog-app/pull/868) - fix(sentry): tunnelRoute削除によりイベント送信を修正
- [#865](https://github.com/t3-nico/boxlog-app/pull/865) - refactor(layout): Linear/VS Code風サイドバーとナビゲーション統一
- [#863](https://github.com/t3-nico/boxlog-app/pull/863) - feat(analytics): PostHog SDK導入
- [#860](https://github.com/t3-nico/boxlog-app/pull/860) - feat(test): テスト戦略強化 - CI/カバレッジ・E2E・Integration
- [#859](https://github.com/t3-nico/boxlog-app/pull/859) - fix(lint): ESLint no-console ルール追加 & logger統一
- [#853](https://github.com/t3-nico/boxlog-app/pull/853) - refactor(style): スタイルシステム統一 (カラー・ボタンサイズ)

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.12.0...v0.13.0
