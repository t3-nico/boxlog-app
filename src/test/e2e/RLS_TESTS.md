# RLS E2E Tests

Row Level Security (RLS) の動作を検証する E2E テストドキュメント。

## 📋 目次

- [概要](#概要)
- [セットアップ](#セットアップ)
- [テストケース](#テストケース)
- [実行方法](#実行方法)
- [トラブルシューティング](#トラブルシューティング)

## 🎯 概要

Supabase の Row Level Security (RLS) が正しく動作することを検証します。

### テスト対象テーブル

- **profiles**: ユーザープロフィールテーブル
- **login_attempts**: ログイン試行記録テーブル

### 検証項目

- ✅ ユーザーは自分のデータのみアクセス可能
- ✅ 他のユーザーのデータにはアクセス不可
- ✅ 未認証ユーザーの制限
- ✅ 管理者権限の動作

## 🚀 セットアップ

### 1. テスト用ユーザーアカウント作成

RLS テストには 2 つのテストユーザーが必要です。

**推奨設定:**

- MFA（多要素認証）を無効にする
- 通常のメールアドレスとパスワードでログイン可能
- 実際のデータが含まれていないアカウント

**作成方法:**

1. Supabase Dashboard にアクセス
2. Authentication → Users → Add user
3. 以下の 2 ユーザーを作成:
   - User A: `test-user-a@example.com` / `password123`
   - User B: `test-user-b@example.com` / `password456`

または、ローカル環境で SQL 実行:

```sql
-- ユーザーA作成
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test-user-a@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- ユーザーB作成
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test-user-b@example.com',
  crypt('password456', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### 2. 環境変数設定

`.env.local` に以下を追加:

```bash
# RLS テスト用ユーザーA
TEST_USER_A_EMAIL=test-user-a@example.com
TEST_USER_A_PASSWORD=password123

# RLS テスト用ユーザーB
TEST_USER_B_EMAIL=test-user-b@example.com
TEST_USER_B_PASSWORD=password456

# 管理者テスト用（オプション）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ セキュリティ注意:**

- `.env.local` は `.gitignore` で除外されています
- 本番環境の認証情報は使用しないでください
- テスト専用アカウントを使用してください

### 3. 開発サーバー起動

```bash
# 別ターミナルで開発サーバーを起動
npm run dev

# または AI が起動する場合は PORT=4000
PORT=4000 npm run dev
```

## 📝 テストケース

### profiles テーブル (6 ケース)

**ファイル**: `src/test/e2e/rls-profiles.spec.ts`

1. ✅ ユーザーA は自分のプロフィールを閲覧できる
2. ✅ ユーザーA は他人（ユーザーB）のプロフィールを閲覧できない
3. ✅ ユーザーA は自分のプロフィールを更新できる
4. ✅ ユーザーA は他人（ユーザーB）のプロフィールを更新できない
5. ✅ ユーザーA は自分のプロフィールを削除できる
6. ✅ ユーザーA は他人（ユーザーB）のプロフィールを削除できない

### login_attempts テーブル (5 ケース)

**ファイル**: `src/test/e2e/rls-login-attempts.spec.ts`

1. ✅ 通常ユーザーは login_attempts を閲覧できない
2. ✅ システムはログイン試行を記録できる（未認証でも OK）
3. ✅ 管理者（Service Role）はすべての login_attempts を閲覧できる
4. ✅ 通常ユーザーは login_attempts を更新できない
5. ✅ 通常ユーザーは login_attempts を削除できない

## 🧪 実行方法

### 基本的な実行

```bash
# RLS テストのみ実行
npx playwright test src/test/e2e/rls-profiles.spec.ts
npx playwright test src/test/e2e/rls-login-attempts.spec.ts

# 両方のテストを実行
npx playwright test src/test/e2e/rls-*.spec.ts

# すべての E2E テストを実行
npm run test:e2e
```

### インタラクティブモード

```bash
# UI モード（推奨）
npx playwright test src/test/e2e/rls-profiles.spec.ts --ui

# ヘッドありモード（ブラウザを表示）
npx playwright test src/test/e2e/rls-profiles.spec.ts --headed

# デバッグモード
npx playwright test src/test/e2e/rls-profiles.spec.ts --debug
```

### 特定のテストケースのみ実行

```bash
# テスト名でフィルタ
npx playwright test -g "ユーザーAは自分のプロフィールを閲覧できる"

# ファイルとテスト名の組み合わせ
npx playwright test src/test/e2e/rls-profiles.spec.ts -g "閲覧"
```

## 🔧 トラブルシューティング

### 問題 1: 認証エラー

```
Error: ユーザーAのログインに失敗しました
```

**解決方法:**

1. `.env.local` に `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD` が設定されているか確認
2. Supabase でテストユーザーが存在するか確認
3. MFA が無効になっているか確認

### 問題 2: RLS ポリシーエラー

```
Error: new row violates row-level security policy
```

**解決方法:**

1. Supabase で RLS ポリシーが正しく設定されているか確認
2. マイグレーションファイルを確認: `supabase/migrations/`
3. RLS を再適用: `supabase db reset`

### 問題 3: Service Role Key がない

```
⚠️ SUPABASE_SERVICE_ROLE_KEY が未設定のため、管理者テストはスキップされます
```

**解決方法:**

これは警告であり、エラーではありません。管理者テストをスキップします。

Service Role Key を取得する場合:

1. Supabase Dashboard → Settings → API
2. `service_role` key をコピー
3. `.env.local` に設定

### 問題 4: テストデータが残る

```
Error: duplicate key value violates unique constraint
```

**解決方法:**

テスト実行後、テストデータをクリーンアップ:

```sql
-- login_attempts のテストデータ削除
DELETE FROM login_attempts WHERE email LIKE 'test-%@example.com';
```

## 📊 期待される結果

### 成功時の出力例

```bash
Running 11 tests using 1 worker

  ✓  [chromium] › rls-profiles.spec.ts:90:3 › RLS: profiles テーブル › ユーザーAは自分のプロフィールを閲覧できる (1.2s)
  ✓  [chromium] › rls-profiles.spec.ts:100:3 › RLS: profiles テーブル › ユーザーAは他人（ユーザーB）のプロフィールを閲覧できない (0.8s)
  ...

  11 passed (15.3s)
```

### 失敗時の確認方法

1. `test-results/` のスクリーンショットを確認
2. コンソールログを確認
3. Supabase Dashboard で RLS ポリシーを確認

## 🔗 関連ドキュメント

- [Issue #615 - E2E テスト追加（RLS 検証）](https://github.com/your-org/boxlog-app/issues/615)
- [Issue #611 - RLS 完全実装](https://github.com/your-org/boxlog-app/issues/611)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 📝 注意事項

### テストユーザーの管理

- テストユーザーは定期的に確認・更新する
- パスワードは定期的にローテーションする
- 不要になったテストユーザーは削除する

### CI/CD での実行

GitHub Actions で実行する場合:

1. GitHub Secrets に環境変数を設定
2. ワークフローファイルで `secrets.*` で参照
3. テスト用データベースを使用（本番 DB を使用しない）

---

**📖 最終更新**: 2025-10-24 | **バージョン**: v1.0
