# OAuth認証設定ガイド（本番環境）

本番環境（Vercel）デプロイ後に実施するOAuth認証の設定手順です。

---

## 📋 前提条件

- ✅ アプリケーションがVercelにデプロイ済み
- ✅ 本番URLが確定している（例: `https://boxlog-app.vercel.app`）
- ✅ Supabaseプロジェクトが稼働中

---

## 🔑 Google OAuth設定

### ステップ1: Google Cloud Consoleでプロジェクト作成

1. **Google Cloud Console**にアクセス
   - https://console.cloud.google.com/

2. **新規プロジェクトを作成**（または既存プロジェクトを選択）
   - プロジェクト名: `BoxLog App` (任意)
   - 「作成」をクリック

### ステップ2: OAuth同意画面の設定

1. 左メニュー → **APIとサービス** → **OAuth同意画面**

2. **ユーザータイプを選択**
   - **外部** を選択
   - 「作成」をクリック

3. **アプリ情報を入力**

   ```
   アプリ名: BoxLog
   ユーザーサポートメール: your-email@example.com
   アプリのロゴ: （任意）
   アプリのドメイン:
     - アプリケーションのホームページ: https://boxlog-app.vercel.app
   デベロッパーの連絡先情報: your-email@example.com
   ```

   - 「保存して次へ」

4. **スコープを追加**
   - 「スコープを追加または削除」をクリック
   - 以下を選択：
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - 「更新」→「保存して次へ」

5. **テストユーザー（開発中のみ）**
   - 開発中は自分のGoogleアカウントを追加
   - 本番公開時はスキップ可能
   - 「保存して次へ」

6. **概要を確認**
   - 「ダッシュボードに戻る」をクリック

### ステップ3: OAuth認証情報を作成

1. 左メニュー → **APIとサービス** → **認証情報**

2. **認証情報を作成**
   - 「+ 認証情報を作成」→「OAuthクライアントID」をクリック

3. **アプリケーションの種類を選択**
   - 「ウェブアプリケーション」を選択
   - 名前: `BoxLog Web Client` (任意)

4. **承認済みのリダイレクトURIを追加**

   **重要**: Supabaseプロジェクト固有のコールバックURLを追加

   ```
   https://qloztwfbrbqtjijxicnd.supabase.co/auth/v1/callback
   ```

   ℹ️ **URLの確認方法**:
   - Supabase Dashboard → **Authentication** → **URL Configuration**
   - 「Site URL」の下に表示される「**Callback URL (for OAuth)**」をコピー

5. **作成をクリック**

6. **クライアントIDとシークレットをコピー**
   - 表示されたポップアップから以下をコピー：
     - **クライアントID**: `123456789-abc...apps.googleusercontent.com`
     - **クライアントシークレット**: `GOCSPX-...`
   - **安全な場所に保存**（次のステップで使用）

---

## ⚙️ Supabase Dashboard設定

### ステップ4: Google Providerを有効化

1. **Supabase Dashboard**にアクセス
   - https://supabase.com/dashboard/project/qloztwfbrbqtjijxicnd

2. **Authentication設定を開く**
   - 左メニュー → **Authentication** → **Providers**

3. **Googleプロバイダーを設定**
   - 「Google」を探してクリック
   - **Enable Google Provider**: ON に切り替え
   - **Client ID**: Google Cloud ConsoleでコピーしたクライアントIDを貼り付け
   - **Client Secret**: クライアントシークレットを貼り付け
   - **Skip nonce check**: OFF（デフォルト）
   - 「Save」をクリック

### ステップ5: Redirect URLsの確認

1. **Authentication** → **URL Configuration**

2. **Redirect URLs**に以下が含まれているか確認

   ```
   https://boxlog-app.vercel.app/auth/callback
   https://boxlog-app.vercel.app/ja/auth/callback
   https://boxlog-app.vercel.app/en/auth/callback
   ```

3. **Site URL**を本番URLに設定
   ```
   https://boxlog-app.vercel.app
   ```

---

## 🍎 Apple OAuth設定（任意）

Apple Sign Inを有効化する場合：

### ステップ1: Apple Developer Programに登録

1. **Apple Developer**にアクセス
   - https://developer.apple.com/
   - Apple Developer Program登録が必要（年間99ドル）

### ステップ2: Services IDを作成

1. **Certificates, Identifiers & Profiles**を開く

2. **Identifiers** → **+** をクリック

3. **Services IDs**を選択
   - Description: `BoxLog Sign In`
   - Identifier: `com.boxlog.signin` (逆ドメイン形式)
   - 「Continue」→「Register」

4. **Sign In with Apple**を設定
   - 作成したServices IDを選択
   - 「Sign In with Apple」にチェック
   - 「Configure」をクリック
   - **Domains and Subdomains**:
     ```
     supabase.co
     ```
   - **Return URLs**:
     ```
     https://qloztwfbrbqtjijxicnd.supabase.co/auth/v1/callback
     ```
   - 「Save」→「Continue」→「Register」

### ステップ3: Supabase DashboardでApple Provider設定

1. Supabase Dashboard → **Authentication** → **Providers**

2. **Apple**を選択
   - **Enable Apple Provider**: ON
   - **Services ID**: 先ほど作成したServices ID（例: `com.boxlog.signin`）
   - **Private Key**: Apple Developer Consoleから取得したPrivate Key (.p8ファイル)
   - **Key ID**: Apple Developer Consoleで確認
   - **Team ID**: Apple Developer Consoleで確認
   - 「Save」

---

## 🧪 動作確認

### テスト手順

1. **本番環境にアクセス**
   - https://boxlog-app.vercel.app/auth/login

2. **Google Sign In**をクリック
   - Googleアカウント選択画面が表示される
   - アカウントを選択してログイン
   - `/calendar`にリダイレクトされることを確認

3. **Supabase Dashboardで確認**
   - **Authentication** → **Users**
   - 新しいユーザーが作成されているか確認
   - **Provider**列に「google」と表示される

4. **profilesテーブルの確認**
   - **Table Editor** → **profiles**
   - 新規ユーザーのプロフィールが自動作成されているか確認

---

## ⚠️ トラブルシューティング

### エラー: "redirect_uri_mismatch"

**原因**: Google Cloud ConsoleのリダイレクトURIが正しくない

**解決方法**:

1. Google Cloud Console → **認証情報** → 作成したOAuthクライアント
2. **承認済みのリダイレクトURI**を確認
3. 正しいSupabaseコールバックURLが設定されているか確認：
   ```
   https://qloztwfbrbqtjijxicnd.supabase.co/auth/v1/callback
   ```

### エラー: "OAuth configuration missing"

**原因**: Supabase DashboardでGoogle Providerが有効になっていない

**解決方法**:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Googleプロバイダーが「Enabled」になっているか確認
3. Client IDとSecretが正しく入力されているか確認

### ログイン後にprofilesレコードが作成されない

**原因**: トリガーが動作していない

**解決方法**:

1. Supabase Dashboard → **SQL Editor**
2. 以下のSQLを実行してトリガーを確認：
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. 存在しない場合は、マイグレーションSQLを再実行

---

## 📝 セキュリティチェックリスト

デプロイ前に確認：

- [ ] Google Cloud ConsoleのリダイレクトURIがSupabaseのコールバックURLと一致
- [ ] Supabase DashboardのSite URLが本番URLに設定されている
- [ ] クライアントシークレットがVercel Environment Variablesに安全に保存されている
- [ ] OAuth同意画面が適切に設定されている
- [ ] 本番環境でテストユーザー以外もログイン可能（Google OAuth同意画面を公開状態に変更）

---

## 📚 参考リンク

- **Supabase OAuth公式ドキュメント**: https://supabase.com/docs/guides/auth/social-login
- **Google OAuth設定ガイド**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Apple Sign In設定ガイド**: https://supabase.com/docs/guides/auth/social-login/auth-apple

---

**更新日**: 2025-10-14
**対象環境**: 本番環境（Vercel）
