# Supabase ローカル環境セットアップガイド

BoxLogのローカル開発環境でSupabaseを起動する方法を説明します。

**所要時間**: 15分（初回）/ 5分（2回目以降）

---

## 🎯 概要

ローカル環境でDockerを使ってSupabaseを起動し、インターネット接続なしでDB開発ができるようにします。

**メリット:**

- ✅ オフラインで開発可能
- ✅ 本番環境に影響を与えない
- ✅ 何度でもリセット・やり直しができる
- ✅ マイグレーション管理が自動

---

## 📋 前提条件

### 必須ソフトウェア

1. **Docker Desktop** （必須）
   - インストール: https://www.docker.com/products/docker-desktop/
   - macOS M1/M2/M3: ARM64版をダウンロード
   - インストール後、Docker Desktopを起動しておく

2. **Supabase CLI**

   ```bash
   # Homebrew（macOS）
   brew install supabase/tap/supabase

   # 確認
   supabase --version
   ```

---

## 🚀 セットアップ手順

### Step 1: Docker Desktop の起動確認

```bash
# Dockerが起動しているか確認
docker info

# ✅ 正常に表示されればOK
# ❌ エラーが出る場合は、Docker Desktopアプリを起動
```

---

### Step 2: Supabase の初期化（初回のみ）

```bash
# プロジェクトディレクトリで実行
cd /path/to/boxlog-app

# Supabase初期化（既に実行済みの場合はスキップ）
supabase init
```

**生成されるファイル:**

- `supabase/config.toml` - Supabase設定ファイル
- `supabase/migrations/` - マイグレーションファイル格納場所

---

### Step 3: Supabase の起動

```bash
# ローカルSupabaseを起動（初回は5分、2回目以降は30秒）
supabase start
```

**初回起動時:**

- Dockerイメージのダウンロード（~1GB）
- データベース・認証・ストレージなど全サービス起動
- 完了するまで5分ほどかかります

**起動完了すると、以下の情報が表示されます:**

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
    Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
     Mailpit URL: http://127.0.0.1:54324
 Publishable key: <anon-key>
      Secret key: <service-role-key>
```

---

### Step 4: 環境変数の設定

#### 4-1. `.env.local` ファイルを作成

```bash
# .env.exampleをコピー
cp .env.example .env.local
```

#### 4-2. ローカル環境の値を設定

`.env.local` を開いて、以下の値を設定：

```bash
# ========================
# 🔐 Supabase Configuration（ローカル環境）
# ========================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start で表示されたPublishable key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start で表示されたSecret key>
```

**重要:**

- ローカル環境のキーは固定値なので、チーム内で共有してOK
- 本番環境のキーは絶対に `.env.local` にコミットしない

---

### Step 5: 動作確認

#### 5-1. Supabase Studio を開く

ブラウザで http://127.0.0.1:54323 にアクセス

**確認項目:**

- ✅ Supabase Studio のダッシュボードが表示される
- ✅ 「Table Editor」で `tags` テーブルが確認できる

#### 5-2. Next.js アプリを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

**期待される動作:**

- ✅ エラーなくアプリが起動
- ✅ Supabase接続エラーが出ない

---

## 🛠️ よく使うコマンド

### 起動・停止

```bash
# Supabaseを起動
supabase start

# Supabaseを停止
supabase stop

# Supabaseを再起動
supabase restart

# Supabaseのステータス確認
supabase status
```

---

### データベース操作

```bash
# データベースをリセット（全データ削除 + マイグレーション再適用）
supabase db reset

# マイグレーションファイルを新規作成
supabase migration new <migration_name>

# マイグレーション履歴を確認
supabase migration list

# Supabase Studio を開く
open http://127.0.0.1:54323
```

---

### ログ確認

```bash
# 全サービスのログを表示
supabase logs

# 特定サービスのログのみ表示
supabase logs db        # PostgreSQL
supabase logs auth      # Supabase Auth
supabase logs storage   # Storage
```

---

## 🚨 トラブルシューティング

### エラー: `Docker is not running`

**原因**: Docker Desktop が起動していない

**解決策**:

1. Docker Desktop アプリを起動
2. メニューバーに Docker アイコンが表示されることを確認
3. `docker info` で確認

---

### エラー: `Port 54321 is already in use`

**原因**: 既にSupabaseが起動中、または別のアプリがポートを使用

**解決策**:

```bash
# 既存のSupabaseを停止
supabase stop

# それでもエラーが出る場合、ポート使用状況を確認
lsof -i :54321

# 該当プロセスを停止してから再起動
supabase start
```

---

### エラー: `Applying migration ... failed`

**原因**: マイグレーションファイルにSQLエラーがある

**解決策**:

```bash
# エラーメッセージを確認
supabase start --debug

# データベースをリセットしてやり直し
supabase db reset
```

---

### データベースが空っぽ

**原因**: マイグレーションが適用されていない

**解決策**:

```bash
# マイグレーションを再適用
supabase db reset

# マイグレーション履歴を確認
supabase migration list
```

---

## 🔗 次のステップ

ローカル環境が動作したら、次は本番環境の構築に進みましょう：

1. **Staging/Production環境の構築**
   - `docs/setup/SUPABASE_ENV_SETUP.md` （作成予定）
   - Supabase Dashboardでプロジェクト作成
   - Vercel環境変数設定

2. **マイグレーション管理**
   - `docs/development/DB_MIGRATION.md` （作成予定）
   - 開発→ステージング→本番へのデプロイフロー

3. **Issue #601 の Phase 2 へ進む**
   - https://github.com/t3-nico/boxlog-app/issues/601

---

## 📚 参考リンク

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

**📖 最終更新**: 2025-10-24 | **バージョン**: v1.0 - 初版
