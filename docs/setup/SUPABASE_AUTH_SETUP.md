# Supabase Auth セットアップガイド

**対象**: Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
**所要時間**: 15分
**前提条件**: Supabaseアカウントとプロジェクトが作成済み

---

## 📋 セットアップ手順

### ステップ1: Supabase Dashboard にアクセス

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択（または新規作成）

---

### ステップ2: API認証情報の取得

#### 2-1. Settings → API に移動

![Supabase API Settings](https://supabase.com/docs/img/api-settings.png)

#### 2-2. 以下の値をコピー

| 項目             | Supabase Dashboard          | 環境変数名                      |
| ---------------- | --------------------------- | ------------------------------- |
| **Project URL**  | `https://xxxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL`      |
| **anon public**  | `eyJhbGc...`                | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | `eyJhbGc...` ⚠️秘密         | `SUPABASE_SERVICE_ROLE_KEY`     |

#### 2-3. `.env.local` に設定

```bash
# .env.local に以下を追加（実際の値に置き換える）

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...あなたのanonキー
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...あなたのservice_roleキー
```

⚠️ **重要**: `service_role`キーは絶対にクライアント側で使用しないこと！

---

### ステップ3: Redirect URLs の設定

#### 3-1. Authentication → URL Configuration に移動

#### 3-2. **Site URL** を設定

```
開発環境: http://localhost:3000
本番環境: https://your-app.vercel.app
```

#### 3-3. **Redirect URLs** を追加

以下をすべて追加（1行ずつ入力して「Add URL」をクリック）：

```
http://localhost:3000/auth/callback
http://localhost:3000/ja/auth/callback
http://localhost:3000/en/auth/callback
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/ja/auth/callback
https://your-app.vercel.app/en/auth/callback
```

**なぜ複数必要？**

- `/auth/callback`: デフォルトルート
- `/ja/auth/callback`: 日本語ページ用
- `/en/auth/callback`: 英語ページ用

---

### ステップ4: Email Auth の有効化

#### 4-1. Authentication → Providers に移動

#### 4-2. Email を有効化

- **Enable Email provider**: ✅ オン
- **Confirm email**:
  - 開発時: ❌ オフ（テストしやすい）
  - 本番環境: ✅ オン（推奨）

#### 4-3. Email Templates のカスタマイズ（オプション）

Authentication → Email Templates で以下をカスタマイズ可能：

- Confirm signup（サインアップ確認）
- Magic Link（パスワードレスログイン）
- Reset Password（パスワードリセット）

**日本語化例**:

```html
<h2>アカウント確認</h2>
<p>以下のリンクをクリックしてメールアドレスを確認してください：</p>
<a href="{{ .ConfirmationURL }}">メールアドレスを確認</a>
```

---

### ステップ5: セキュリティ設定の確認

#### 5-1. Authentication → Settings に移動

推奨設定：

| 設定項目                   | 推奨値                  | 説明                         |
| -------------------------- | ----------------------- | ---------------------------- |
| **Site URL**               | `http://localhost:3000` | アプリのベースURL            |
| **Disable signup**         | ❌ オフ                 | 新規登録を許可               |
| **Enable phone signups**   | ❌ オフ                 | 電話認証は不要               |
| **User session timeout**   | `3600` (1時間)          | セッション有効期限           |
| **Refresh token lifetime** | `604800` (7日)          | リフレッシュトークン有効期限 |

---

## ✅ 設定完了の確認

### 1. 環境変数が正しく設定されているか確認

```bash
# ターミナルで実行
cat .env.local | grep SUPABASE
```

以下のように表示されればOK：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）して再起動
npm run dev
```

### 3. サインアップをテスト

1. ブラウザで `http://localhost:3000/ja/auth/signup` にアクセス
2. メールアドレスとパスワードを入力
3. 「Create account」をクリック

**期待される動作**:

- エラーなくサインアップが完了
- Supabase Dashboard → Authentication → Users にユーザーが追加される
- `/ja/calendar` にリダイレクトされる

---

## 🚨 トラブルシューティング

### エラー: `Invalid API key`

**原因**: 環境変数が正しく読み込まれていない

**解決策**:

1. `.env.local` のキーが正しいか確認
2. サーバーを再起動（`npm run dev`）
3. ブラウザのキャッシュをクリア

---

### エラー: `Redirect URL not allowed`

**原因**: Supabase Dashboard で Redirect URLs が設定されていない

**解決策**:

1. Authentication → URL Configuration
2. 使用するURLをすべて追加
3. 保存後、5分ほど待ってから再試行

---

### サインアップ後にメール確認が必要と表示される

**原因**: `Confirm email` が有効になっている

**解決策**:

- **開発時**: Authentication → Providers → Email → Confirm email をオフ
- **本番環境**: メールボックスを確認して確認リンクをクリック

---

### セッションが保持されない

**原因**: Cookie設定の問題

**解決策**:

1. ブラウザのCookieが有効か確認
2. Middlewareが正しく動作しているか確認：
   ```bash
   # ブラウザのコンソールで
   document.cookie
   # supabase関連のCookieが表示されるはず
   ```

---

## 📊 次のステップ

- ✅ **完了**: Supabase Auth基本設定
- 🔜 **次**: RLS（Row Level Security）設定
- 🔜 **次**: OAuth設定（Google/Apple）
- 🔜 **次**: E2Eテスト作成

詳細は Supabase公式ドキュメントを参照してください。

---

## 🔗 参考リンク

- [Supabase公式: Next.js Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Issue #531](https://github.com/t3-nico/boxlog-app/issues/531)
- [認証実装: src/lib/supabase/](../../src/lib/supabase/)
