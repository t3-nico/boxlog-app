# Vercel デプロイメント設定

## 概要


## 設定手順

### 1. ビルド設定

`vercel.json`で以下を設定：

```json
{
  "buildCommand": "yarn build:fallback",
  "devCommand": "yarn dev:fallback",
  "installCommand": "yarn install",
  "framework": "nextjs"
}
```

### 2. 環境変数設定

Vercelダッシュボードで以下の環境変数を設定してください：

#### Supabase設定

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー
- `SUPABASE_JWT_SECRET`: SupabaseのJWTシークレット

#### PostgreSQL設定

- `POSTGRES_URL`: PostgreSQL接続URL
- `POSTGRES_USER`: PostgreSQLユーザー名
- `POSTGRES_HOST`: PostgreSQLホスト名
- `POSTGRES_PASSWORD`: PostgreSQLパスワード
- `POSTGRES_DATABASE`: データベース名
- `POSTGRES_PRISMA_URL`: Prisma用接続URL
- `POSTGRES_URL_NON_POOLING`: 非プーリング接続URL

#### その他設定

- `SKIP_AUTH_IN_DEV`: `false` (プロダクションでは必ずfalse)

### 3. Git Submodule対応

Vercelでサブモジュールを使用する場合：

1. Vercelダッシュボード → Settings → Git
2. "Include git submodules" を有効化
3. または、ビルド前にsubmoduleを手動で初期化する場合は`vercel.json`に追加：

```json
{
  "buildCommand": "git submodule update --init --recursive && yarn build:fallback"
}
```

### 4. デプロイメント確認

- 環境変数が正しく設定されていることを確認
- アプリケーションが正常に起動することを確認

## トラブルシューティング

### ビルドエラー: "op: command not found"

→ `vercel.json`の`buildCommand`を`yarn build:fallback`に設定

### 環境変数エラー

→ Vercelダッシュボードで環境変数が正しく設定されているか確認

### Submoduleエラー

→ "Include git submodules"を有効化するか、ビルドコマンドでsubmodule初期化を追加

## ローカルテスト

Vercel環境をローカルでテストする場合：

```bash
# フォールバックモードでビルド
yarn build:fallback

# フォールバックモードで起動
yarn start:fallback
```

---

**最終更新**: 2025-09-18
