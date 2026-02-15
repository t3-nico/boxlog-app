# Environment Secrets 設定ガイド

GitHub ActionsのEnvironment機能を使用したSecrets管理

**関連**: [Issue #500 - Phase 3](https://github.com/t3-nico/dayopt/issues/500)

---

## 📋 概要

GitHub ActionsのEnvironment機能を使用して、環境ごとにSecretsを分離し、
本番環境への変更に承認プロセスを追加します。

### メリット

✅ **環境分離** - 開発/テスト/本番でSecretsを分離
✅ **手動承認** - 本番環境への変更に承認必須
✅ **誤デプロイ防止** - ブランチ制限で本番保護
✅ **監査ログ** - デプロイ履歴の追跡

---

## 🏗️ Environment構成

### 1. Development（開発環境）

- **用途**: PR、devブランチのテスト
- **承認**: 不要
- **ブランチ制限**: なし

### 2. Staging（ステージング環境）

- **用途**: mainブランチのテスト
- **承認**: 不要
- **ブランチ制限**: main, dev

### 3. Production（本番環境）

- **用途**: 本番デプロイ（将来）
- **承認**: **必須**（@t3-nico）
- **ブランチ制限**: main のみ

---

## 🔧 現在の実装状況

### Dayoptのデプロイ方式

**現在**: Vercel GitHubインテグレーション（自動デプロイ）

- main ブランチ → 本番デプロイ
- PR → プレビューデプロイ

**GitHub Actionsの役割**: CI/CD（テスト・ビルド検証のみ）

### Secrets使用状況

| Secret                          | 用途                     | Environment        |
| ------------------------------- | ------------------------ | ------------------ |
| `CODECOV_TOKEN`                 | カバレッジレポート       | CI専用（環境不要） |
| `NEXT_PUBLIC_SUPABASE_URL`      | ビルド時環境変数         | Development        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ビルド時環境変数         | Development        |
| `LHCI_GITHUB_APP_TOKEN`         | Lighthouse CI            | CI専用             |
| `SENTRY_DSN`                    | Sentry検証（オプション） | Development        |

---

## 📝 Phase 3の実装方針

Dayoptは**Vercel自動デプロイ**を使用しているため、
GitHub ActionsのEnvironment Secretsは**CI/CDビルド検証用**として活用します。

### 実装内容

#### 1. **CI/CDワークフローでのEnvironment使用**

現在の`ci.yml`と`e2e.yml`にEnvironment保護を追加：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    environment: development # ← 追加
    steps:
      # ... ビルドステップ
```

**効果**:

- Secretsの環境分離（開発用Supabase等）
- ビルド検証時のSecrets使用を明示化

#### 2. **Low severity警告の解消**

監査スクリプトの警告:

```
🟢 [LOW] ci.yml
   Issue: Direct secret access without environment protection
```

→ `environment: development` を追加することで解消

---

## 🚀 セットアップ手順

### Step 1: Development Environment作成

**GitHub Settings** → **Environments** → **New environment**

```
Name: development

Environment protection rules:
□ Required reviewers (不要)
□ Wait timer (不要)
□ Deployment branches: All branches

Environment secrets:
- NEXT_PUBLIC_SUPABASE_URL (開発用)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (開発用)
```

### Step 2: Staging Environment作成（オプション）

```
Name: staging

Environment protection rules:
□ Required reviewers (不要)
□ Wait timer (不要)
✅ Deployment branches: main, dev

Environment secrets:
- (本番に近い設定)
```

### Step 3: Production Environment作成（将来用）

```
Name: production

Environment protection rules:
✅ Required reviewers: @t3-nico
✅ Wait timer: 0 minutes
✅ Deployment branches: main のみ

Environment secrets:
- VERCEL_TOKEN (将来のGitHub Actionsデプロイ用)
- PRODUCTION_DATABASE_URL (将来用)
```

---

## 💻 ワークフロー適用例

### ci.yml - Build job

```yaml
jobs:
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    environment: development # ← 追加
    needs: [lint, typecheck, unit-tests]

    steps:
      - name: 🏗️ Build application
        run: npm run build
        env:
          # Environment Secretsから自動取得
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### e2e.yml - E2E tests

```yaml
jobs:
  e2e-tests:
    name: 🌐 E2E Tests
    runs-on: ubuntu-latest
    environment: development # ← 追加

    steps:
      - name: 🧪 Run Playwright tests
        run: npm run test:e2e
        env:
          # Environment Secretsから自動取得
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
```

---

## 🔒 セキュリティ効果

### Before（Phase 2まで）

```yaml
# リポジトリレベルのSecrets使用
env:
  TOKEN: ${{ secrets.API_TOKEN }}
# → 全ブランチ・全ワークフローからアクセス可能
```

### After（Phase 3）

```yaml
# Environment Secretsに変更
jobs:
  deploy:
    environment: production # ← 承認必須
    steps:
      - env:
          TOKEN: ${{ secrets.API_TOKEN }}
# → mainブランチのみ、@t3-nicoの承認後のみアクセス可能
```

---

## 📊 監査スクリプト対応

Phase 3完了後の監査結果:

```
🔒 GitHub Actions Security Audit
==================================================

Total issues found: 0
Files audited: 6

🔴 High: 0
🟡 Medium: 0
🟢 Low: 0

✅ No security issues found!
```

**セキュリティスコア**: **50/50** 🎯 完璧！

---

## 🔗 参考リンク

- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Environment Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment)
- [Required Reviewers](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#required-reviewers)

---

**最終更新**: 2025-10-08 | **バージョン**: v1.0 - Phase 3実装ガイド

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: Dayopt 開発チーム
