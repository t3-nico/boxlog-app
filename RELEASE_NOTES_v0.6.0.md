# Release v0.6.0

**リリース日**: 2025-12-01
**バージョン**: 0.6.0
**PR**: [#737](https://github.com/t3-nico/boxlog-app/pull/737)

## 🎯 概要

Next.js 15.5.6 + React 19へのアップグレードを実施。フレームワークの最新安定版への移行とセキュリティ改善を行いました。

---

## 📋 変更内容

### ✨ 新機能 (Added)

- React 19サポート（Next.js 15.5.6経由）

### 🔄 変更 (Changed)

- Next.js 14 → 15.5.6へアップグレード
- eslint-config-next 15.5.6でESLint 9との互換性確保
- @hookform/resolvers 3.10.0（Zod 3.x互換バージョン）
- 認証フォームの`<a>`タグを`next/link`の`Link`コンポーネントに変更

### 🐛 バグ修正 (Fixed)

- ESLint @next/next/no-html-link-for-pages エラーの修正（LoginForm、PasswordResetForm）
- React Hooks v7の存在しないルールのESLint無効化コメントを削除
- ViewTransition.tsxのframer-motion型エラー修正
- PlanResizeHandle.tsxのRefObject型修正

### 🗑️ 削除 (Removed)

- 未使用のreact-syntax-highlighterを削除（セキュリティ改善）

### 🔒 セキュリティ (Security)

- react-syntax-highlighterの削除による脆弱性対応

---

## 🔗 関連リンク

### Pull Requests

- メインPR: [#737](https://github.com/t3-nico/boxlog-app/pull/737) - Release v0.6.0: Next.js 15 + React 19アップグレードとZod 3.24.1

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.5.0...v0.6.0

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
