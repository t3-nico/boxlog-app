# .eslint/ - ESLint 公式準拠設定

## 🎯 概要

BoxLog ESLintは **Next.js公式推奨設定** を採用しています。

```
公式ドキュメント = BoxLogの標準
→ 学習コスト0、メンテナンス0
```

## 📁 ディレクトリ構造

```
.eslint/
├── eslint.config.js    # メイン設定（ルート配置、Next.js公式準拠）
├── .eslintignore       # 除外設定
└── README.md          # このファイル
```

## 🚀 使い方

### 開発時

```bash
# コミット前チェック（3.6秒）
npm run lint

# 自動修正
npm run lint:fix
```

### 使用している公式設定

- **`next/core-web-vitals`** - Next.js公式推奨設定
  - React
  - TypeScript
  - アクセシビリティ
  - パフォーマンス最適化
  - ESLint推奨ルール

## 📊 パフォーマンス

- **実行時間**: 3.6秒
- **設定**: Next.js公式のみ（カスタムルール0個）
- **メンテナンス**: Next.jsチームが管理（自動更新）

## 🔗 関連ドキュメント

- **完全ガイド**: [`docs/ESLINT_OFFICIAL_MIGRATION.md`](../docs/ESLINT_OFFICIAL_MIGRATION.md)
- **AI品質基準**: [`.claude/code-standards.md`](../.claude/code-standards.md)
- **VSCodeスニペット**: [`.vscode/boxlog.code-snippets`](../.vscode/boxlog.code-snippets)

## 💡 哲学

**「独自ルールで管理」から「公式に準拠」へ**

- **学習コスト0**: Next.js/React/TypeScript公式ドキュメント = BoxLog標準
- **メンテナンス0**: Next.jsチームが管理、自動更新
- **品質保証**: 公式ベストプラクティスに自動準拠

---

**最終更新**: 2025-09-30
**Issue**: [#338 技術的失敗をしない開発環境](https://github.com/t3-nico/boxlog-app/issues/338)
