# 1Password Developer Security セットアップガイド

## 概要

BoxLogアプリでは、機密情報の管理に1Password Developer Securityを使用します。
これにより、環境変数やAPIキーなどの秘密情報を安全に管理できます。

## 前提条件

- 1Passwordアカウント（個人またはチーム）
- macOS/Linux/Windows環境
- BoxLogプロジェクトへのアクセス権限

## セットアップ手順

### 1. 1Password CLIのインストール

#### macOS (Homebrew)
```bash
brew install --cask 1password/tap/1password-cli
```

#### その他のプラットフォーム
[1Password CLI公式ダウンロード](https://developer.1password.com/docs/cli/get-started/#install)からインストール

### 2. 1Passwordへのサインイン

```bash
# 初回サインイン
op signin

# アカウント情報を確認
op account list
```

### 3. 開発用Vaultの作成（チーム環境の場合）

```bash
# 開発用Vaultを作成
op vault create "BoxLog Development"
```

### 4. 秘密情報の登録

#### Supabase設定の登録
```bash
op item create \
  --category="API Credential" \
  --title="BoxLog Supabase" \
  --vault="BoxLog Development" \
  url[text]="your-supabase-url" \
  anon_key[password]="your-anon-key" \
  service_role_key[password]="your-service-role-key"
```

#### PostgreSQL設定の登録
```bash
op item create \
  --category="Database" \
  --title="BoxLog PostgreSQL" \
  --vault="BoxLog Development" \
  url[text]="your-postgres-url" \
  user[text]="your-postgres-user" \
  password[password]="your-postgres-password" \
  database[text]="your-database-name" \
  host[text]="your-postgres-host"
```

### 5. アプリケーション設定

`.env.local`ファイルを1Password参照形式に更新：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="op://BoxLog Development/BoxLog Supabase/url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="op://BoxLog Development/BoxLog Supabase/anon_key"
SUPABASE_SERVICE_ROLE_KEY="op://BoxLog Development/BoxLog Supabase/service_role_key"

# PostgreSQL
POSTGRES_URL="op://BoxLog Development/BoxLog PostgreSQL/url"
POSTGRES_USER="op://BoxLog Development/BoxLog PostgreSQL/user"
POSTGRES_PASSWORD="op://BoxLog Development/BoxLog PostgreSQL/password"
POSTGRES_HOST="op://BoxLog Development/BoxLog PostgreSQL/host"
POSTGRES_DATABASE="op://BoxLog Development/BoxLog PostgreSQL/database"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. 開発サーバーの起動

```bash
# 1Password経由で開発サーバー起動
npm run dev

# または直接
op run -- next dev
```

## 使用方法

### 開発コマンド

すべての開発コマンドは自動的に1Password経由で実行されます：

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run start    # 本番サーバー起動
npm run lint     # リンティング
npm test         # テスト実行
```

### 秘密情報の確認

```bash
# 登録済みアイテムの一覧
op item list --vault="BoxLog Development"

# 特定の秘密情報の確認
op item get "BoxLog Supabase" --vault="BoxLog Development"

# 環境変数の値を直接確認
op run --env-file=.env.local -- printenv NEXT_PUBLIC_SUPABASE_URL
```

### 秘密情報の追加・更新

```bash
# 新しい秘密情報の追加
op item create \
  --category="API Credential" \
  --title="New Service" \
  --vault="BoxLog Development" \
  api_key[password]="your-api-key"

# 既存情報の更新
op item edit "BoxLog Supabase" \
  --vault="BoxLog Development" \
  anon_key[password]="new-anon-key"
```

## トラブルシューティング

### よくある問題

#### 1. "op: command not found"
```bash
# CLIが正しくインストールされているか確認
which op
op --version

# パスを確認
echo $PATH
```

#### 2. "authentication required"
```bash
# 再度サインイン
op signin

# アカウント状態を確認
op account list
```

#### 3. "item not found"
```bash
# アイテムが正しいVaultに存在するか確認
op item list --vault="BoxLog Development"

# Vault名が正確か確認
op vault list
```

#### 4. 環境変数が読み込まれない
```bash
# .env.localの内容を確認
cat .env.local

# 1Passwordでの参照形式が正しいか確認
op run --env-file=.env.local -- printenv | grep SUPABASE
```

## セキュリティのベストプラクティス

1. **Vaultの分離**: 開発・ステージング・本番環境ごとに別々のVaultを使用
2. **アクセス権限**: 必要最小限の権限のみを付与
3. **定期的なローテーション**: APIキーやパスワードの定期更新
4. **監査ログ**: 1Passwordの Activity Log を定期的に確認
5. **バックアップ**: 重要な秘密情報は複数の場所に安全に保管

## 🛠️ 開発ツールとスクリプト

### 開発チーム管理ツール

```bash
# 包括的な開発ツール（推奨）
./scripts/1password-dev-tools.sh status      # 接続状態確認
./scripts/1password-dev-tools.sh health      # 健全性チェック
./scripts/1password-dev-tools.sh team-setup  # 新メンバーセットアップ
./scripts/1password-dev-tools.sh audit       # セキュリティ監査
```

### VS Code統合

BoxLogプロジェクトはVS Code統合設定済み：
- **拡張機能**: 1Password for VS Code (自動推奨)
- **タスク統合**: Ctrl/Cmd+Shift+P → "Tasks: Run Task" → "🔐 Dev Server"
- **環境変数**: VS Code統合ターミナルで自動設定

### シェルプラグイン

```bash
# GitHub CLI、AWS CLI等の認証を1Password経由に
./scripts/setup-shell-plugins.sh
```

### セキュリティ監視

```bash
# 定期的なセキュリティチェック
./scripts/security-monitor.sh

# ログは logs/security/ に保存
# Cronジョブで定期実行推奨：
# 0 9 * * * cd /path/to/boxlog-app && ./scripts/security-monitor.sh
```

## 🚀 CI/CD統合

### GitHub Actions

CI/CDパイプラインでの1Password使用方法：
- **セットアップガイド**: [`docs/CI_CD_SETUP.md`](./CI_CD_SETUP.md)
- **Service Account**: 限定権限でのCI/CD専用アカウント
- **自動デプロイ**: 本番環境への安全なデプロイ

## 📊 監視とメンテナンス

### セキュリティ監査項目

1. **アクセスログ**: 1Password Activity Log の定期確認
2. **権限管理**: 不要なアクセス権限の削除
3. **トークンローテーション**: Service Account Token の定期更新
4. **ファイル権限**: 機密ファイルの適切な権限設定

### 推奨メンテナンススケジュール

- **毎日**: 自動セキュリティ監視スクリプト実行
- **毎週**: チーム全体でのアクセス権限レビュー
- **毎月**: Service Account Token ローテーション
- **四半期**: 包括的なセキュリティ監査

## 🎯 パフォーマンス最適化

### 高速化設定

```bash
# 1Password CLIキャッシュ設定
export OP_CACHE=true

# 複数セッション管理
export OP_SESSION_my="your-session-token"
```

### バッチ処理

```bash
# 複数の環境変数を一度に処理
op run --env-file=.env.local -- npm run build
```

## 参考リンク

- [1Password Developer Documentation](https://developer.1password.com/)
- [1Password CLI Reference](https://developer.1password.com/docs/cli/reference/)
- [Secret References](https://developer.1password.com/docs/cli/secret-references/)
- [Service Accounts](https://developer.1password.com/docs/service-accounts/)
- [GitHub Actions Integration](https://developer.1password.com/docs/ci-cd/github-actions/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=1Password.op-vscode)

---

**作成日**: 2025-08-05  
**更新日**: 2025-08-05  
**バージョン**: 2.0 - フル機能統合版