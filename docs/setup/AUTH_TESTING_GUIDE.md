# 認証機能テストガイド

**対象**: Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
**所要時間**: 10分
**前提条件**: [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) の完了

---

## 📋 テストシナリオ

### ✅ シナリオ1: 新規サインアップ

#### 手順

1. **サインアップページにアクセス**

   ```
   http://localhost:3000/ja/auth/signup
   ```

2. **テストアカウント情報を入力**

   ```
   メールアドレス: test@example.com
   パスワード: Test1234
   ```

3. **「Create account」をクリック**

#### 期待される動作

| ステップ              | 期待される結果                                 |
| --------------------- | ---------------------------------------------- |
| 1. サインアップ       | ✅ エラーなく完了                              |
| 2. リダイレクト       | ✅ `/ja/calendar` に自動遷移                   |
| 3. セッション確立     | ✅ ページをリロードしてもログイン状態維持      |
| 4. Supabase Dashboard | ✅ Authentication → Users に新規ユーザーが表示 |

#### トラブルシューティング

**❌ エラー: `Invalid login credentials`**

- 原因: 環境変数が正しくない
- 解決: `.env.local` を確認してサーバー再起動

**❌ リダイレクトされない**

- 原因: Redirect URLsが未設定
- 解決: [SUPABASE_AUTH_SETUP.md ステップ3](./SUPABASE_AUTH_SETUP.md#ステップ3-redirect-urls-の設定)

---

### ✅ シナリオ2: サインイン

#### 手順

1. **サインアウト**（ログイン中の場合）

   ```
   ブラウザのコンソールで:
   localStorage.clear()
   location.reload()
   ```

2. **サインインページにアクセス**

   ```
   http://localhost:3000/ja/auth/login
   ```

3. **作成したアカウント情報を入力**

   ```
   メールアドレス: test@example.com
   パスワード: Test1234
   ```

4. **「Sign in」をクリック**

#### 期待される動作

| ステップ          | 期待される結果                            |
| ----------------- | ----------------------------------------- |
| 1. サインイン     | ✅ エラーなく完了                         |
| 2. リダイレクト   | ✅ `/ja/calendar` に遷移                  |
| 3. セッション確立 | ✅ ページをリロードしてもログイン状態維持 |

---

### ✅ シナリオ3: 保護ルートのアクセス制御

#### 手順

1. **サインアウト状態で保護ルートにアクセス**

   ```
   http://localhost:3000/ja/dashboard
   http://localhost:3000/ja/calendar
   http://localhost:3000/ja/settings
   ```

2. **期待される動作**
   - ✅ 自動的に `/ja/auth/login` にリダイレクト
   - ✅ URLに `?next=/ja/dashboard` などのパラメータが付く

3. **ログイン後の動作**
   - ✅ 元のページ（`/ja/dashboard`）に自動で戻る

---

### ✅ シナリオ4: セッション永続化

#### 手順

1. **ログイン状態でページをリロード**

   ```
   1. サインイン
   2. F5キーでリロード
   3. または新しいタブで同じURLを開く
   ```

2. **期待される動作**
   - ✅ ログイン状態が維持されている
   - ✅ 再度ログインを求められない

3. **ブラウザを閉じて再度開く**

   ```
   1. ブラウザを完全に終了
   2. 再度ブラウザを起動
   3. http://localhost:3000/ja/calendar にアクセス
   ```

4. **期待される動作**
   - ✅ セッションが維持されている（Cookieが有効な場合）
   - ⚠️ `Remember Me` 未実装の場合は再ログインが必要

---

### ✅ シナリオ5: サインアウト

#### 手順

1. **ログイン状態で、サインアウトボタンをクリック**

   ```
   ヘッダーまたはメニューから「Sign out」
   ```

2. **期待される動作**
   - ✅ `/ja/auth/login` にリダイレクト
   - ✅ 保護ルートにアクセスすると再度ログインページへ

3. **セッションの削除確認**
   ```javascript
   // ブラウザのコンソールで実行
   document.cookie // supabase関連のCookieが削除されているはず
   ```

---

### ✅ シナリオ6: Middleware動作確認

#### 手順

1. **ブラウザのデベロッパーツールを開く**
   - Chrome: F12 → Network タブ
   - Safari: Cmd+Option+I → Network タブ

2. **ログイン状態でページを遷移**

   ```
   /ja/calendar → /ja/dashboard → /ja/settings
   ```

3. **確認ポイント**
   - ✅ 各リクエストで `Cookie` ヘッダーにsupabase関連のCookieが含まれる
   - ✅ リダイレクトが発生していない（直接ページが表示される）

---

## 🔍 デバッグ方法

### 1. セッション状態の確認

```javascript
// ブラウザのコンソールで実行

// Cookieの確認
console.log(document.cookie)

// LocalStorageの確認（使用していないはず）
console.log(localStorage)

// SessionStorageの確認
console.log(sessionStorage)
```

### 2. Supabase Clientの動作確認

```javascript
// ブラウザのコンソールで実行
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.getUser()

console.log('User:', data.user)
console.log('Error:', error)
```

### 3. Middleware ログの確認

[middleware.ts:124](../../src/middleware.ts#L124) にログ出力があります：

```typescript
console.log('[Middleware] Redirecting to login:', request.nextUrl.pathname)
console.log('[Middleware] Redirecting to dashboard:', request.nextUrl.pathname)
```

ターミナルでこれらのログを確認してください。

---

## 📊 テスト結果チェックリスト

### 基本機能

- [ ] サインアップが成功する
- [ ] サインインが成功する
- [ ] サインアウトが成功する
- [ ] 保護ルートへのアクセスがブロックされる
- [ ] ログイン後に元のページに戻る

### セッション管理

- [ ] ページリロード後もログイン状態が維持される
- [ ] 複数タブで同じセッションが共有される
- [ ] ブラウザを再起動してもセッションが維持される（Cookie有効時）
- [ ] サインアウト後はすべてのタブでログアウトされる

### セキュリティ

- [ ] Cookie に `HttpOnly` フラグが設定されている
- [ ] Cookie に `Secure` フラグが設定されている（本番環境）
- [ ] Cookie に `SameSite=Lax` が設定されている
- [ ] パスワードが平文で送信されていない（HTTPS使用）

---

## 🚨 よくある問題と解決策

### 問題1: サインアップ後にメール確認が必要と表示される

**原因**: Supabase で Email confirmation が有効

**解決策**:

```bash
# 開発環境の場合
Supabase Dashboard → Authentication → Providers → Email
→ "Confirm email" をオフ
```

### 問題2: サインイン後にリダイレクトループが発生

**原因**: Middleware の認証チェックロジックに問題

**解決策**:

```bash
# ログを確認
# ターミナルで Middleware のログを確認

# 一時的に認証をスキップ
SKIP_AUTH_IN_DEV=true
```

### 問題3: セッションがすぐに切れる

**原因**: セッションタイムアウト設定が短い

**解決策**:

```bash
# Supabase Dashboard → Authentication → Settings
# User session timeout を 3600 (1時間) に設定
```

---

## 📈 次のステップ

すべてのテストが通ったら：

1. ✅ **RLS設定**: データベースセキュリティ
2. ✅ **E2Eテスト作成**: Playwrightで自動化
3. ✅ **OAuth設定**: Google/Apple認証

詳細は以下を参照：

- [RLS_SETUP.md](./RLS_SETUP.md)
- [E2E_TESTING.md](./E2E_TESTING.md)
- [OAUTH_SETUP.md](./OAUTH_SETUP.md)

---

## 🔗 参考リンク

- [Supabase Auth公式ドキュメント](https://supabase.com/docs/guides/auth)
- [Issue #531](https://github.com/t3-nico/boxlog-app/issues/531)
- [認証実装コード](../../src/lib/supabase/)
