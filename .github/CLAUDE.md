# .github/ - CI/CD・GitHub設定

DayoptプロジェクトのGitHub関連設定（一人開発最適化版）

## 🎯 自動化の範囲

- **Pre-commit**: lint-staged（Prettier + ESLint）
- **CI/CD**: GitHub Actions（ci.yml + bundle-check.yml）
- **Deploy**: Vercel自動デプロイ

---

## 🔧 Pre-commit Hook

### 実行内容

```bash
# .husky/pre-commit
npx lint-staged

# ステージング済みファイルのみ:
1. prettier --write
2. eslint --cache --fix
```

### 対象ファイル

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": [
    "prettier --write",
    "eslint --cache --fix"
  ]
}
```

---

## 🚨 Conventional Commits（推奨）

### コミットメッセージ型

```bash
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
refactor: リファクタリング
chore: 設定変更
```

**Note**: 自動検証なし。手動で形式に従う。

---

## 📊 GitHub Actions

### ワークフロー構成

```
.github/workflows/
├── ci.yml              # lint + typecheck + test + build
└── bundle-check.yml    # バンドルサイズ監視（PR時）
```

### ci.yml実行内容

```yaml
Phase 1: Quick Checks (並列)
  - ESLint + Prettier
  - TypeScript型チェック
  - ユニットテスト（カバレッジ計測のみ、必須ではない）

Phase 2: Quality Checks (並列)
  - Next.jsビルド
  - アクセシビリティ
  - Heavy Analysis
  - ドキュメント整合性

Phase 3: Quality Gate
  - 全チェック結果集約
  - PR Summary自動投稿

Note: カバレッジはCodecovで計測・可視化。fail_ci_if_error: false
```

---

## 🚀 デプロイフロー

### Vercel自動デプロイ

```bash
# GitHub統合により自動実行
- main ブランチへのpush → 本番デプロイ
- PR作成 → プレビューデプロイ
```

### 手動デプロイコマンド

```bash
npm run deploy:full  # 完全デプロイフロー
```

---

## 🔐 環境変数管理

### 構成

```bash
# ローカル開発
.env.local に直接記載

# GitHub Actions (CI)
GitHub Secrets

# 本番環境
Vercel Dashboard → Environment Variables
```

---

## 🔗 関連ドキュメント

- [ワークフロー詳細](./workflows/README.md)
- [コミット規約](../docs/development/COMMIT_RULES.md)
- Storybook → Docs/Guides/Commands

---

**📖 最終更新**: 2025-10-02 - 一人開発最適化
