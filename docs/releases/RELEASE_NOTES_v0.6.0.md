# Release v0.6.0

**リリース日**: 2025-12-01
**バージョン**: 0.6.0

## 🎯 概要

Next.js 15.5.6 + React 19へのアップグレード、Material Design 3準拠のUI統一、コード品質の大幅改善を実施。フレームワークの最新安定版への移行とデザインシステムの完成度向上を行いました。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- **React 19サポート** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - Next.js 15.5.6経由でReact 19を導入

- **日本語フォント対応** ([#730](https://github.com/t3-nico/boxlog-app/pull/730))
  - Inter Variable Font最適化
  - 日本語表示の改善

### 🔄 変更 (Changed)

- **Next.js 15.5.6へアップグレード** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - Next.js 14 → 15.5.6
  - eslint-config-next 15.5.6でESLint 9との互換性確保
  - @hookform/resolvers 3.10.0（Zod 3.x互換バージョン）

- **Material Design 3準拠のUI統一** ([#735](https://github.com/t3-nico/boxlog-app/pull/735), [#728](https://github.com/t3-nico/boxlog-app/pull/728))
  - ホバー・選択状態を全コンポーネントで統一
  - M3準拠のインタラクション実装

- **デザインシステム改善** ([#736](https://github.com/t3-nico/boxlog-app/pull/736), [#732](https://github.com/t3-nico/boxlog-app/pull/732), [#718](https://github.com/t3-nico/boxlog-app/pull/718))
  - デザインシステム参照先をtheme.tsからglobals.cssに修正
  - 角丸を8pxグリッドに統一（rounded-lg → rounded-xl）
  - Pop系カラートークン統一とコントラスト比改善

- **UI/UX改善** ([#721](https://github.com/t3-nico/boxlog-app/pull/721), [#719](https://github.com/t3-nico/boxlog-app/pull/719))
  - AppBar・Sidebarデザインの統一とモバイルUI改善
  - 設定UIをダイアログ形式に統一し、ページルーティングを削除

- **コード品質改善** ([#734](https://github.com/t3-nico/boxlog-app/pull/734), [#733](https://github.com/t3-nico/boxlog-app/pull/733), [#723](https://github.com/t3-nico/boxlog-app/pull/723), [#722](https://github.com/t3-nico/boxlog-app/pull/722))
  - 技術的負債の特定とクリーンアップ
  - console.log削除とロガー統一（GAFA準拠）
  - @ts-nocheckを削除し型エラーを完全修正（728→0件）
  - エラーページの整理とGAFAベストプラクティス適用

- **認証フォームの改善** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - `<a>`タグを`next/link`の`Link`コンポーネントに変更

### 🐛 バグ修正 (Fixed)

- **ESLintエラー修正** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - @next/next/no-html-link-for-pages エラーの修正
  - React Hooks v7の存在しないルールのESLint無効化コメントを削除

- **型エラー修正** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - ViewTransition.tsxのframer-motion型エラー修正
  - PlanResizeHandle.tsxのRefObject型修正

- **スタイル修正** ([#716](https://github.com/t3-nico/boxlog-app/pull/716))
  - スクロールバー背景の透明化とセマンティックトークン統一

- **CI修正** ([#725](https://github.com/t3-nico/boxlog-app/pull/725), [#724](https://github.com/t3-nico/boxlog-app/pull/724))
  - license-check workflowのYAML構文エラー修正

### 🗑️ 削除 (Removed)

- **未使用コードの削除** ([#737](https://github.com/t3-nico/boxlog-app/pull/737), [#729](https://github.com/t3-nico/boxlog-app/pull/729))
  - react-syntax-highlighterを削除（未使用・セキュリティ改善）
  - AI関連コード・ヘルプ機能を完全削除

### ⚡ パフォーマンス (Performance)

- **CI/CD最適化** ([#731](https://github.com/t3-nico/boxlog-app/pull/731), [#726](https://github.com/t3-nico/boxlog-app/pull/726), [#720](https://github.com/t3-nico/boxlog-app/pull/720))
  - GitHub Actions最適化 - E2E軽量化・週次フルテスト・Codecov削除
  - Lighthouse CI実行時間の最適化とCI環境ベストプラクティス適用
  - Vercelデプロイ時間の最適化

### 🔒 セキュリティ (Security)

- **脆弱性対応** ([#737](https://github.com/t3-nico/boxlog-app/pull/737))
  - react-syntax-highlighterの削除による脆弱性対応

---

## 🔗 関連リンク

### Pull Requests

- [#737](https://github.com/t3-nico/boxlog-app/pull/737) - Release v0.6.0: Next.js 15 + React 19アップグレードとZod 3.24.1
- [#736](https://github.com/t3-nico/boxlog-app/pull/736) - docs: デザインシステム参照先をtheme.tsからglobals.cssに修正
- [#735](https://github.com/t3-nico/boxlog-app/pull/735) - refactor(styles): Material Design 3準拠のホバー・選択状態に全コンポーネント統一
- [#734](https://github.com/t3-nico/boxlog-app/pull/734) - refactor: Clean up code and identify remaining technical debt
- [#733](https://github.com/t3-nico/boxlog-app/pull/733) - refactor: console.log削除とロガー統一（GAFA準拠）
- [#732](https://github.com/t3-nico/boxlog-app/pull/732) - refactor: 角丸を8pxグリッドに統一（rounded-lg → rounded-xl）
- [#731](https://github.com/t3-nico/boxlog-app/pull/731) - perf(ci): GitHub Actions最適化 - E2E軽量化・週次フルテスト・Codecov削除
- [#730](https://github.com/t3-nico/boxlog-app/pull/730) - feat: 日本語フォント対応とInter Variable Font最適化
- [#729](https://github.com/t3-nico/boxlog-app/pull/729) - chore: AI関連コード・ヘルプ機能を完全削除
- [#728](https://github.com/t3-nico/boxlog-app/pull/728) - refactor: M3準拠のホバー状態に統一
- [#726](https://github.com/t3-nico/boxlog-app/pull/726) - perf(ci): Lighthouse CI実行時間の最適化とCI環境ベストプラクティス適用
- [#725](https://github.com/t3-nico/boxlog-app/pull/725) - fix(ci): Fix YAML syntax error in license-check workflow
- [#724](https://github.com/t3-nico/boxlog-app/pull/724) - fix(ci): Fix YAML syntax error in license-check workflow
- [#723](https://github.com/t3-nico/boxlog-app/pull/723) - refactor: @ts-nocheckを削除し型エラーを完全修正（728→0件）
- [#722](https://github.com/t3-nico/boxlog-app/pull/722) - refactor: エラーページの整理とGAFAベストプラクティス適用
- [#721](https://github.com/t3-nico/boxlog-app/pull/721) - refactor(ui): AppBar・Sidebarデザインの統一とモバイルUI改善
- [#720](https://github.com/t3-nico/boxlog-app/pull/720) - perf(build): Vercelデプロイ時間の最適化
- [#719](https://github.com/t3-nico/boxlog-app/pull/719) - refactor: 設定UIをダイアログ形式に統一し、ページルーティングを削除
- [#718](https://github.com/t3-nico/boxlog-app/pull/718) - refactor(styles): Pop系カラートークン統一とコントラスト比改善
- [#716](https://github.com/t3-nico/boxlog-app/pull/716) - fix(styles): スクロールバー背景の透明化とセマンティックトークン統一

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.5.0...v0.6.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
