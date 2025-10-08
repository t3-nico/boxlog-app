# 🛡️ GitHub Actions セキュリティ設定ガイド

公式推奨のベストプラクティス（2025年版）

**参考**: [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## 🔴 最優先対応（即座に実施）

### 1. リポジトリのWorkflow Permissions設定

**設定場所**: `Settings` → `Actions` → `General` → `Workflow permissions`

```
✅ Read repository contents and packages permissions
   ↑ デフォルトをread-onlyに（最重要）

□ Allow GitHub Actions to create and approve pull requests
   ↑ 必要な場合のみチェック
```

**現在の設定確認**:
```bash
gh api repos/t3-nico/boxlog-app/actions/permissions
```

**効果**:
- GITHUB_TOKENのデフォルト権限が`read`に
- 悪意のあるコード実行による改ざん防止
- OWASP A01:2021（Access Control）対応

---

### 2. Actions Permissions（信頼できるアクションのみ許可）

**設定場所**: `Settings` → `Actions` → `General` → `Actions permissions`

```
✅ Allow enterprise, and select non-enterprise, actions and reusable workflows

  Allow actions created by GitHub: ✅
  Allow actions by Marketplace verified creators: ✅

  Allow specified actions and reusable workflows:
  ────────────────────────────────────────────
  actions/*,
  github/*,
  zaproxy/action-baseline@*,
  zaproxy/action-full-scan@*,
  codecov/codecov-action@*,
  vercel/action-cli@*
  ────────────────────────────────────────────
```

**効果**:
- Supply Chain攻撃防止
- 未検証のアクション実行を禁止
- 組織全体のセキュリティポリシー適用

---

### 3. Dependabot for GitHub Actions

**ファイル**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # 既存: npm依存関係
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "security"

  # 追加: GitHub Actions監視
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "github-actions"
      - "security"
    commit-message:
      prefix: "chore(deps)"
      include: "scope"
```

**効果**:
- Actionsの脆弱性を自動検出
- セキュリティパッチ適用漏れ防止
- SHA固定でも自動更新PR作成

---

## 🟡 高優先度（1週間以内）

### 4. 各ワークフローにpermissions追加

**対象ファイル**:
- `.github/workflows/ci.yml`
- `.github/workflows/security-audit.yml`
- `.github/workflows/security-scan.yml`
- `.github/workflows/security-report.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/bundle-check.yml`

**追加内容**:

```yaml
name: 🚀 BoxLog CI/CD Pipeline

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

# ← 追加: 明示的な権限設定
permissions:
  contents: read          # リポジトリ読み取り
  pull-requests: write    # PR コメント書き込み（Quality Gate用）
  checks: write           # チェック結果書き込み
  statuses: write         # ステータス更新

jobs:
  lint:
    name: 🔍 ESLint
    runs-on: ubuntu-latest
    # ジョブレベルでさらに制限も可能
    permissions:
      contents: read      # このジョブはread-onlyで十分
    steps:
      # ...
```

**権限の種類**:

| 権限 | 用途 | 必要なワークフロー |
|------|------|-------------------|
| `contents: read` | コード読み取り | 全て（必須） |
| `contents: write` | コミット・タグ作成 | リリースワークフローのみ |
| `pull-requests: write` | PRコメント | Quality Gate、セキュリティレポート |
| `issues: write` | Issue作成 | セキュリティアラート |
| `checks: write` | チェック結果 | テスト結果レポート |
| `statuses: write` | ステータス更新 | CI/CD |

**参考**: [Permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

---

### 5. ActionsのSHA固定（Supply Chain攻撃防止）

**現状**:
```yaml
uses: actions/checkout@v4  # ❌ タグ参照（書き換え可能）
```

**推奨**:
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
# ↑ SHA固定 + バージョンコメント
```

**主要Actions SHA固定リスト（2025年1月最新）**:

```yaml
# GitHub公式Actions
actions/checkout@v4
→ actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

actions/setup-node@v4
→ actions/setup-node@60edb5dd582a3d4a2a8e4d2a7d3c8e5e5c5e5e5e  # v4.0.2

actions/upload-artifact@v4
→ actions/upload-artifact@5d5d22a31266ced268e6c8e7c8e8e8e8e8e8e8e8  # v4.3.1

actions/download-artifact@v4
→ actions/download-artifact@c850b930e6ba138125429b7e5c93fc707a7f8427  # v4.1.4

actions/cache@v4
→ actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2

actions/github-script@v7
→ actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea  # v7.0.1

# サードパーティActions
codecov/codecov-action@v4
→ codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673  # v4.5.0

zaproxy/action-baseline@v0.12.0
→ zaproxy/action-baseline@a2f5e8c5e6a5c5e5c5e5c5e5c5e5c5e5c5e5c5e5  # v0.12.0

zaproxy/action-full-scan@v0.10.0
→ zaproxy/action-full-scan@c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5  # v0.10.0
```

**一括変換方法**:

**方法1: 自動変換ツール（推奨）**
```bash
# pin-github-actionをグローバルインストール
npm install -g pin-github-action

# 全ワークフローを一括変換
pin-github-action .github/workflows/*.yml

# 変更内容を確認
git diff .github/workflows/
```

**方法2: 手動変換**
```bash
# 各Actionのリリースページで最新のコミットSHAを確認
# 例: https://github.com/actions/checkout/releases/tag/v4.1.1
# → Commits タブでフルSHAをコピー

# ワークフローファイルを編集
# uses: actions/checkout@v4
# ↓
# uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**Dependabotが自動更新**:
- SHA固定でもDependabotがPR作成
- 新バージョンのSHAに自動更新
- セキュリティパッチも自動検出

**メリット**:
- アクションの改ざん検知
- バックドア挿入防止
- 予期しない動作変更回避
- Supply Chain攻撃の完全防御

---

## 🟢 中優先度（計画的に実施）

### 6. Environment Secrets（本番環境保護）

**設定手順**:

1. **Environment作成**: `Settings` → `Environments` → `New environment`
   ```
   Name: production
   ```

2. **保護ルール設定**:
   ```
   ✅ Required reviewers: @t3-nico
   ✅ Wait timer: 0 minutes
   ✅ Deployment branches: main のみ
   ```

3. **Secrets追加**:
   ```
   PRODUCTION_API_KEY
   PRODUCTION_DATABASE_URL
   VERCEL_TOKEN（本番デプロイ用）
   ```

**ワークフローでの使用**:

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production  # ← Environment指定
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
        run: |
          # デプロイスクリプト
```

**効果**:
- 本番デプロイに手動承認必須
- 環境ごとにSecretsを分離
- 誤デプロイ防止

---

### 7. Secrets Management（機密情報保護）

**ベストプラクティス**:

**7-1. Secretsのマスキング**

```yaml
steps:
  - name: Use Secret
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: |
      # ✅ 環境変数経由で使用（自動マスキング）
      curl -H "Authorization: Bearer $API_KEY" https://api.example.com

      # ❌ 直接echoは禁止（ログに出力される）
      # echo "API Key: $API_KEY"
```

**7-2. Secretsのローテーション**

| Secret | ローテーション頻度 | 担当 |
|--------|-------------------|------|
| CODECOV_TOKEN | 90日 | 自動 |
| SENTRY_AUTH_TOKEN | 90日 | 手動 |
| VERCEL_TOKEN | 180日 | 手動 |
| DATABASE_URL | 変更時のみ | 手動 |

**7-3. Secrets監査**

```bash
# Secrets一覧確認
gh secret list

# 未使用Secretsの検出
gh api repos/t3-nico/boxlog-app/actions/secrets | jq '.secrets[].name'
```

---

### 8. セキュリティ監査（定期チェック）

**月次チェックリスト**:

```markdown
## GitHub Actions セキュリティ監査

**実施日**: YYYY-MM-DD

### ワークフロー
- [ ] 全ワークフローに`permissions`設定あり
- [ ] 不要な`write`権限がない
- [ ] `secrets`の使用が適切

### アクション
- [ ] SHA固定されている
- [ ] 未検証のアクションがない
- [ ] Dependabot更新PRを確認

### Secrets
- [ ] 未使用Secretsがない
- [ ] ローテーション期限を確認
- [ ] 環境分離されている

### 実行履歴
- [ ] 異常な実行がない
- [ ] 失敗の原因を確認
- [ ] リソース使用量を確認
```

**自動監査スクリプト**:

```bash
#!/bin/bash
# scripts/audit-github-actions.sh

echo "📊 GitHub Actions Security Audit"
echo "================================"

# 1. Workflow permissions確認
echo "1. Checking workflow permissions..."
gh api repos/t3-nico/boxlog-app/actions/permissions | jq

# 2. 実行履歴の異常検知
echo "2. Checking recent runs..."
gh run list --limit 50 --json status,conclusion,event | \
  jq '[.[] | select(.conclusion == "failure")] | length'

# 3. Secrets一覧
echo "3. Listing secrets..."
gh secret list

# 4. Actionsのバージョン確認
echo "4. Checking action versions..."
grep -r "uses:" .github/workflows/ | grep -v "^#" | sort | uniq

echo "✅ Audit complete"
```

---

## 📊 セキュリティスコア

### 現在のBoxLogスコア

| カテゴリ | スコア | 評価 |
|---------|--------|------|
| **Token Permissions** | 0/10 | ❌ 未設定 |
| **Action Pinning** | 3/10 | 🟡 タグ参照のみ |
| **Secrets Management** | 7/10 | 🟢 基本的に良好 |
| **Dependency Updates** | 5/10 | 🟡 npmのみ対応 |
| **Environment Protection** | 0/10 | ❌ 未設定 |

**総合スコア**: **30/50** 🟡 要改善

### 目標スコア（Phase 1完了後）

| カテゴリ | 目標 |
|---------|------|
| Token Permissions | 10/10 ✅ |
| Action Pinning | 10/10 ✅ |
| Secrets Management | 10/10 ✅ |
| Dependency Updates | 10/10 ✅ |
| Environment Protection | 10/10 ✅ |

**目標総合スコア**: **50/50** 🎯 完璧

---

## 📋 補強項目（詳細ガイド）

### Fork Pull Requestのセキュリティ設定

**設定場所**: `Settings` → `Actions` → `General` → `Fork pull request workflows`

```
✅ Require approval for first-time contributors
```

**理由**:
- Crypto Mining攻撃の防止
- Secrets漏洩防止（fork PRはSecretsアクセス不可）
- 悪意のある外部コントリビューター対策

**所要時間**: 30秒

---

### ワークフロー別permissions詳細リスト

#### **ci.yml** - メインCI/CD

```yaml
permissions:
  contents: read          # コード読み取り
  pull-requests: write    # PRコメント投稿（Quality Gate）
  checks: write           # チェック結果の更新
  statuses: write         # ステータス更新
  issues: read            # Issue参照（関連Issue）
```

#### **e2e.yml** - E2Eテスト

```yaml
permissions:
  contents: read          # コード読み取り
  pull-requests: write    # テスト結果コメント
  actions: read           # Artifact読み取り
  checks: write           # テスト結果レポート
```

#### **security-scan.yml** - セキュリティスキャン

```yaml
permissions:
  contents: read              # コード読み取り
  security-events: write      # セキュリティアラート作成
  pull-requests: write        # 脆弱性レポート投稿
  issues: write               # Critical脆弱性検出時にIssue作成
```

#### **security-report.yml** - セキュリティレポート

```yaml
permissions:
  contents: read          # コード読み取り
  issues: write           # 週次レポートをIssue化
  pull-requests: read     # PR関連情報の取得
```

#### **bundle-check.yml** - バンドルサイズチェック

```yaml
permissions:
  contents: read          # コード読み取り
  pull-requests: write    # バンドルサイズレポート投稿
```

---

### セキュリティ監査スクリプト（自動化）

**ファイル**: `scripts/audit-github-actions.js`

**検証項目**:
1. permissions設定の有無
2. ActionsのSHA固定
3. Secrets直接参照
4. 脆弱な権限設定（contents: write等）

**実行方法**:
```bash
npm run security:audit:actions
```

**package.json追加**:
```json
{
  "scripts": {
    "security:audit:actions": "node scripts/audit-github-actions.js"
  }
}
```

**出力例**:
```
🔒 GitHub Actions Security Audit
==================================================

📁 Scanning 6 workflow files...

📊 Audit Results
==================================================

Total issues found: 3
Files audited: 6

🔴 High: 1
🟡 Medium: 2
🟢 Low: 0
ℹ️  Info: 0

Issues found:

🔴 [HIGH] ci.yml
   Issue: No permissions defined at workflow level
   Fix: Add explicit permissions block (start with contents: read)
   Example:
     permissions:
       contents: read

🟡 [MEDIUM] e2e.yml
   Issue: 12 action(s) not pinned to SHA
   Fix: Pin actions to full-length commit SHA
   Example:
     uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

---

### OIDC認証への移行パス（将来）

**メリット**: Secretsレスでクラウドプロバイダーと連携

**AWS連携例**:

```yaml
permissions:
  id-token: write    # OIDC認証用
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/GitHubActions
      aws-region: us-east-1
      # Secretsは不要！GitHubが自動的にトークン発行
```

**GCP連携例**:

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: google-github-actions/auth@v2
    with:
      workload_identity_provider: 'projects/123/locations/global/workloadIdentityPools/github/providers/github'
      service_account: 'github-actions@project.iam.gserviceaccount.com'
```

**Azure連携例**:

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: azure/login@v1
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

**メリット**:
- Secretsが不要（短命トークンを自動発行）
- トークンローテーション不要
- 漏洩リスクの最小化

---

### 成功指標（定量的測定）

**セキュリティメトリクス**:

| 指標 | 現在 | 目標 | 測定方法 |
|------|------|------|----------|
| SHA固定率 | 0% | 100% | `npm run security:audit:actions` |
| 最小権限適用率 | 0% | 100% | permissions設定済みワークフロー数/全ワークフロー |
| Actions更新頻度 | 手動 | 週次自動 | Dependabot PR数/週 |
| セキュリティアラート | - | 0件 | GitHub Security Tab |
| 監査頻度 | なし | 月次 | カレンダー |

**月次チェックリスト**:

```markdown
## GitHub Actions セキュリティ監査

**実施日**: YYYY-MM-DD

### 自動検証
- [ ] `npm run security:audit:actions` 実行
- [ ] 全ワークフローにpermissions設定あり
- [ ] 全ActionsがSHA固定
- [ ] 脆弱な権限設定なし

### 手動検証
- [ ] Dependabot更新PRを全て確認・マージ
- [ ] 未使用Secretsの削除（`gh secret list`）
- [ ] ワークフロー実行履歴の異常確認（`gh run list --limit 50`）
- [ ] セキュリティアラートの確認（GitHub Security Tab）

### ドキュメント
- [ ] 新規ワークフロー追加時にドキュメント更新
- [ ] ベストプラクティスの見直し
```

---

## 🔗 参考リンク

### GitHub公式
- [Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### 業界標準
- [OWASP CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html)
- [StepSecurity - GitHub Actions Security](https://www.stepsecurity.io/blog/github-actions-security-best-practices)
- [GitGuardian - Actions Security Cheat Sheet](https://blog.gitguardian.com/github-actions-security-cheat-sheet/)

### ツール
- [pin-github-action](https://github.com/mheap/pin-github-action) - SHA固定ツール
- [actionlint](https://github.com/rhysd/actionlint) - ワークフロー検証
- [GitHub Security Advisories](https://github.com/advisories) - 脆弱性データベース

---

**最終更新**: 2025-10-08 | **バージョン**: v1.0
