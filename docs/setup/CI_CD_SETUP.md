
> **⚠️ 重要**: このドキュメントは**参考情報**です。

## 📋 現在の環境変数管理方法

| 環境 | 管理方法 | 参照先 |
|------|---------|--------|
| **CI/CD (GitHub Actions)** | GitHub Secrets | [.github/workflows/main.yml](.github/workflows/main.yml) |
| **本番環境 (Vercel)** | Vercel Dashboard | [vercel.com](https://vercel.com) |

---

## 概要


**注意**: この方法は現在実装されていません。導入を検討する際の参考資料としてご利用ください。

## 前提条件

- GitHub Actions の利用権限
- BoxLog Development Vault への アクセス権限

## セットアップ手順



```bash
# Settings → Developer Tools → Service Accounts → Create Service Account

# Service Account 情報:
Name: BoxLog CI/CD
Description: BoxLog GitHub Actions用のサービスアカウント
Permissions:
  - BoxLog Development Vault: Read access
```

#### 1.2 Service Account Token の取得

```bash
# Web UIでService Accountを作成すると、tokenが表示されます
# 例: ops_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# このtokenを安全に保管してください
```

### 2. GitHub Secrets の設定

#### 2.1 Repository Secrets に追加

```bash
# GitHub Repository → Settings → Secrets and variables → Actions

# 追加するSecret:
OP_SERVICE_ACCOUNT_TOKEN: ops_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. GitHub Actions Workflow の設定

`/.github/workflows/ci.yml` ファイルを作成：

```yaml

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    name: 🧪 Test & Build
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

        with:
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: \${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: 'op://BoxLog Development/BoxLog Supabase/url'
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'op://BoxLog Development/BoxLog Supabase/anon_key'
          SUPABASE_SERVICE_ROLE_KEY: 'op://BoxLog Development/BoxLog Supabase/service_role_key'
          POSTGRES_URL: 'op://BoxLog Development/BoxLog PostgreSQL/url'

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
        run: npm run build:fallback
        env:
          NODE_ENV: production
```

### 4. セキュリティスキャンの追加

```yaml
security-scan:
  name: 🔍 Security Scan
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

#### 1. Service Account Token エラー

```bash
# エラー: "Invalid service account token"
# 解決策:
1. Service Account Tokenが正しく設定されているか確認
2. TokenがexpireしていないかService Account画面で確認
3. GitHub Secretsの値を再設定
```

#### 2. Vault アクセスエラー

```bash
# エラー: "Access denied to vault"
# 解決策:
1. Service AccountにBoxLog Development Vaultへの読み取り権限があるか確認
2. Vault名が正確か確認（大文字小文字、スペース等）
```

#### 3. Secret参照エラー

```bash
# エラー: "Item not found in vault"
# 解決策:
2. 参照パス形式が正確か確認: "op://Vault名/アイテム名/フィールド名"
```

## セキュリティのベストプラクティス

1. **最小権限の原則**: Service Accountには必要最小限の権限のみ付与
2. **Token管理**: Service Account Tokenは定期的にローテーション
4. **分離**: 開発・ステージング・本番環境ごとに別々のService Account使用

## 参考リンク

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)

---

**作成日**: 2025-08-05  
**更新日**: 2025-08-05  
**バージョン**: 1.0

---

**最終更新**: 2025-09-18
