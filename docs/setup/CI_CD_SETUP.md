# CI/CD セットアップガイド

GitHub ActionsとVercelを使用した自動デプロイとテストの設定方法

## 📋 概要

BoxLogでは以下のCI/CDパイプラインを使用しています：

- **GitHub Actions**: テスト・型チェック・Lint・セキュリティスキャン
- **Vercel**: 自動デプロイ（プレビュー・本番環境）

## 🔐 GitHub Secrets 設定

### 必須環境変数

GitHub Repository → Settings → Secrets and variables → Actions から以下を設定：

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
```

#### PostgreSQL
```
POSTGRES_URL
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

#### Sentry
```
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

#### Vercel (オプション)
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 📝 ワークフロー設定

### 1. PR時の自動テスト

`.github/workflows/pr-check.yml`:

```yaml
name: 🧪 PR Check
on:
  pull_request:
    branches: [main, dev]

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run linting
        run: npm run lint

      - name: 🧪 Run type check
        run: npm run typecheck

      - name: 🧪 Run tests
        run: npm run test
        env:
          CI: true
```

### 2. デプロイワークフロー

`.github/workflows/deploy.yml`:

```yaml
name: 🚀 Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run linting
        run: npm run lint

      - name: 🧪 Run type check
        run: npm run typecheck

      - name: 🧪 Run tests
        run: npm run test
        env:
          CI: true

      - name: 🏗️ Build application
        run: npm run build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### 3. セキュリティスキャン

`.github/workflows/security.yml`:

```yaml
name: 🔍 Security Scan
on:
  schedule:
    - cron: '0 0 * * 0' # 毎週日曜日
  workflow_dispatch:

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run security audit
        run: npm audit --audit-level=high

      - name: 🔍 Check for secrets in code
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

## 🚀 Vercel 自動デプロイ

### セットアップ手順

1. **Vercel プロジェクト作成**
   - https://vercel.com でプロジェクト作成
   - GitHubリポジトリと連携

2. **環境変数設定**
   - Vercel Dashboard → Settings → Environment Variables
   - GitHub Secretsと同じ値を設定
   - Production / Preview / Development ごとに設定

3. **自動デプロイ設定**
   - `main` ブランチ → Production
   - その他のブランチ → Preview
   - プルリクエスト → Preview (自動)

### Vercel CLI での手動デプロイ

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

## 使用方法

### 手動トリガー

```bash
# GitHub Repository → Actions → 該当のワークフロー → Run workflow
```

### 自動トリガー

- `main` または `dev` ブランチへのプッシュ
- `main` または `dev` ブランチへのプルリクエスト

## トラブルシューティング

### よくある問題

#### 1. 環境変数が見つからない

```bash
# エラー: "Environment variable not found"
# 解決策:
1. GitHub Secrets が正しく設定されているか確認
2. ワークフローファイルで env: に環境変数を追加
3. Secrets名が正確か確認（大文字小文字、スペース等）
```

#### 2. ビルドエラー

```bash
# エラー: "Build failed"
# 解決策:
1. ローカルで npm run build が成功するか確認
2. 型エラーがないか npm run typecheck で確認
3. .env.example と同じ環境変数が GitHub Secrets にあるか確認
```

#### 3. Vercel デプロイエラー

```bash
# エラー: "Deployment failed"
# 解決策:
1. Vercel Dashboard で Environment Variables を確認
2. Build Command が正しいか確認（npm run build）
3. Output Directory が正しいか確認（.next）
```

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - GitHub Secrets を使用（コードにハードコーディングしない）
   - 本番・プレビュー環境で異なる値を使用

2. **最小権限の原則**
   - 必要な環境変数のみ設定
   - トークンは定期的にローテーション

3. **セキュリティスキャン**
   - 定期的な npm audit 実行
   - Dependabot で依存関係の自動更新

4. **分離**
   - 開発・ステージング・本番環境ごとに環境変数を分離

## 参考リンク

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**作成日**: 2025-10-02
**更新日**: 2025-10-02
